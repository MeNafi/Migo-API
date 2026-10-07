import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { conversationService } from "./conversation.service";

const list = catchAsync(async (req: Request, res: Response) => {
  const data = await conversationService.list(req.user!.id);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Conversations fetched", data });
});

const open = catchAsync(async (req: Request, res: Response) => {
  const data = await conversationService.open(req.user!.id, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Conversation opened", data });
});

const get = catchAsync(async (req: Request, res: Response) => {
  const data = await conversationService.get(req.params.conversationId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Conversation fetched", data });
});

const messages = catchAsync(async (req: Request, res: Response) => {
  const result = await conversationService.messages(
    req.params.conversationId as string,
    req.user!,
    req.query as Record<string, unknown>
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Messages fetched",
    data: result.items,
    meta: result.meta,
  });
});

const send = catchAsync(async (req: Request, res: Response) => {
  const data = await conversationService.send(req.params.conversationId as string, req.user!, req.body.content);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Message sent", data });
});

const read = catchAsync(async (req: Request, res: Response) => {
  await conversationService.markRead(req.params.conversationId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Marked as read", data: null });
});

const report = catchAsync(async (req: Request, res: Response) => {
  const data = await conversationService.report(req.params.conversationId as string, req.user!, req.body.reason || "Reported chat");
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Chat reported", data });
});

export const conversationController = { list, open, get, messages, send, read, report };

