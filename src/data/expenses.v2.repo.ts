import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/core/firebase";
import { ExpenseSchema, type Expense } from "@/domain/models";

function expenseDocRef(params: {
  clientId?: string;
  projectId?: string;
  yyyyMM: string;
  id: string;
}) {
  const { clientId, projectId, yyyyMM, id } = params;
  const year = yyyyMM.slice(0, 4);
  const month = yyyyMM.slice(4, 6);

  if (clientId && projectId) {
    return doc(
      db,
      "clients",
      clientId,
      "projects",
      projectId,
      "expenses",
      year,
      month,
      "items",
      id
    );
  }

  return doc(db, "expenses", yyyyMM, "items", id);
}

type ScopedInput = {
  clientId?: string | null;
  projectId?: string | null;
  yyyyMM: string;
};

function getScopedParams(expense: ScopedInput) {
  const clientId = typeof expense.clientId === "string" ? expense.clientId.trim() : "";
  const projectId =
    typeof expense.projectId === "string" ? expense.projectId.trim() : "";
  const yyyyMM = expense.yyyyMM;
  const year = yyyyMM.slice(0, 4);
  const month = yyyyMM.slice(4, 6);

  return {
    clientId: clientId || undefined,
    projectId: projectId || undefined,
    yyyyMM,
    year,
    month,
  };
}

async function updateExpenseYearsMetadata(params: ScopedInput): Promise<void> {
  const { clientId, projectId, yyyyMM } = params;
  const year = Number(yyyyMM.slice(0, 4));
  if (Number.isNaN(year)) return;

  const ref =
    clientId && projectId
      ? doc(
          db,
          "clients",
          clientId,
          "projects",
          projectId,
          "metadata",
          "expenseYears"
        )
      : doc(db, "metadata", "expenseYears");
  const snap = await getDoc(ref);
  const data = snap.exists() ? (snap.data() as { years?: number[] }) : {};
  const years = Array.isArray(data.years) ? [...data.years] : [];

  if (!years.includes(year)) {
    years.push(year);
    years.sort((a, b) => a - b);
    await setDoc(ref, { years }, { merge: true });
  }
}

const TogglePayloadSchema = ExpenseSchema.pick({
  paid: true,
  updatedAt: true,
});

export function normalizeExpenseForWrite(draft: Partial<Expense>): Expense {
  const now = Date.now();
  const amountValue = draft.amount ?? 0;
  const amountNumber = Number(amountValue);
  const toTrim = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";

  const normalized = ExpenseSchema.parse({
    ...draft,
    id: draft.id ?? "",
    projectId: toTrim(draft.projectId),
    yyyyMM: toTrim(draft.yyyyMM),
    payee: toTrim(draft.payee),
    category: toTrim(draft.category),
    subCategory: toTrim(draft.subCategory),
    details:
      typeof draft.details === "string" ? draft.details : draft.details ?? "",
    modeOfPayment:
      typeof draft.modeOfPayment === "string"
        ? draft.modeOfPayment.trim()
        : draft.modeOfPayment ?? "",
    invoiceDate: toTrim(draft.invoiceDate),
    datePaid: toTrim(draft.datePaid),
    amount: Number.isFinite(amountNumber) ? amountNumber : 0,
    paid: Boolean(draft.paid),
    createdAt: draft.createdAt ?? now,
    updatedAt: now,
  });

  return normalized;
}

export async function saveExpense(
  expense: Expense & { clientId?: string | null }
): Promise<Expense> {
  const { clientId, ...raw } = expense;

  const parsed = ExpenseSchema.parse({
    ...raw,
    createdAt: raw.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  });

  const scoped = getScopedParams({
    clientId,
    projectId: parsed.projectId,
    yyyyMM: parsed.yyyyMM,
  });

  const ref = expenseDocRef({
    clientId: scoped.clientId,
    projectId: scoped.projectId,
    yyyyMM: scoped.yyyyMM,
    id: parsed.id,
  });
  const payloadBase = {
    ...parsed,
    projectId: scoped.projectId ?? parsed.projectId,
  };
  const effectiveClientId = scoped.clientId ?? clientId ?? undefined;

  const payload =
    typeof effectiveClientId === "string" && effectiveClientId.trim().length > 0
      ? {
          ...payloadBase,
          clientId: effectiveClientId.trim(),
        }
      : payloadBase;

  await setDoc(ref, payload, { merge: true });
  await updateExpenseYearsMetadata(scoped);
  return parsed;
}

type DeleteExpenseParams = ScopedInput & {
  expenseId: string;
};

