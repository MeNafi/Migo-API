import { prisma } from "../../lib/prisma";
import { getPagination, paginationMeta } from "../../utils/pagination";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";

const list = async (userId: string, query: Record<string, unknown>) => {
  const { page, limit, skip } = getPagination(query);
  const [items, total] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { items, meta: paginationMeta(page, limit, total) };
};

const unreadCount = (userId: string) => prisma.notification.count({ where: { userId, readAt: null } });

const markRead = (userId: string, id: string) =>
  prisma.notification.updateMany({ where: { id, userId }, data: { readAt: new Date() } });

const markAll = (userId: string) =>
  prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });

const resend = async (id: string) => {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new AppError(httpStatus.NOT_FOUND, "Notification not found");
  return prisma.notification.create({
    data: {
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data as object | undefined,
    },
  });
};

export const notificationService = { list, unreadCount, markRead, markAll, resend };
