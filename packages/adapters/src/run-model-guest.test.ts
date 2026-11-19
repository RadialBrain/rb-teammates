import { MISSING_MODEL_RUN_ERROR } from "@rakazo/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./model-roles.js", () => ({
  resolveMemberMainModel: vi.fn(),
  selectConfiguredModel: vi.fn(),
}));

vi.mock("./model-selection.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./model-selection.js")>();
  return {
    ...actual,
    findConnectedModelCredential: vi.fn(),
    hasHostedModelCredits: vi.fn(async () => false),
  };
});

import { resolveMemberMainModel, selectConfiguredModel } from "./model-roles.js";
import { findConnectedModelCredential } from "./model-selection.js";
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
      runtime: { describe: () => ({ capabilities: { scripted: false } }) },
      deploymentModelConfigured: true,
      deploymentModelKey: "deployment-openrouter-key",
      billingEnabled: false,
    };

    const model = await resolveRunModel(deps as never, {
      userId: "guest-1",
      spaceId: "space-shared",
    });

    expect(resolveMemberMainModel).toHaveBeenCalledWith(deps, {
      userId: "owner-1",
      spaceId: "space-shared",
    });
    expect(model.apiKey).toBe("owner-stored-key");
    expect(model.apiKey).not.toBe("deployment-openrouter-key");
  });

  it("fails with the normal missing-model error when the owner has no stored connection", async () => {
    vi.mocked(findConnectedModelCredential).mockResolvedValue(null);
    vi.mocked(resolveMemberMainModel).mockResolvedValue(null);
    vi.mocked(selectConfiguredModel).mockReturnValue({
      provider: null,
      id: null,
      credential: null,
      thinkingLevel: null,
    });

    const prisma = guestPrisma();
    const deps = {
      prisma,
      secretStore: { load: vi.fn() },
      runtime: { describe: () => ({ capabilities: { scripted: false } }) },
      deploymentModelConfigured: true,
      deploymentModelKey: "deployment-openrouter-key",
      billingEnabled: false,
    };

    await expect(
      resolveRunModel(deps as never, { userId: "guest-1", spaceId: "space-shared" }),
    ).rejects.toThrow(MISSING_MODEL_RUN_ERROR);
  });
});
