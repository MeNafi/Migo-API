import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { routeService } from "./route.service";

const create = catchAsync(async (req: Request, res: Response) => {
  const data = await routeService.create(req.user!.id, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Route created", data });
});

const list = catchAsync(async (req: Request, res: Response) => {
  const data = await routeService.listMine(req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Routes fetched", data });
});

const get = catchAsync(async (req: Request, res: Response) => {
  const data = await routeService.get(req.params.routeId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Route fetched", data });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const data = await routeService.update(req.params.routeId as string, req.user!, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Route updated", data });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const data = await routeService.deactivate(req.params.routeId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Route deactivated", data });
});

const pause = catchAsync(async (req: Request, res: Response) => {
  const data = await routeService.setStatus(req.params.routeId as string, req.user!, "PAUSED");
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Route paused", data });
});

const resume = catchAsync(async (req: Request, res: Response) => {
  const data = await routeService.setStatus(req.params.routeId as string, req.user!, "ACTIVE");
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Route resumed", data });
});

const addSchedule = catchAsync(async (req: Request, res: Response) => {
  const data = await routeService.addSchedule(req.params.routeId as string, req.user!, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Schedule created", data });
});

const listSchedules = catchAsync(async (req: Request, res: Response) => {
  const data = await routeService.listSchedules(req.params.routeId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Schedules fetched", data });
});

const updateSchedule = catchAsync(async (req: Request, res: Response) => {
  const data = await routeService.updateSchedule(
    req.params.routeId as string,
    req.params.scheduleId as string,
    req.user!,
    req.body
  );
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Schedule updated", data });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
  await routeService.deleteSchedule(req.params.routeId as string, req.params.scheduleId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Schedule deleted", data: null });
});

const setAvailability = catchAsync(async (req: Request, res: Response) => {
  const data = await routeService.setAvailability(req.params.routeId as string, req.user!, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Availability saved", data });
});

const listAvailability = catchAsync(async (req: Request, res: Response) => {
  const data = await routeService.listAvailability(req.params.routeId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Availability fetched", data });
});

export const routeController = {
  create,
  list,
  get,
  update,
  remove,
  pause,
  resume,
  addSchedule,
  listSchedules,
  updateSchedule,
  deleteSchedule,
  setAvailability,
  listAvailability,
};
