import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reportService } from "./report.service";

const createReport = catchAsync(async (req: Request, res: Response) => {
  const data = await reportService.createReport(req.user!.id, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Report submitted", data });
});

const getReport = catchAsync(async (req: Request, res: Response) => {
  const data = await reportService.getReport(req.params.reportId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Report fetched", data });
});

const evidence = catchAsync(async (req: Request, res: Response) => {
  const data = await reportService.addEvidence(req.params.reportId as string, req.user!, req.body.fileUrl);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Evidence attached", data });
});

const emergency = catchAsync(async (req: Request, res: Response) => {
  const data = await reportService.emergency(req.user!, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Emergency recorded", data });
});

const createTicket = catchAsync(async (req: Request, res: Response) => {
  const data = await reportService.createTicket(req.user!.id, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Support ticket created", data });
});

const listTickets = catchAsync(async (req: Request, res: Response) => {
  const data = await reportService.listTickets(req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Tickets fetched", data });
});

const getTicket = catchAsync(async (req: Request, res: Response) => {
  const data = await reportService.getTicket(req.params.ticketId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Ticket fetched", data });
});

export const reportController = {
  createReport,
  getReport,
  evidence,
  emergency,
  createTicket,
  listTickets,
  getTicket,
};
