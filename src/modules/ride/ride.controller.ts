import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rideService } from "./ride.service";

const wrap =
  (fn: (req: Request) => Promise<any>, message: string, code = httpStatus.OK) =>
  catchAsync(async (req: Request, res: Response) => {
    const data = await fn(req);
    sendResponse(res, { success: true, statusCode: code, message, data });
  });

export const rideController = {
  list: wrap((req) => rideService.list(req.user!, req.query as Record<string, unknown>), "Rides fetched"),
  get: wrap((req) => rideService.get(req.params.rideId as string, req.user!), "Ride fetched"),
  accept: wrap((req) => rideService.accept(req.params.rideId as string, req.user!), "Ride accepted"),
  reject: wrap((req) => rideService.reject(req.params.rideId as string, req.user!), "Ride rejected"),
  confirm: wrap((req) => rideService.confirm(req.params.rideId as string, req.user!), "Ride confirmed"),
  start: wrap((req) => rideService.start(req.params.rideId as string, req.user!, req.body.otp), "Ride start updated"),
  complete: wrap((req) => rideService.complete(req.params.rideId as string, req.user!), "Ride completed"),
  cancel: wrap((req) => rideService.cancel(req.params.rideId as string, req.user!, req.body.reason), "Ride cancelled"),
  noShow: wrap((req) => rideService.noShow(req.params.rideId as string, req.user!, req.body.who), "No-show recorded"),
  timeline: wrap((req) => rideService.timeline(req.params.rideId as string, req.user!), "Timeline fetched"),
  otp: wrap((req) => rideService.getOtp(req.params.rideId as string, req.user!), "OTP fetched"),
  verifyOtp: wrap((req) => rideService.verifyOtp(req.params.rideId as string, req.user!, req.body.code), "OTP verified"),
  saveLocation: wrap((req) => rideService.saveLocation(req.params.rideId as string, req.user!, req.body), "Location saved"),
  latestLocation: wrap((req) => rideService.latestLocation(req.params.rideId as string, req.user!), "Latest location"),
  locationHistory: wrap((req) => rideService.locationHistory(req.params.rideId as string, req.user!), "Location history"),
  share: wrap((req) => rideService.share(req.params.rideId as string, req.user!), "Share link created"),
  revokeShare: wrap((req) => rideService.revokeShare(req.params.rideId as string, req.user!), "Share link revoked"),
};
