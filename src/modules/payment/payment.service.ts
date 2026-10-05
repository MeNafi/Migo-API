import httpStatus from "http-status";
import { randomUUID } from "crypto";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { AuthUser } from "../../types";
import { initSslCheckout, isSslConfigured, validateSslTransaction } from "../../lib/sslcommerz";
import { writeAudit } from "../../lib/audit";
import { notifyUser } from "../../lib/notify";
import { getPagination, paginationMeta } from "../../utils/pagination";

const getRidePayable = async (rideId: string, payerId: string) => {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { passengers: true, commuter: { include: { profile: true } }, route: true },
  });
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  const isPassenger = ride.passengers.some((p) => p.passengerId === payerId);
  if (!isPassenger) throw new AppError(httpStatus.FORBIDDEN, "Only the passenger can pay this contribution");
  if (!["ACCEPTED", "CONFIRMED", "COMPLETED"].includes(ride.status)) {
    throw new AppError(httpStatus.CONFLICT, "Ride is not payable in the current state");
  }
  return ride;
};

const checkout = async (user: AuthUser, payload: { rideId: string; idempotencyKey?: string }) => {
  const ride = await getRidePayable(payload.rideId, user.id);

  if (payload.idempotencyKey) {
    const existing = await prisma.payment.findUnique({ where: { idempotencyKey: payload.idempotencyKey } });
    if (existing) return existing;
  }

  const alreadyPaid = await prisma.payment.findFirst({
    where: { rideId: ride.id, payerId: user.id, status: "SUCCESS" },
  });
  if (alreadyPaid) throw new AppError(httpStatus.CONFLICT, "This ride is already paid");

  const payer = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, include: { profile: true } });
  const tranId = `MIGO-${Date.now()}-${randomUUID().slice(0, 8)}`;

  const payment = await prisma.payment.create({
    data: {
      rideId: ride.id,
      payerId: user.id,
      amount: ride.contributionBdt,
      currency: ride.currency,
      status: "PENDING",
      tranId,
      idempotencyKey: payload.idempotencyKey || tranId,
    },
  });

  if (!isSslConfigured()) {
    return {
      ...payment,
      gatewayUrl: null,
      sandboxNote:
        "SSLCommerz credentials are not set. Add SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD, then retry checkout.",
      breakdown: {
        contributionBdt: ride.contributionBdt,
        currency: ride.currency,
        route: `${ride.route.originName} → ${ride.route.destinationName}`,
        commuter: ride.commuter.profile?.fullName,
      },
    };
  }

  const session = await initSslCheckout({
    tranId,
    amount: ride.contributionBdt,
    currency: ride.currency,
    customerName: payer.profile?.fullName || "Migo Passenger",
    customerEmail: payer.email,
    customerPhone: payer.phone || undefined,
    productName: `Migo ride ${ride.id}`,
  });

  return prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PROCESSING",
      gatewayUrl: session.gatewayUrl,
      gatewaySession: session.sessionKey,
      rawResponse: session.raw as object,
    },
  });
};

const handleGateway = async (body: any, nextStatus: "SUCCESS" | "FAILED" | "CANCELLED") => {
  const tranId = body.tran_id || body.tranId;
  if (!tranId) throw new AppError(httpStatus.BAD_REQUEST, "tran_id is required");
  const payment = await prisma.payment.findUnique({ where: { tranId } });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found");

  if (nextStatus === "SUCCESS") {
    const valId = body.val_id;
    if (!valId) throw new AppError(httpStatus.BAD_REQUEST, "val_id is required to confirm payment");
    const validated = await validateSslTransaction(valId);
    const validStatuses = ["VALID", "VALIDATED"];
    if (!validated.status || !validStatuses.includes(validated.status)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Gateway did not validate this transaction", validated);
    }
    if (Number(validated.amount) !== Number(payment.amount)) {
      throw new AppError(httpStatus.CONFLICT, "Amount mismatch against gateway");
    }
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        valId,
        method: validated.card_type || body.card_type,
        paidAt: new Date(),
        rawResponse: { ...(payment.rawResponse as object), validated, callback: body },
      },
    });
    await notifyUser({
      userId: payment.payerId,
      type: "PAYMENT",
      title: "Payment successful",
      body: `Contribution of ${payment.amount} ${payment.currency} was confirmed.`,
      data: { paymentId: payment.id },
    });
    return updated;
  }

  return prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: nextStatus,
      failedAt: new Date(),
      rawResponse: { ...(payment.rawResponse as object), callback: body },
    },
  });
};

const validate = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  if (!payment.valId) throw new AppError(httpStatus.BAD_REQUEST, "Payment has no gateway val_id yet");
  const validated = await validateSslTransaction(payment.valId);
  return { payment, validated };
};

const refund = async (paymentId: string, actor: AuthUser, reason: string) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  if (payment.status !== "SUCCESS") throw new AppError(httpStatus.CONFLICT, "Only successful payments can be refunded");
  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "REFUNDED", refundedAt: new Date(), refundAmount: payment.amount },
  });
  await writeAudit({
    actorId: actor.id,
    action: "PAYMENT_REFUND",
    targetType: "Payment",
    targetId: paymentId,
    before: { status: payment.status },
    after: { status: "REFUNDED" },
    reason,
  });
  return updated;
};

const list = async (user: AuthUser, query: Record<string, unknown>) => {
  const { page, limit, skip } = getPagination(query);
  const where = user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? {} : { payerId: user.id };
  const [items, total] = await Promise.all([
    prisma.payment.findMany({ where, include: { ride: true }, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.payment.count({ where }),
  ]);
  return { items, meta: paginationMeta(page, limit, total) };
};

const get = async (paymentId: string, user: AuthUser) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { ride: true, payer: { include: { profile: true } } } });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (payment.payerId !== user.id && payment.ride.commuterId !== user.id && !isAdmin) {
    throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  }
  return payment;
};

export const paymentService = {
  checkout,
  handleGateway,
  validate,
  refund,
  list,
  get,
};
