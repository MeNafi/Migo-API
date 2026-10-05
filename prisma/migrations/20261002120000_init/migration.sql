-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PASSENGER', 'COMMUTER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'BLOCKED');
CREATE TYPE "VerificationType" AS ENUM ('IDENTITY', 'VEHICLE', 'LICENSE');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RESUBMISSION_REQUESTED');
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'BIKE', 'MICROBUS', 'SUV', 'OTHER');
CREATE TYPE "RouteStatus" AS ENUM ('ACTIVE', 'PAUSED', 'INACTIVE');
CREATE TYPE "RideRequestStatus" AS ENUM ('OPEN', 'MATCHED', 'ACCEPTED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "MatchStatus" AS ENUM ('SUGGESTED', 'SELECTED', 'REQUESTED', 'ACCEPTED', 'REJECTED', 'EXPIRED');
CREATE TYPE "RideStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'CONFIRMED', 'ARRIVING', 'STARTED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'REJECTED', 'EXPIRED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'ESCALATED', 'RESOLVED', 'CLOSED');
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE "NotificationType" AS ENUM ('RIDE_REQUEST', 'RIDE_ACCEPTED', 'RIDE_REJECTED', 'RIDE_STARTED', 'RIDE_COMPLETED', 'RIDE_CANCELLED', 'PAYMENT', 'VERIFICATION', 'CHAT', 'SYSTEM', 'SAFETY');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PASSENGER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerifiedAt" TIMESTAMP(3),
    "phoneVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");

CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "gender" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "bio" TEXT,
    "emergencyName" TEXT,
    "emergencyPhone" TEXT,
    "emergencyRelation" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "smokingPreference" TEXT,
    "musicPreference" TEXT,
    "chatPreference" TEXT,
    "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "completedRides" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");
CREATE INDEX "refresh_tokens_tokenHash_idx" ON "refresh_tokens"("tokenHash");
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "purpose" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "otp_codes_phone_purpose_idx" ON "otp_codes"("phone", "purpose");
CREATE INDEX "otp_codes_email_purpose_idx" ON "otp_codes"("email", "purpose");
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "user_blocks" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_blocks_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_blocks_blockerId_blockedId_key" ON "user_blocks"("blockerId", "blockedId");
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT,
    "registrationNo" TEXT NOT NULL,
    "year" INTEGER,
    "seats" INTEGER NOT NULL,
    "ac" BOOLEAN NOT NULL DEFAULT true,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "vehicles_registrationNo_key" ON "vehicles"("registrationNo");
CREATE INDEX "vehicles_ownerId_idx" ON "vehicles"("ownerId");
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "vehicle_documents" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vehicle_documents_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "vehicle_documents" ADD CONSTRAINT "vehicle_documents_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "type" "VerificationType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "documentUrls" JSONB NOT NULL,
    "notes" TEXT,
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "verifications_status_idx" ON "verifications"("status");
CREATE INDEX "verifications_userId_idx" ON "verifications"("userId");
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "title" TEXT,
    "originName" TEXT NOT NULL,
    "originLat" DOUBLE PRECISION NOT NULL,
    "originLng" DOUBLE PRECISION NOT NULL,
    "destinationName" TEXT NOT NULL,
    "destinationLat" DOUBLE PRECISION NOT NULL,
    "destinationLng" DOUBLE PRECISION NOT NULL,
    "polyline" TEXT,
    "distanceKm" DOUBLE PRECISION,
    "durationMin" INTEGER,
    "seats" INTEGER NOT NULL,
    "contributionBdt" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "status" "RouteStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "routes_ownerId_status_idx" ON "routes"("ownerId", "status");
ALTER TABLE "routes" ADD CONSTRAINT "routes_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "routes" ADD CONSTRAINT "routes_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "route_schedules" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "daysOfWeek" INTEGER[],
    "departureTime" TEXT NOT NULL,
    "returnTime" TEXT,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "route_schedules_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "route_schedules_routeId_idx" ON "route_schedules"("routeId");
ALTER TABLE "route_schedules" ADD CONSTRAINT "route_schedules_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "route_availabilities" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "isAvailable" BOOLEAN NOT NULL,
    "seats" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "route_availabilities_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "route_availabilities_routeId_date_key" ON "route_availabilities"("routeId", "date");
