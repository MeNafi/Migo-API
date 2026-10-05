import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { vehicleService } from "./vehicle.service";

const create = catchAsync(async (req: Request, res: Response) => {
  const data = await vehicleService.create(req.user!.id, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Vehicle created", data });
});

const list = catchAsync(async (req: Request, res: Response) => {
  const data = await vehicleService.listMine(req.user!.id);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Vehicles fetched", data });
});

const get = catchAsync(async (req: Request, res: Response) => {
  const data = await vehicleService.get(req.params.vehicleId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Vehicle fetched", data });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const data = await vehicleService.update(req.params.vehicleId as string, req.user!, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Vehicle updated", data });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const data = await vehicleService.remove(req.params.vehicleId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Vehicle removed", data });
});

const documents = catchAsync(async (req: Request, res: Response) => {
  const data = await vehicleService.addDocument(req.params.vehicleId as string, req.user!, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Document registered", data });
});

const verification = catchAsync(async (req: Request, res: Response) => {
  const data = await vehicleService.verification(req.params.vehicleId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Verification status", data });
});

const resubmit = catchAsync(async (req: Request, res: Response) => {
  const data = await vehicleService.resubmit(req.params.vehicleId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Verification resubmitted", data });
});

export const vehicleController = {
  create,
  list,
  get,
  update,
  remove,
  documents,
  verification,
  resubmit,
};
