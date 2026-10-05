import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { AuthUser } from "../../types";

const recalc = async (targetId: string) => {
  const agg = await prisma.review.aggregate({
    where: { targetId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.profile.update({
    where: { userId: targetId },
    data: {
      ratingAverage: Number((agg._avg.rating || 0).toFixed(2)),
      ratingCount: agg._count.rating,
    },
  });
};

const create = async (user: AuthUser, payload: { rideId: string; targetId: string; rating: number; comment?: string }) => {
  const ride = await prisma.ride.findUnique({
    where: { id: payload.rideId },
    include: { passengers: true },
  });
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  if (ride.status !== "COMPLETED") throw new AppError(httpStatus.CONFLICT, "Reviews are allowed after completion");
  const isPassenger = ride.passengers.some((p) => p.passengerId === user.id);
  const isCommuter = ride.commuterId === user.id;
  if (!isPassenger && !isCommuter) throw new AppError(httpStatus.FORBIDDEN, "Not a participant");
  if (payload.rating < 1 || payload.rating > 5) throw new AppError(httpStatus.BAD_REQUEST, "Rating must be 1-5");

  const review = await prisma.review.create({
    data: {
      rideId: payload.rideId,
      authorId: user.id,
      targetId: payload.targetId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });
  await recalc(payload.targetId);
  return review;
};

const byRide = (rideId: string) => prisma.review.findMany({ where: { rideId }, include: { author: { include: { profile: true } } } });
const byUser = (userId: string) =>
  prisma.review.findMany({
    where: { targetId: userId },
    include: { author: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  });

const update = async (reviewId: string, user: AuthUser, payload: { rating?: number; comment?: string }) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (review.authorId !== user.id && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  const updated = await prisma.review.update({ where: { id: reviewId }, data: payload });
  await recalc(review.targetId);
  return updated;
};

const remove = async (reviewId: string, user: AuthUser) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (review.authorId !== user.id && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  await prisma.review.delete({ where: { id: reviewId } });
  await recalc(review.targetId);
};

export const reviewService = { create, byRide, byUser, update, remove };
