"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LogOut, Plus, Settings, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { Button } from "@/frontend/shared/components/Button";
import { Card } from "@/frontend/shared/components/Card";
import { ModuleNav } from "@/frontend/shared/components/ModuleNav";
import { apiGet, apiPost } from "@/frontend/shared/lib/api-client";

type GroupRole = "admin" | "moderator" | "editor" | "viewer";

type GroupDetails = {
  id: string;
  name: string;
  baseCurrency: string;
  myRole: GroupRole;
  isAdmin: boolean;
};

type BalanceRow = { fromUserId: string; toUserId: string; amount: number; fromUserName?: string; toUserName?: string };
type Member = { id: string; userId: string; displayName: string; email: string; role: string };
type Settlement = {
  _id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: "pending_receiver" | "confirmed" | "declined";
  receiverDecisionAt?: string;
  createdAt?: string;
};
type Expense = {
  _id: string;
  title: string;
  note?: string;
  totalAmount: number;
  paidByUserId: string;
  paidByDisplayName?: string;
  expenseDate: string;
};
type GroupPolicy = {
  allowMemberRoleSelfLeave: boolean;
};

type GroupDetailsBundle = {
  group: GroupDetails;
  policy: GroupPolicy;
  expenses: Expense[];
  balances: BalanceRow[];
  members: Member[];
  settlements: Settlement[];
};

type GroupDetailsPageProps = { groupId: string; userId: string; initialBundle: GroupDetailsBundle };

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

