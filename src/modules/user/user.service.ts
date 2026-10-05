import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { getPagination, paginationMeta } from "../../utils/pagination";

const publicSelect = {
  id: true,
  role: true,
  status: true,
  createdAt: true,
  profile: {
    select: {
      fullName: true,
      photoUrl: true,
      bio: true,
      ratingAverage: true,
      ratingCount: true,
      completedRides: true,
    },
  },
};

const getMe = (userId: string) =>
  prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: { passwordHash: true },
    include: { profile: true },
  });

const updateMe = async (userId: string, payload: any) => {
  const { phone, fullName, bio, gender, dateOfBirth, ...rest } = payload;
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(phone ? { phone } : {}),
      profile: {
        update: {
          ...(fullName ? { fullName } : {}),
          ...(bio !== undefined ? { bio } : {}),
          ...(gender ? { gender } : {}),
          ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
          ...rest,
        },
      },
    },
    omit: { passwordHash: true },
    include: { profile: true },
  });
};

const updatePhoto = (userId: string, photoUrl: string) =>
  prisma.profile.update({
    where: { userId },
    data: { photoUrl },
  });

const updateEmergency = (userId: string, payload: { emergencyName: string; emergencyPhone: string; emergencyRelation?: string }) =>
  prisma.profile.update({
    where: { userId },
    data: payload,
  });

const getPreferences = (userId: string) =>
  prisma.profile.findUniqueOrThrow({
    where: { userId },
    select: {
      preferredLanguage: true,
      smokingPreference: true,
      musicPreference: true,
      chatPreference: true,
    },
  });

const updatePreferences = (userId: string, payload: object) =>
  prisma.profile.update({
    where: { userId },
    data: payload,
  });

const getPublicProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicSelect,
  });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  return user;
};

const getUserReviews = async (userId: string, query: Record<string, unknown>) => {
  const { page, limit, skip } = getPagination(query);
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where: { targetId: userId },
      include: { author: { include: { profile: true } }, ride: { select: { id: true, date: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { targetId: userId } }),
  ]);
  return { items, meta: paginationMeta(page, limit, total) };
};

const blockUser = async (blockerId: string, blockedId: string, reason?: string) => {
  if (blockerId === blockedId) throw new AppError(httpStatus.BAD_REQUEST, "You cannot block yourself");
  return prisma.userBlock.upsert({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    update: { reason },
    create: { blockerId, blockedId, reason },
  });
};

const unblockUser = (blockerId: string, blockedId: string) =>
  prisma.userBlock.deleteMany({ where: { blockerId, blockedId } });

export const userService = {
  getMe,
  updateMe,
  updatePhoto,
  updateEmergency,
  getPreferences,
  updatePreferences,
  getPublicProfile,
  getUserReviews,
  blockUser,
  unblockUser,
};
