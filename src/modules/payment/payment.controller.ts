import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";
import config from "../../config";

const checkout = catchAsync(async (req: Request, res: Response) => {
  const data = await paymentService.checkout(req.user!, req.body);
  sendResponse(res, { success: true, statusCode: httpStatus.CREATED, message: "Checkout session created", data });
});

const list = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.list(req.user!, req.query as Record<string, unknown>);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payments fetched",
    data: result.items,
    meta: result.meta,
  });
});

const get = catchAsync(async (req: Request, res: Response) => {
  const data = await paymentService.get(req.params.paymentId as string, req.user!);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Payment fetched", data });
});

const success = catchAsync(async (req: Request, res: Response) => {
  const data = await paymentService.handleGateway({ ...req.body, ...req.query }, "SUCCESS");
  if (req.headers.accept?.includes("text/html")) {
    return res.redirect(`${config.client_url}/payment/success?tran_id=${data.tranId}`);
  }
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Payment validated", data });
});

const fail = catchAsync(async (req: Request, res: Response) => {
  const data = await paymentService.handleGateway({ ...req.body, ...req.query }, "FAILED");
  if (req.headers.accept?.includes("text/html")) {
    return res.redirect(`${config.client_url}/payment/fail?tran_id=${data.tranId}`);
  }
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Payment failed", data });
});

const cancel = catchAsync(async (req: Request, res: Response) => {
  const data = await paymentService.handleGateway({ ...req.body, ...req.query }, "CANCELLED");
  if (req.headers.accept?.includes("text/html")) {
    return res.redirect(`${config.client_url}/payment/cancel?tran_id=${data.tranId}`);
  }
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Payment cancelled", data });
});

const ipn = catchAsync(async (req: Request, res: Response) => {
  const status = String(req.body.status || "").toUpperCase();
  const next = status === "VALID" || status === "VALIDATED" ? "SUCCESS" : "FAILED";
  const data = await paymentService.handleGateway(req.body, next);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "IPN processed", data });
});

const validate = catchAsync(async (req: Request, res: Response) => {
  const data = await paymentService.validate(req.params.paymentId as string);
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Gateway validation", data });
});

const refund = catchAsync(async (req: Request, res: Response) => {
  const data = await paymentService.refund(req.params.paymentId as string, req.user!, req.body.reason || "Admin refund");
  sendResponse(res, { success: true, statusCode: httpStatus.OK, message: "Refund recorded", data });
});

const status = catchAsync(async (req: Request, res: Response) => {
  const data = await paymentService.get(req.params.paymentId as string, req.user!);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment status",
    data: { status: data.status, amount: data.amount },
  });
});

export const paymentController = {
  checkout,
  list,
  get,
  success,
  fail,
  cancel,
  ipn,
  validate,
  refund,
  status,
};
