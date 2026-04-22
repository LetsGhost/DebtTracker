import { BarChart3, Coins, HandCoins, LogOut, Users } from "lucide-react";
import Link from "next/link";

import { Card } from "@/frontend/shared/components/Card";
import { ModuleNav } from "@/frontend/shared/components/ModuleNav";

type DashboardHomePageProps = {
  user: {
    displayName: string;
    email: string;
  };
};

export const DashboardHomePage = ({ user }: DashboardHomePageProps) => (
  <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8">
    <header className="space-y-4 rounded-2xl border border-black/10 bg-(--surface) p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hi {user.displayName}</h1>
          <p className="text-sm text-(--text-muted)">{user.email}</p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="inline-flex items-center gap-2 rounded-xl bg-black/10 px-3 py-2 text-sm font-semibold hover:bg-black/15 sm:px-4" type="submit">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </form>
      </div>
      <ModuleNav />
    </header>

    <section className="grid gap-4 md:grid-cols-2">
      <Card>
        <div className="mb-2 flex items-center gap-2">
          <Users size={18} />
          <h3 className="text-lg font-semibold">Group Management</h3>
        </div>
        <p className="text-sm text-(--text-muted)">Create groups, manage invites, and assign roles.</p>
        <Link href="/groups" className="mt-3 inline-block text-sm font-semibold text-(--brand)">
          Open Groups
        </Link>
      </Card>

      <Card>
        <div className="mb-2 flex items-center gap-2">
          <Coins size={18} />
          <h3 className="text-lg font-semibold">Expense Tracking</h3>
        </div>
        <p className="text-sm text-(--text-muted)">Add expenses with equal, percentage, or custom splits.</p>
        <Link href="/expenses" className="mt-3 inline-block text-sm font-semibold text-(--brand)">
          Open Expenses
        </Link>
      </Card>

      <Card>
        <div className="mb-2 flex items-center gap-2">
          <HandCoins size={18} />
          <h3 className="text-lg font-semibold">Settlement Inbox</h3>
        </div>
        <p className="text-sm text-(--text-muted)">Confirm or decline payment settlement requests.</p>
        <Link href="/settlements" className="mt-3 inline-block text-sm font-semibold text-(--brand)">
          Open Settlements
        </Link>
      </Card>

      <Card>
        <div className="mb-2 flex items-center gap-2">
          <BarChart3 size={18} />
          <h3 className="text-lg font-semibold">System Admin</h3>
        </div>
        <p className="text-sm text-(--text-muted)">Privacy-safe operational metrics for admins.</p>
        <Link href="/sys-admin" className="mt-3 inline-block text-sm font-semibold text-(--brand)">
          Open Admin View
        </Link>
      </Card>
    </section>
  </main>
);
