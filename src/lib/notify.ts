import { NotificationType } from "../../generated/prisma/enums";
import { prisma } from "./prisma";
import { getIO } from "../socket";

export const notifyUser = async (input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) => {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data as object | undefined,
    },
  });

  try {
    getIO()?.to(`user:${input.userId}`).emit("notification:new", notification);
  } catch {
    // socket is optional during seed / tests
  }

  return notification;
};
