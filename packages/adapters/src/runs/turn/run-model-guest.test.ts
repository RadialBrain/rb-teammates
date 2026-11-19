import { MISSING_MODEL_RUN_ERROR } from "@rakazo/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../models/model-roles.js", () => ({
  resolveMemberMainModel: vi.fn(),
  selectConfiguredModel: vi.fn(),
}));

vi.mock("../../models/model-selection.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../models/model-selection.js")>();
  return {
    ...actual,
    findConnectedModelCredential: vi.fn(),
    hasHostedModelCredits: vi.fn(async () => false),
  };
});

import { resolveMemberMainModel, selectConfiguredModel } from "../../models/model-roles.js";
import { findConnectedModelCredential } from "../../models/model-selection.js";
import { resolveRunModel } from "./run-model.js";

function guestPrisma(ownerId = "owner-1") {
  return {
    spaceMember: {
      findUnique: vi.fn(async () => ({ member: { role: "guest" } })),
      findMany: vi.fn(async () => [
        { userId: "member-1", role: "member" },
        { userId: ownerId, role: "owner" },
      ]),
    },
    bot: { findFirst: vi.fn(async () => null) },
    deploymentSettings: { findUnique: vi.fn(async () => null) },
    secret: {
      findFirst: vi.fn(async ({ where }: { where: { userId: string } }) => {
        expect(where.userId).toBe(ownerId);
        return { id: "secret-owner", ciphertext: "owner-stored-key" };
      }),
    },
    userModelCredential: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  };
}

describe("guest shared-space model credentials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv("OPENROUTER_API_KEY", "deployment-openrouter-key");
  });

  it("runs on the space owner's stored key and ignores OPENROUTER_API_KEY", async () => {
    const credential = {
      id: "cred-owner",
      secretId: "secret-owner",
      provider: "openrouter",
      defaultModel: "owner/model",
      supportsImages: false,
    };
    vi.mocked(findConnectedModelCredential).mockResolvedValue(credential as never);
    vi.mocked(resolveMemberMainModel).mockResolvedValue({
      provider: "openrouter",
      modelId: "owner/model",
      thinkingLevel: null,
      credential: credential as never,
    });
    vi.mocked(selectConfiguredModel).mockReturnValue({
      provider: "openrouter",
      id: "owner/model",
      credential: credential as never,
      thinkingLevel: null,
    });

    const prisma = guestPrisma();
    const deps = {
      prisma,
      secretStore: {
        load: vi.fn(async () => "owner-stored-key"),
      },
      deploymentModelConfigured: true,
      deploymentModelKey: "deployment-should-not-be-used",
      runtime: { describe: () => ({ capabilities: { scripted: false } }) },
    };

    const model = await resolveRunModel(deps as never, {
      userId: "guest-1",
      spaceId: "space-1",
    });

    expect(model.provider).toBe("openrouter");
    expect(model.id).toBe("owner/model");
    expect(model.apiKey).toBe("owner-stored-key");
    expect(vi.mocked(resolveMemberMainModel).mock.calls[0]?.[1]).toEqual({
      userId: "owner-1",
      spaceId: "space-1",
    });
  });

  it("forbids deployment fallback when the owner has no stored key", async () => {
    vi.mocked(findConnectedModelCredential).mockResolvedValue(null);
    vi.mocked(resolveMemberMainModel).mockResolvedValue({
      provider: null,
      modelId: null,
      thinkingLevel: null,
      credential: null,
    });
    vi.mocked(selectConfiguredModel).mockReturnValue({
      provider: null,
      id: null,
      credential: null,
      thinkingLevel: null,
    });

    await expect(
      resolveRunModel(
        {
          prisma: guestPrisma(),
          secretStore: { load: vi.fn() },
          deploymentModelConfigured: true,
          deploymentModelKey: "deployment-key",
          runtime: { describe: () => ({ capabilities: { scripted: false } }) },
        } as never,
        { userId: "guest-1", spaceId: "space-1" },
      ),
    ).rejects.toThrow(MISSING_MODEL_RUN_ERROR);
  });
});
