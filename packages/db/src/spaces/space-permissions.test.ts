import { describe, expect, it, vi } from "vitest";
import {
  assertCanManageBots,
  BotManageForbiddenError,
  isSpaceGuest,
  resolveRunModelUserId,
} from "./space-permissions.js";

describe("space guest bot ACL", () => {
  it("treats org guest role as a Space Invite guest", async () => {
    const prisma = {
      spaceMember: {
        findUnique: vi.fn(async () => ({ member: { role: "guest" } })),
      },
    };
    await expect(
      isSpaceGuest(prisma as never, { spaceId: "space-1", userId: "guest-1" }),
    ).resolves.toBe(true);
    await expect(
      assertCanManageBots(prisma as never, { spaceId: "space-1", userId: "guest-1" }),
    ).rejects.toBeInstanceOf(BotManageForbiddenError);
  });

  it("allows non-guests to manage bots", async () => {
    const prisma = {
      spaceMember: {
        findUnique: vi.fn(async () => ({ member: { role: "member" } })),
      },
    };
    await expect(
      assertCanManageBots(prisma as never, { spaceId: "space-1", userId: "owner-1" }),
    ).resolves.toBeUndefined();
  });

  it("resolves guest runs to the space owner's user id", async () => {
    const prisma = {
      spaceMember: {
        findUnique: vi.fn(async () => ({ member: { role: "guest" } })),
        findMany: vi.fn(async () => [
          { userId: "member-1", role: "member" },
          { userId: "owner-1", role: "owner" },
        ]),
      },
    };
    await expect(
      resolveRunModelUserId(prisma as never, { spaceId: "space-1", userId: "guest-1" }),
    ).resolves.toBe("owner-1");
  });

  it("keeps the messenger's user id when they are not a guest", async () => {
    const prisma = {
      spaceMember: {
        findUnique: vi.fn(async () => ({ member: { role: "member" } })),
        findMany: vi.fn(),
      },
    };
    await expect(
      resolveRunModelUserId(prisma as never, { spaceId: "space-1", userId: "member-1" }),
    ).resolves.toBe("member-1");
    expect(prisma.spaceMember.findMany).not.toHaveBeenCalled();
  });
});
