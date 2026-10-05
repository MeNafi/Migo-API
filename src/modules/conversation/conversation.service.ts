import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { AuthUser } from "../../types";
import { getPagination, paginationMeta } from "../../utils/pagination";

const assertMember = async (conversationId: string, user: AuthUser) => {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) throw new AppError(httpStatus.NOT_FOUND, "Conversation not found");
  const isMember = [conversation.participantA, conversation.participantB].includes(user.id);
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (!isMember && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Not a conversation participant");
  return conversation;
};

const list = (userId: string) =>
  prisma.conversation.findMany({
    where: { OR: [{ participantA: userId }, { participantB: userId }] },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      ride: { select: { id: true, status: true, date: true } },
    },
    orderBy: { lastMessageAt: "desc" },
  });

const open = async (userId: string, payload: { rideId?: string; userId?: string }) => {
  if (payload.rideId) {
    const existing = await prisma.conversation.findUnique({ where: { rideId: payload.rideId } });
    if (existing) return existing;
    const ride = await prisma.ride.findUnique({
      where: { id: payload.rideId },
      include: { passengers: true },
    });
    if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
    const passengerId = ride.passengers[0]?.passengerId;
    if (!passengerId) throw new AppError(httpStatus.BAD_REQUEST, "Ride has no passenger");
    return prisma.conversation.create({
      data: { rideId: ride.id, participantA: ride.commuterId, participantB: passengerId },
    });
  }
  throw new AppError(httpStatus.BAD_REQUEST, "rideId is required");
};

const get = (conversationId: string, user: AuthUser) => assertMember(conversationId, user);

const messages = async (conversationId: string, user: AuthUser, query: Record<string, unknown>) => {
  await assertMember(conversationId, user);
  const { page, limit, skip } = getPagination(query);
  const [items, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.message.count({ where: { conversationId } }),
  ]);
  return { items, meta: paginationMeta(page, limit, total) };
};

const send = async (conversationId: string, user: AuthUser, content: string) => {
  await assertMember(conversationId, user);
  const message = await prisma.message.create({
    data: { conversationId, senderId: user.id, content: content.slice(0, 2000) },
  });
  await prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } });
  return message;
};

const markRead = async (conversationId: string, user: AuthUser) => {
  await assertMember(conversationId, user);
  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: user.id }, readAt: null },
    data: { readAt: new Date() },
  });
};

const report = async (conversationId: string, user: AuthUser, reason: string) => {
  await assertMember(conversationId, user);
  return prisma.report.create({
    data: {
      reporterId: user.id,
      category: "CHAT",
      description: reason,
      evidenceUrls: { conversationId },
    },
  });
};

export const conversationService = { list, open, get, messages, send, markRead, report };
