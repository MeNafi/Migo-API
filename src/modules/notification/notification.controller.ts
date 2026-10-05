import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { notificationService } from "./notification.service";

const list = catchAsync(async (req: Request, res: Response) => {
  const result = await notificationService.list(req.user!.id, req.query as Record<string, unknown>);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Notifications fetched",
    data: result.items,
    meta: result.meta,
  });
});

const unread = catchAsync(async (req: Request, res: Response) => {
  const count = await notificationService.unreadCount(req.user!.id);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Unread count", data: { count } });
});

const read = catchAsync(async (req: Request, res: Response) => {
  await notificationService.markRead(req.user!.id, req.params.notificationId as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Marked as read", data: null });
});

const readAll = catchAsync(async (req: Request, res: Response) => {
  await notificationService.markAll(req.user!.id);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "All notifications marked as read", data: null });
});

const resend = catchAsync(async (req: Request, res: Response) => {
  const data = await notificationService.resend(req.params.notificationId as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Notification resent", data });
});

export const notificationController = { list, unread, read, readAll, resend };
