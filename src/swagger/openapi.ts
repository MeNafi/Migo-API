import config from "../config";

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Migo API",
    version: "1.0.0",
    description: "Smart daily ride-sharing platform — Product spec v2.0",
  },
  servers: [{ url: `${config.swagger_base_url}/api/v1` }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": { get: { tags: ["Health"], security: [], summary: "Health check" } },
    "/config/public": { get: { tags: ["Health"], security: [], summary: "Public config" } },
    "/auth/register/passenger": { post: { tags: ["Auth"], security: [], summary: "Register passenger" } },
    "/auth/register/commuter": { post: { tags: ["Auth"], security: [], summary: "Register commuter" } },
    "/auth/login": { post: { tags: ["Auth"], security: [], summary: "Login" } },
    "/auth/google": { post: { tags: ["Auth"], security: [], summary: "Google OAuth" } },
    "/auth/refresh": { post: { tags: ["Auth"], security: [], summary: "Refresh access token" } },
    "/auth/logout": { post: { tags: ["Auth"], summary: "Logout" } },
    "/auth/me": { get: { tags: ["Auth"], summary: "Current user" } },
    "/auth/otp/send": { post: { tags: ["Auth"], security: [], summary: "Send phone OTP" } },
    "/auth/otp/verify": { post: { tags: ["Auth"], security: [], summary: "Verify phone OTP" } },
    "/users/me": { get: { tags: ["Users"], summary: "Get profile" }, patch: { tags: ["Users"], summary: "Update profile" } },
    "/vehicles": { get: { tags: ["Vehicles"], summary: "List vehicles" }, post: { tags: ["Vehicles"], summary: "Create vehicle" } },
    "/routes": { get: { tags: ["Routes"], summary: "List routes" }, post: { tags: ["Routes"], summary: "Create route" } },
    "/ride-requests": { get: { tags: ["Ride requests"], summary: "List requests" }, post: { tags: ["Ride requests"], summary: "Create request" } },
    "/matches/search": { post: { tags: ["Matching"], summary: "Search and rank commuter routes" } },
    "/rides": { get: { tags: ["Rides"], summary: "List rides" } },
    "/rides/{rideId}/accept": { post: { tags: ["Rides"], summary: "Accept ride" } },
    "/rides/{rideId}/otp/verify": { post: { tags: ["Rides"], summary: "Verify start OTP" } },
    "/payments/checkout": { post: { tags: ["Payments"], summary: "Create SSLCommerz checkout" } },
    "/payments/ipn": { post: { tags: ["Payments"], security: [], summary: "SSLCommerz IPN" } },
    "/conversations": { get: { tags: ["Chat"], summary: "List conversations" } },
    "/reviews": { post: { tags: ["Reviews"], summary: "Create review" } },
    "/notifications": { get: { tags: ["Notifications"], summary: "List notifications" } },
    "/admin/dashboard": { get: { tags: ["Admin"], summary: "Admin dashboard" } },
    "/admin/audit-logs": { get: { tags: ["Admin"], summary: "Audit logs" } },
  },
};


