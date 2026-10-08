import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import config from "../config";
import { jwtUtils } from "../utils/jwt";
import { prisma } from "../lib/prisma";

let io: Server | null = null;

export const getIO = () => io;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors_origins,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string) ||
        (socket.handshake.headers.authorization as string)?.replace("Bearer ", "");
      if (!token) return next(new Error("Authentication required"));
      const verified = jwtUtils.verifyToken(token, config.jwt_access_secret);
      if (!verified.success) return next(new Error("Invalid token"));
      socket.data.userId = verified.data.id;
      socket.data.role = verified.data.role;
      next();
    } catch (error) {
      next(error as Error);
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);

    socket.on("ride:join", async (rideId: string) => {
      const ride = await prisma.ride.findUnique({
        where: { id: rideId },
        include: { passengers: true },
      });
      if (!ride) return;
      const isParticipant =
        ride.commuterId === userId || ride.passengers.some((p) => p.passengerId === userId);
      const isAdmin = socket.data.role === "ADMIN" || socket.data.role === "SUPER_ADMIN";
      if (isParticipant || isAdmin) {
        socket.join(`ride:${rideId}`);
        socket.emit("ride:joined", { rideId });
      }
    });

    socket.on("ride:location:update", async (payload: { rideId: string; lat: number; lng: number; heading?: number; speed?: number }) => {
      const ride = await prisma.ride.findUnique({ where: { id: payload.rideId } });
      if (!ride || ride.commuterId !== userId) return;
      if (!["CONFIRMED", "ARRIVING", "STARTED"].includes(ride.status)) return;

      const last = await prisma.rideLocation.findFirst({
        where: { rideId: payload.rideId },
        orderBy: { recordedAt: "desc" },
      });
      const shouldPersist =
        !last || Date.now() - last.recordedAt.getTime() > 8000;

      if (shouldPersist) {
        await prisma.rideLocation.create({
          data: {
            rideId: payload.rideId,
            lat: payload.lat,
            lng: payload.lng,
            heading: payload.heading,
            speed: payload.speed,
          },
        });
      }

      io?.to(`ride:${payload.rideId}`).emit("ride:location:update", {
        rideId: payload.rideId,
        lat: payload.lat,
        lng: payload.lng,
        heading: payload.heading,
        speed: payload.speed,
        at: new Date().toISOString(),
      });
    });

    socket.on("chat:message", async (payload: { conversationId: string; content: string }) => {
      const conversation = await prisma.conversation.findUnique({
        where: { id: payload.conversationId },
      });
      if (!conversation) return;
      if (![conversation.participantA, conversation.participantB].includes(userId)) return;
      const message = await prisma.message.create({
        data: {
          conversationId: payload.conversationId,
          senderId: userId,
          content: payload.content.slice(0, 2000),
        },
      });
      await prisma.conversation.update({
        where: { id: payload.conversationId },
        data: { lastMessageAt: new Date() },
      });
      io?.to(`user:${conversation.participantA}`).to(`user:${conversation.participantB}`).emit("chat:message", message);
    });

    socket.on("chat:typing", (payload: { conversationId: string }) => {
      socket.broadcast.emit("chat:typing", { conversationId: payload.conversationId, userId });
    });
  });

  return io;
};


