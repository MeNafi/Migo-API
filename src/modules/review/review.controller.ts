import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";

const create = catchAsync(async (req: Request, res: Response) => {
  const data = await reviewService.create(req.user!, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Review submitted", data });
});

const byRide = catchAsync(async (req: Request, res: Response) => {
  const data = await reviewService.byRide(req.params.rideId as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Ride reviews", data });
});

const byUser = catchAsync(async (req: Request, res: Response) => {
  const data = await reviewService.byUser(req.params.userId as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "User reviews", data });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const data = await reviewService.update(req.params.reviewId as string, req.user!, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Review updated", data });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  await reviewService.remove(req.params.reviewId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Review deleted", data: null });
});

export const reviewController = { create, byRide, byUser, update, remove };
