import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const corsOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export default {
  env: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  database_url: process.env.DATABASE_URL || "",
  client_url: process.env.CLIENT_URL || "http://localhost:3000",
  cors_origins: corsOrigins,
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
  jwt_access_secret: process.env.JWT_ACCESS_SECRET || "change-me-access-secret",
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || "change-me-refresh-secret",
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  google_client_id: process.env.GOOGLE_CLIENT_ID || "",
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
  redis_url: process.env.REDIS_URL || "",
  swagger_base_url: process.env.SWAGGER_BASE_URL || "http://localhost:5000",
  dev_return_otp: process.env.DEV_RETURN_OTP !== "false",
  sslcommerz: {
    store_id: process.env.SSLCOMMERZ_STORE_ID || "",
    store_password: process.env.SSLCOMMERZ_STORE_PASSWORD || "",
    is_live: process.env.SSLCOMMERZ_IS_LIVE === "true",
    success_url: process.env.SSLCOMMERZ_SUCCESS_URL || "http://localhost:3000/payment/success",
    fail_url: process.env.SSLCOMMERZ_FAIL_URL || "http://localhost:3000/payment/fail",
    cancel_url: process.env.SSLCOMMERZ_CANCEL_URL || "http://localhost:3000/payment/cancel",
    ipn_url: process.env.SSLCOMMERZ_IPN_URL || "http://localhost:5000/api/v1/payments/ipn",
  },
  match_weights: {
    routeSimilarity: 0.4,
    pickupProximity: 0.2,
    destProximity: 0.15,
    timeCompatibility: 0.15,
    scheduleOverlap: 0.1,
  },
};
