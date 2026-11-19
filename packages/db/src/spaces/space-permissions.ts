import { ClientError } from "@rakazo/core";
import { GUEST_ROLE, isOwnerRole } from "../billing/billing.js";
import type { PrismaClient } from "../database/client.js";
import { IsolationError } from "../database/scope.js";

export class BotManageForbiddenError extends ClientError {
  constructor() {
    super("FORBIDDEN", "Guests can chat with bots but cannot create or change them");
    this.name = "BotManageForbiddenError";
  }
}

/** Whether this person is a Space Invite guest in the space (org role guest). */
export async function isSpaceGuest(
  prisma: Pick<PrismaClient, "spaceMember">,
  input: { spaceId: string; userId: string },
): Promise<boolean> {
  const row = await prisma.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId: input.spaceId, userId: input.userId } },
    select: { member: { select: { role: true } } },
  });
  if (!row) throw new IsolationError();
  return row.member.role === GUEST_ROLE;
}

/**
 * Guests may chat; they may not create, update, archive, or remove bots (or manage fleet).
 */
export async function assertCanManageBots(
  prisma: Pick<PrismaClient, "spaceMember">,
  actor: { spaceId: string; userId: string },
): Promise<void> {
  if (await isSpaceGuest(prisma, actor)) throw new BotManageForbiddenError();
}

/**
 * Whose stored model credentials a run should use.
 * Guests in a shared space borrow the space owner's connection — not the messenger's,
 * and not a deployment env key.
 */
export async function resolveRunModelUserId(
  prisma: Pick<PrismaClient, "spaceMember">,
  input: { spaceId: string; userId: string },
): Promise<string> {
  const row = await prisma.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId: input.spaceId, userId: input.userId } },
    select: { member: { select: { role: true } } },
  });
  if (!row) throw new IsolationError();
  if (row.member.role !== GUEST_ROLE) return input.userId;

  const members = await prisma.spaceMember.findMany({
    where: { spaceId: input.spaceId },
    select: { userId: true, role: true },
    orderBy: { createdAt: "asc" },
  });
  const spaceOwner = members.find((member) => isOwnerRole(member.role)) ?? members[0];
  if (!spaceOwner) throw new IsolationError();
  return spaceOwner.userId;
}