export async function deleteExpense(
  params: DeleteExpenseParams
): Promise<void>;
export async function deleteExpense(
  yyyyMM: string,
  expenseId: string
): Promise<void>;
export async function deleteExpense(
  paramsOrYyyyMM: DeleteExpenseParams | string,
  maybeExpenseId?: string
): Promise<void> {
  const params: DeleteExpenseParams =
    typeof paramsOrYyyyMM === "string"
      ? { yyyyMM: paramsOrYyyyMM, expenseId: maybeExpenseId ?? "" }
      : paramsOrYyyyMM;

  if (!params.expenseId) {
    throw new Error("Missing expenseId for deleteExpense");
  }

  const scoped = getScopedParams(params);
  await deleteDoc(
    expenseDocRef({
      clientId: scoped.clientId,
      projectId: scoped.projectId,
      yyyyMM: scoped.yyyyMM,
      id: params.expenseId,
    })
  );
}

type TogglePaidParams = DeleteExpenseParams & {
  paid: boolean;
};

export async function togglePaid(params: TogglePaidParams): Promise<Expense>;
export async function togglePaid(
  yyyyMM: string,
  expenseId: string,
  paid: boolean
): Promise<Expense>;
export async function togglePaid(
  paramsOrYyyyMM: TogglePaidParams | string,
  expenseId?: string,
  maybePaid?: boolean
): Promise<Expense> {
  const params: TogglePaidParams =
    typeof paramsOrYyyyMM === "string"
      ? (() => {
          if (typeof expenseId !== "string") {
            throw new Error("Missing expenseId for togglePaid");
          }
          if (typeof maybePaid !== "boolean") {
            throw new Error("Missing paid flag for togglePaid");
          }
          return { yyyyMM: paramsOrYyyyMM, expenseId, paid: maybePaid };
        })()
      : paramsOrYyyyMM;

  if (!params.expenseId) {
    throw new Error("Missing expenseId for togglePaid");
  }

  const scoped = getScopedParams(params);
  const ref = expenseDocRef({
    clientId: scoped.clientId,
    projectId: scoped.projectId,
    yyyyMM: scoped.yyyyMM,
    id: params.expenseId,
  });
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error(`Expense ${params.expenseId} not found in ${params.yyyyMM}`);
  }

  const existing = ExpenseSchema.parse({
    id: params.expenseId,
    yyyyMM: params.yyyyMM,
    ...snap.data(),
  });

  const payload = TogglePayloadSchema.parse({
    paid: params.paid,
    updatedAt: Date.now(),
  });

  const updated = ExpenseSchema.parse({
    ...existing,
    ...payload,
  });

  await setDoc(ref, payload, { merge: true });
  return updated;
}

export async function moveExpenseToMonth(
  expense: Expense & { clientId?: string | null },
  fromYYYYMM: string,
  toYYYYMM: string
): Promise<Expense> {
  const { clientId, ...raw } = expense;

  const parsed = ExpenseSchema.parse({
    ...raw,
    yyyyMM: toYYYYMM,
    createdAt: raw.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  });

  const scopedTarget = getScopedParams({
    clientId,
    projectId: parsed.projectId,
    yyyyMM: toYYYYMM,
  });
  const scopedSource = getScopedParams({
    clientId,
    projectId: parsed.projectId,
    yyyyMM: fromYYYYMM,
  });

  const batch = writeBatch(db);
  const targetRef = expenseDocRef({
    clientId: scopedTarget.clientId,
    projectId: scopedTarget.projectId,
    yyyyMM: scopedTarget.yyyyMM,
    id: parsed.id,
  });
  const targetPayloadBase = {
    ...parsed,
    projectId: scopedTarget.projectId ?? parsed.projectId,
  };
  const effectiveClientIdTarget = scopedTarget.clientId ?? clientId ?? undefined;

  const targetPayload =
    typeof effectiveClientIdTarget === "string" &&
    effectiveClientIdTarget.trim().length > 0
      ? {
          ...targetPayloadBase,
          clientId: effectiveClientIdTarget.trim(),
        }
      : targetPayloadBase;
  batch.set(targetRef, targetPayload, { merge: true });

  const sourceRef = expenseDocRef({
    clientId: scopedSource.clientId,
    projectId: scopedSource.projectId,
    yyyyMM: scopedSource.yyyyMM,
    id: parsed.id,
  });
  batch.delete(sourceRef);
  await batch.commit();

  await updateExpenseYearsMetadata(scopedTarget);
  return parsed;
}

export { expenseDocRef };
