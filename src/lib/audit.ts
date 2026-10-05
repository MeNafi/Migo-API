import { prisma } from "./prisma";

export const writeAudit = async (input: {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  ip?: string;
}) => {
  return prisma.auditLog.create({
    data: {
      actorId: input.actorId || undefined,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      before: input.before as object | undefined,
      after: input.after as object | undefined,
      reason: input.reason,
      ip: input.ip,
    },
  });
};
