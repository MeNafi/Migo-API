import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { pingRedis } from "../../lib/redis";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import httpStatus from "http-status";
import config from "../../config";

const router = Router();

router.get(
  "/health",
  catchAsync(async (_req, res) => {
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Migo API is healthy",
      data: {
        service: "migo-backend",
        env: config.env,
        timestamp: new Date().toISOString(),
      },
    });
  })
);

router.get(
  "/health/db",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  catchAsync(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Database connected",
      data: { connected: true },
    });
  })
);

router.get(
  "/health/redis",
  auth(Role.ADMIN, Role.SUPER_ADMIN),
  catchAsync(async (_req, res) => {
    const result = await pingRedis();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: result.connected ? "Redis connected" : "Redis not connected",
      data: result,
    });
  })
);

router.get(
  "/config/public",
  catchAsync(async (_req, res) => {
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Public configuration",
      data: {
        app: "Migo",
        currency: "BDT",
        matchWeights: config.match_weights,
        sslcommerzEnabled: Boolean(config.sslcommerz.store_id),
        googleOAuthEnabled: Boolean(config.google_client_id),
        realtime: true,
      },
    });
  })
);

export const healthRoutes = router;
