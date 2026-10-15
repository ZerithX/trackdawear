import {
  and,
  desc,
  eq,
  gte,
  isNotNull,
  isNull,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db } from "../../db/client";
import { assets, loans, users } from "../../db/schema";
import { BadRequestError, ConflictError, NotFoundError } from "../../shared/error";
import type { CreateLoanInput, LoanQuery } from "./loans.schema";

export const loanService = {
  async create(input: CreateLoanInput) {
    return db.transaction(async (tx) => {
      const [user] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user) {
        throw new NotFoundError("USER_NOT_FOUND", "User was not found");
      }

      const [asset] = await tx
        .select({ id: assets.id, status: assets.status })
        .from(assets)
        .where(eq(assets.id, input.assetId))
        .limit(1);

      if (!asset) {
        throw new NotFoundError("ASSET_NOT_FOUND", "Asset was not found");
      }

      if (asset.status !== "available") {
        throw new ConflictError(
          "ASSET_NOT_AVAILABLE",
          "Asset is not available for loan",
        );
      }

      const now = new Date();
      if (input.dueAt <= now) {
        throw new BadRequestError(
          "INVALID_DUE_DATE",
          "dueAt must be in the future",
        );
      }

      const [claimedAsset] = await tx
        .update(assets)
        .set({ status: "borrowed", updatedAt: now })
        .where(and(eq(assets.id, input.assetId), eq(assets.status, "available")))
        .returning({ id: assets.id });

      if (!claimedAsset) {
        throw new ConflictError(
          "ASSET_NOT_AVAILABLE",
          "Asset is not available for loan",
        );
      }

      const [loan] = await tx.insert(loans).values(input).returning();
      return loan;
    });
  },

  async list(query: LoanQuery) {
    const conditions: SQL[] = [];
    const now = new Date();

    if (query.userId) {
      conditions.push(eq(loans.userId, query.userId));
    }

    if (query.active === true) {
      conditions.push(isNull(loans.returnedAt));
    } else if (query.active === false) {
      conditions.push(isNotNull(loans.returnedAt));
    }

    if (query.overdue === true) {
      conditions.push(isNull(loans.returnedAt), lt(loans.dueAt, now));
    } else if (query.overdue === false) {
      conditions.push(or(isNotNull(loans.returnedAt), gte(loans.dueAt, now))!);
    }

    return db
      .select({
        id: loans.id,
        borrowedAt: loans.borrowedAt,
        dueAt: loans.dueAt,
        returnedAt: loans.returnedAt,
        overdue: sql<boolean>`${loans.returnedAt} is null and ${loans.dueAt} < ${now}`,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        asset: {
          id: assets.id,
          assetCode: assets.assetCode,
          name: assets.name,
        },
      })
      .from(loans)
      .innerJoin(users, eq(loans.userId, users.id))
      .innerJoin(assets, eq(loans.assetId, assets.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(loans.createdAt));
  },

  async returnLoan(id: string) {
    return db.transaction(async (tx) => {
      const [loan] = await tx
        .select()
        .from(loans)
        .where(eq(loans.id, id))
        .limit(1);

      if (!loan) {
        throw new NotFoundError("LOAN_NOT_FOUND", "Loan was not found");
      }

      if (loan.returnedAt) {
        throw new ConflictError(
          "LOAN_ALREADY_RETURNED",
          "Loan has already been returned",
        );
      }

      const returnedAt = new Date();
      const [returnedLoan] = await tx
        .update(loans)
        .set({ returnedAt })
        .where(and(eq(loans.id, id), isNull(loans.returnedAt)))
        .returning();

      if (!returnedLoan) {
        throw new ConflictError(
          "LOAN_ALREADY_RETURNED",
          "Loan has already been returned",
        );
      }

      await tx
        .update(assets)
        .set({ status: "available", updatedAt: returnedAt })
        .where(eq(assets.id, loan.assetId));

      return returnedLoan;
    });
  },
};
