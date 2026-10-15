import { describe, expect, it } from "bun:test";
import { createAssetSchema, updateAssetSchema } from "../src/modules/assets/asset.schema";
import { createLoanSchema } from "../src/modules/loans/loans.schema";
import { createUserSchema } from "../src/modules/users/users.schema";

describe("request schemas", () => {
  it("rejects an invalid user email", () => {
    const result = createUserSchema.safeParse({
      name: "Test User",
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes asset codes and applies defaults", () => {
    const result = createAssetSchema.parse({
      categoryId: "550e8400-e29b-41d4-a716-446655440000",
      name: "Projector",
      assetCode: "prj-001",
    });

    expect(result.assetCode).toBe("PRJ-001");
    expect(result.status).toBe("available");
    expect(result.condition).toBe("good");
  });

  it("rejects an empty asset update", () => {
    expect(updateAssetSchema.safeParse({}).success).toBe(false);
  });

  it("rejects a loan due date in the past", () => {
    const result = createLoanSchema.safeParse({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      assetId: "550e8400-e29b-41d4-a716-446655440001",
      dueAt: "2020-01-01T00:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });
});
