import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { matchService } from "./match.service";

const search = catchAsync(async (req: Request, res: Response) => {
  const data = await matchService.search(req.user!.id, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Matches ranked", data });
});

const get = catchAsync(async (req: Request, res: Response) => {
  const data = await matchService.getMatch(req.params.matchId as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Match fetched", data });
});

const select = catchAsync(async (req: Request, res: Response) => {
  const data = await matchService.selectMatch(req.params.matchId as string, req.user!.id);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Match selected", data });
});

const request = catchAsync(async (req: Request, res: Response) => {
  const data = await matchService.requestMatch(req.params.matchId as string, req.user!.id);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Ride requested from match", data });
});

const refresh = catchAsync(async (req: Request, res: Response) => {
  const data = await matchService.refreshMatch(req.params.matchId as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Match recalculated", data });
});

export const matchController = { search, get, select, request, refresh };