export const GroupDetailsPage = ({ groupId, userId, initialBundle }: GroupDetailsPageProps) => {
  const [group, setGroup] = useState<GroupDetails | null>(initialBundle.group);
  const [policy, setPolicy] = useState<GroupPolicy | null>(initialBundle.policy);
  const [expenses, setExpenses] = useState<Expense[]>(initialBundle.expenses);
  const [balances, setBalances] = useState<BalanceRow[]>(initialBundle.balances);
  const [members, setMembers] = useState<Member[]>(initialBundle.members);
  const [settlements, setSettlements] = useState<Settlement[]>(initialBundle.settlements);
  const [pendingDebtActions, setPendingDebtActions] = useState<string[]>([]);
  const [paymentDrafts, setPaymentDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const loadGroupDetails = async () => {
    try {
      const result = await apiGet<GroupDetailsBundle>(`/api/groups/${groupId}/details`);

      setGroup(result.group);
      setPolicy(result.policy);
      setExpenses(result.expenses.sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()));
      setBalances(result.balances);
      setMembers(result.members);
      setSettlements(result.settlements);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load group");
    }
  };

  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m) => map.set(m.userId, m.displayName || m.email || "Unknown member"));
    return map;
  }, [members]);

  const userDebts = useMemo(() => {
    return balances.filter((row) => row.fromUserId === userId);
  }, [balances, userId]);

  const userOwed = useMemo(() => {
    return balances.filter((row) => row.toUserId === userId);
  }, [balances, userId]);

  const totalOwed = userOwed.reduce((sum, row) => sum + row.amount, 0);
  const totalDebts = userDebts.reduce((sum, row) => sum + row.amount, 0);
  const leaveDisabled = policy?.allowMemberRoleSelfLeave !== true;

  const pendingSettlementKeys = useMemo(() => {
    const keys = new Set<string>();
    settlements
      .filter((s) => s.status === "pending_receiver" && s.fromUserId === userId)
      .forEach((s) => keys.add(`${s.toUserId}:${s.amount.toFixed(2)}`));
    return keys;
  }, [settlements, userId]);

  const confirmedSettlements = useMemo(() => {
    return settlements
      .filter((settlement) => settlement.status === "confirmed")
      .sort((a, b) => {
        const aDate = a.receiverDecisionAt ?? a.createdAt ?? "";
        const bDate = b.receiverDecisionAt ?? b.createdAt ?? "";
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
  }, [settlements]);

  const pendingAmountByReceiver = useMemo(() => {
    const map = new Map<string, number>();
    settlements
      .filter((s) => s.status === "pending_receiver" && s.fromUserId === userId)
      .forEach((s) => {
        const current = map.get(s.toUserId) ?? 0;
        map.set(s.toUserId, Number((current + s.amount).toFixed(2)));
      });
    return map;
  }, [settlements, userId]);

  const markDebtAsPaid = async (toUserId: string, amount: number) => {
    const actionKey = `${toUserId}:${amount.toFixed(2)}`;
    setError("");
    setPendingDebtActions((current) => [...current, actionKey]);

    try {
      await apiPost(`/api/groups/${groupId}/settlements`, {
        toUserId,
        amount,
      });
      await loadGroupDetails();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send payment confirmation");
    } finally {
      setPendingDebtActions((current) => current.filter((item) => item !== actionKey));
    }
  };

  const submitDebtPayment = async (toUserId: string, maxAmount: number) => {
    const rawAmount = paymentDrafts[toUserId] ?? maxAmount.toFixed(2);
    const parsedAmount = Number(rawAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    if (parsedAmount - maxAmount > 0.001) {
      setError("Payment amount cannot be greater than your current debt.");
      return;
    }

    await markDebtAsPaid(toUserId, Number(parsedAmount.toFixed(2)));
  };

  const onLeave = async () => {
    if (!policy?.allowMemberRoleSelfLeave) {
      setError("Leaving this group is disabled by policy.");
      return;
    }

    try {
      await apiPost(`/api/groups/${groupId}/leave`, {});
      window.location.href = "/groups";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to leave group");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 md:py-8">
      <header className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{group?.name ?? "Group"}</h1>
            <p className="text-sm text-gray-500">
              Role: {group?.myRole ?? "-"} · Currency: {group?.baseCurrency ?? "EUR"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/groups/${groupId}/expenses/new`}
              aria-label="Add Expense"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600 sm:px-4"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Expense</span>
            </Link>
            {group?.isAdmin ? (
              <Link
                href={`/groups/${groupId}/edit`}
                aria-label="Settings"
                className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-300 sm:px-4"
              >
                <Settings size={18} />
                <span className="hidden sm:inline">Settings</span>
              </Link>
            ) : group ? (
              <Button variant="ghost" onClick={onLeave} disabled={leaveDisabled} aria-label="Leave group" className="px-3 sm:px-4">
                <LogOut size={18} />
                <span className="hidden sm:inline">Leave</span>
              </Button>
            ) : null}
          </div>
        </div>
        <ModuleNav />
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2 text-gray-600">
            <TrendingDown size={18} />
            <h3 className="font-semibold">You Owe</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-red-600">{totalDebts.toFixed(2)}</p>
          <div className="mt-3 space-y-2">
            {userDebts.length === 0 ? (
              <p className="text-sm text-gray-500">All settled</p>
            ) : (
              userDebts.map((row, idx) => (
                <div key={idx} className="text-sm text-gray-600">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                    <span>
                      <span className="font-medium">→ {memberMap.get(row.toUserId) || "Unknown member"}</span>: {row.amount.toFixed(2)}
                    </span>
                    {pendingSettlementKeys.has(`${row.toUserId}:${row.amount.toFixed(2)}`) && (
                      <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Pending full confirmation</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-gray-600">
            <TrendingUp size={18} />
            <h3 className="font-semibold">You&apos;re Owed</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-green-600">{totalOwed.toFixed(2)}</p>
          <div className="mt-3 space-y-2">
            {userOwed.length === 0 ? (
              <p className="text-sm text-gray-500">All settled</p>
            ) : (
              userOwed.map((row, idx) => (
                <div key={idx} className="text-sm text-gray-600">
                  <span className="font-medium">← {memberMap.get(row.fromUserId) || "Unknown member"}</span>: {row.amount.toFixed(2)}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-gray-600">
            <Wallet size={18} />
            <h3 className="font-semibold">Members</h3>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{members.length}</p>
          <div className="mt-3 space-y-2">
            {members.slice(0, 4).map((member) => (
              <div key={member.id} className="text-sm text-gray-600">
                <span className="font-medium">{member.displayName || member.email || "Unknown member"}</span>
                <span className="text-xs text-gray-500"> · {member.role}</span>
              </div>
            ))}
            {members.length > 4 && (
              <p className="text-xs text-gray-500">+{members.length - 4} more</p>
            )}
          </div>
        </Card>
      </section>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">My current debts</h2>
        <div className="space-y-3">
          {userDebts.length === 0 ? (
            <p className="text-sm text-gray-500">No open debts in this group.</p>
          ) : (
            userDebts.map((row) => {
              const actionKey = `${row.toUserId}:${(Number(paymentDrafts[row.toUserId] ?? row.amount.toFixed(2)) || 0).toFixed(2)}`;
              const pendingAmount = pendingAmountByReceiver.get(row.toUserId) ?? 0;

              return (
                <div key={row.toUserId} className="rounded-xl border border-gray-200 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-gray-700">
                      You owe <span className="font-semibold">{memberMap.get(row.toUserId) || "Unknown member"}</span>
                    </p>
                    <p className="text-sm font-semibold text-gray-900">Open: {row.amount.toFixed(2)}</p>
                  </div>

                  {pendingAmount > 0 && (
                    <p className="mt-2 text-xs font-semibold text-amber-700">Pending confirmation: {pendingAmount.toFixed(2)}</p>
                  )}

                  <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
                    <input
                      type="number"
                      min="0.01"
                      max={row.amount.toFixed(2)}
                      step="0.01"
                      value={paymentDrafts[row.toUserId] ?? row.amount.toFixed(2)}
                      onChange={(event) => {
                        const value = event.target.value;
                        setPaymentDrafts((current) => ({
                          ...current,
                          [row.toUserId]: value,
                        }));
                      }}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none ring-blue-300 focus:ring md:w-48"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => void submitDebtPayment(row.toUserId, row.amount)}
                      disabled={pendingDebtActions.includes(actionKey)}
                    >
                      I have paid this amount
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <span>Expense History</span>
          <span className="text-sm font-normal text-gray-500">({expenses.length})</span>
        </h2>
        <div className="space-y-2">
          {expenses.length === 0 ? (
            <p className="text-sm text-gray-500">No expenses yet</p>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense._id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-gray-900">{expense.title}</p>
                  {expense.note && <p className="text-xs text-gray-500">{expense.note}</p>}
                  <p className="text-xs text-gray-500">
                    Paid by {memberMap.get(expense.paidByUserId) || expense.paidByDisplayName || "Unknown member"} · {formatDate(expense.expenseDate)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">{expense.totalAmount.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <span>Payment History</span>
          <span className="text-sm font-normal text-gray-500">({confirmedSettlements.length})</span>
        </h2>
        <div className="space-y-2">
          {confirmedSettlements.length === 0 ? (
            <p className="text-sm text-gray-500">No confirmed payments yet</p>
          ) : (
            confirmedSettlements.map((settlement) => (
              <div key={settlement._id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">
                    {memberMap.get(settlement.fromUserId) || "Unknown member"} paid {memberMap.get(settlement.toUserId) || "Unknown member"}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(settlement.receiverDecisionAt ?? settlement.createdAt ?? "")}</p>
                </div>
                <p className="font-semibold text-gray-900">{settlement.amount.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
    </main>
  );
};
