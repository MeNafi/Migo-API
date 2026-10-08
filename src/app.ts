import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import config from "./config";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { healthRoutes } from "./modules/health/health.route";
import { authRoutes } from "./auth/auth.routes";
import { userRoutes } from "./modules/user/user.route";
import { vehicleRoutes } from "./modules/vehicle/vehicle.route";
import { routeRoutes } from "./modules/route/route.route";
import { rideRequestRoutes } from "./modules/rideRequest/rideRequest.route";
import { matchRoutes } from "./modules/match/match.route";
import { rideRoutes } from "./modules/ride/ride.route";
import { conversationRoutes } from "./modules/conversation/conversation.route";
import { reviewRoutes } from "./modules/review/review.route";
import { notificationRoutes } from "./modules/notification/notification.route";
import { paymentRoutes } from "./modules/payment/payment.route";
import { reportRoutes } from "./modules/report/report.route";
import { adminRoutes } from "./modules/admin/admin.route";
import { openApiSpec } from "./swagger/openapi";

const app: Application = express();

app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: config.cors_origins,
    credentials: true,
  })
);
app.use(morgan(config.env === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Migo API",
    docs: "/docs",
    health: "/api/v1/health",
  });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec as any));

const v1 = express.Router();
v1.use(healthRoutes);
v1.use("/auth", authRoutes);
v1.use("/users", userRoutes);
v1.use("/vehicles", vehicleRoutes);
v1.use("/routes", routeRoutes);
v1.use("/ride-requests", rideRequestRoutes);
v1.use("/matches", matchRoutes);
v1.use("/rides", rideRoutes);
v1.use("/conversations", conversationRoutes);
v1.use("/reviews", reviewRoutes);
v1.use("/notifications", notificationRoutes);
v1.use("/payments", paymentRoutes);
v1.use(reportRoutes);
v1.use("/admin", adminRoutes);

app.use("/api/v1", v1);
app.use(notFound);
app.use(globalErrorHandler);

export default app;

