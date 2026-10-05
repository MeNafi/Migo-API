import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rideRequestService } from "./rideRequest.service";

const create = catchAsync(async (req: Request, res: Response) => {
  const data = await rideRequestService.create(req.user!.id, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Ride request created", data });
});

const list = catchAsync(async (req: Request, res: Response) => {
  const result = await rideRequestService.list(req.user!, req.query as Record<string, unknown>);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Requests fetched",
    data: result.items,
    meta: result.meta,
  });
});

const get = catchAsync(async (req: Request, res: Response) => {
  const data = await rideRequestService.get(req.params.requestId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Request fetched", data });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const data = await rideRequestService.update(req.params.requestId as string, req.user!.id, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Request updated", data });
});

const cancel = catchAsync(async (req: Request, res: Response) => {
  const data = await rideRequestService.cancel(req.params.requestId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Request cancelled", data });
});

const match = catchAsync(async (req: Request, res: Response) => {
  const data = await rideRequestService.match(req.params.requestId as string, req.user!.id);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Matches generated", data });
});

const matches = catchAsync(async (req: Request, res: Response) => {
  const data = await rideRequestService.matches(req.params.requestId as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Matches fetched", data });
});

export const rideRequestController = { create, list, get, update, cancel, match, matches };