ALTER TABLE "route_availabilities" ADD CONSTRAINT "route_availabilities_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ride_requests" (
    "id" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "pickupName" TEXT NOT NULL,
    "pickupLat" DOUBLE PRECISION NOT NULL,
    "pickupLng" DOUBLE PRECISION NOT NULL,
    "destinationName" TEXT NOT NULL,
    "destinationLat" DOUBLE PRECISION NOT NULL,
    "destinationLng" DOUBLE PRECISION NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "status" "RideRequestStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ride_requests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ride_requests_passengerId_status_idx" ON "ride_requests"("passengerId", "status");
ALTER TABLE "ride_requests" ADD CONSTRAINT "ride_requests_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ride_matches" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "routeSimilarity" DOUBLE PRECISION NOT NULL,
    "pickupProximity" DOUBLE PRECISION NOT NULL,
    "destProximity" DOUBLE PRECISION NOT NULL,
    "timeCompatibility" DOUBLE PRECISION NOT NULL,
    "scheduleOverlap" DOUBLE PRECISION NOT NULL,
    "estimatedPickupKm" DOUBLE PRECISION NOT NULL,
    "estimatedDestKm" DOUBLE PRECISION NOT NULL,
    "contributionBdt" DOUBLE PRECISION NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'SUGGESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ride_matches_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ride_matches_requestId_routeId_key" ON "ride_matches"("requestId", "routeId");
CREATE INDEX "ride_matches_requestId_idx" ON "ride_matches"("requestId");
ALTER TABLE "ride_matches" ADD CONSTRAINT "ride_matches_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ride_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ride_matches" ADD CONSTRAINT "ride_matches_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "rides" (
    "id" TEXT NOT NULL,
    "requestId" TEXT,
    "matchId" TEXT,
    "routeId" TEXT NOT NULL,
    "commuterId" TEXT NOT NULL,
    "status" "RideStatus" NOT NULL DEFAULT 'REQUESTED',
    "date" DATE NOT NULL,
    "departureTime" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "contributionBdt" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "otpCode" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "cancelledById" TEXT,
    "noShowBy" TEXT,
    "notes" TEXT,
    "shareToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "rides_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "rides_shareToken_key" ON "rides"("shareToken");
CREATE INDEX "rides_commuterId_status_idx" ON "rides"("commuterId", "status");
CREATE INDEX "rides_status_date_idx" ON "rides"("status", "date");
ALTER TABLE "rides" ADD CONSTRAINT "rides_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ride_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "rides" ADD CONSTRAINT "rides_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "ride_matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "rides" ADD CONSTRAINT "rides_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "rides" ADD CONSTRAINT "rides_commuterId_fkey" FOREIGN KEY ("commuterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "ride_passengers" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 1,
    "pickupName" TEXT,
    "pickupLat" DOUBLE PRECISION,
    "pickupLng" DOUBLE PRECISION,
    "dropName" TEXT,
    "dropLat" DOUBLE PRECISION,
    "dropLng" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ride_passengers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ride_passengers_rideId_passengerId_key" ON "ride_passengers"("rideId", "passengerId");
ALTER TABLE "ride_passengers" ADD CONSTRAINT "ride_passengers_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ride_passengers" ADD CONSTRAINT "ride_passengers_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "ride_locations" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "heading" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ride_locations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ride_locations_rideId_recordedAt_idx" ON "ride_locations"("rideId", "recordedAt");
ALTER TABLE "ride_locations" ADD CONSTRAINT "ride_locations_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ride_events" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actorId" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ride_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ride_events_rideId_createdAt_idx" ON "ride_events"("rideId", "createdAt");
ALTER TABLE "ride_events" ADD CONSTRAINT "ride_events_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" TEXT,
    "gateway" TEXT NOT NULL DEFAULT 'SSLCOMMERZ',
    "tranId" TEXT NOT NULL,
    "valId" TEXT,
    "gatewaySession" TEXT,
    "gatewayUrl" TEXT,
    "idempotencyKey" TEXT,
    "rawResponse" JSONB,
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "payments_tranId_key" ON "payments"("tranId");
CREATE UNIQUE INDEX "payments_idempotencyKey_key" ON "payments"("idempotencyKey");
CREATE INDEX "payments_payerId_idx" ON "payments"("payerId");
CREATE INDEX "payments_status_idx" ON "payments"("status");
ALTER TABLE "payments" ADD CONSTRAINT "payments_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "ratings_reviews" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ratings_reviews_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ratings_reviews_rideId_authorId_targetId_key" ON "ratings_reviews"("rideId", "authorId", "targetId");
ALTER TABLE "ratings_reviews" ADD CONSTRAINT "ratings_reviews_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ratings_reviews" ADD CONSTRAINT "ratings_reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ratings_reviews" ADD CONSTRAINT "ratings_reviews_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "rideId" TEXT,
    "participantA" TEXT NOT NULL,
    "participantB" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "conversations_rideId_key" ON "conversations"("rideId");
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participantA_fkey" FOREIGN KEY ("participantA") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_participantB_fkey" FOREIGN KEY ("participantB") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "rideId" TEXT,
    "messageId" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceUrls" JSONB,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "reports_status_idx" ON "reports"("status");
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "reportId" TEXT,
    "rideId" TEXT,
    "paymentId" TEXT,
    "type" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "assigneeId" TEXT,
    "decision" TEXT,
    "reason" TEXT,
    "evidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "disputes_status_idx" ON "disputes"("status");

CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "reason" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_targetType_targetId_idx" ON "audit_logs"("targetType", "targetId");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");
