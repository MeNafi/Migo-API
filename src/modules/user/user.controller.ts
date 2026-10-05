import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { userService } from "./user.service";

const getMe = catchAsync(async (req: Request, res: Response) => {
  const data = await userService.getMe(req.user!.id);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Profile fetched", data });
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
  const data = await userService.updateMe(req.user!.id, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Profile updated", data });
});

const updatePhoto = catchAsync(async (req: Request, res: Response) => {
  const data = await userService.updatePhoto(req.user!.id, req.body.photoUrl);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Photo updated", data });
});

const updateEmergency = catchAsync(async (req: Request, res: Response) => {
  const data = await userService.updateEmergency(req.user!.id, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Emergency contact updated", data });
});

const getPreferences = catchAsync(async (req: Request, res: Response) => {
  const data = await userService.getPreferences(req.user!.id);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Preferences fetched", data });
});

const updatePreferences = catchAsync(async (req: Request, res: Response) => {
  const data = await userService.updatePreferences(req.user!.id, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Preferences updated", data });
});

const getPublic = catchAsync(async (req: Request, res: Response) => {
  const data = await userService.getPublicProfile(req.params.userId as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Public profile", data });
});

const getReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getUserReviews(req.params.userId as string, req.query as Record<string, unknown>);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews fetched",
    data: result.items,
    meta: result.meta,
  });
});

const block = catchAsync(async (req: Request, res: Response) => {
  const data = await userService.blockUser(req.user!.id, req.params.userId as string, req.body.reason);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "User blocked", data });
});

const unblock = catchAsync(async (req: Request, res: Response) => {
  await userService.unblockUser(req.user!.id, req.params.userId as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Block removed", data: null });
});

export const userController = {
  getMe,
  updateMe,
  updatePhoto,
  updateEmergency,
  getPreferences,
  updatePreferences,
  getPublic,
  getReviews,
  block,
  unblock,
};
