type Stats = {
  users: number;
  groups: number;
  activeMemberships: number;
  expenses: number;
  pendingSettlements: number;
};

type SysAdminPageProps = {
  stats: Stats;
};

export const SysAdminPage = ({ stats }: SysAdminPageProps) => (
  <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8">
    <header className="rounded-2xl border border-black/10 bg-(--surface) p-6">
      <h1 className="text-3xl font-bold">SysAdmin Dashboard</h1>
      <p className="mt-2 text-sm text-(--text-muted)">
        Privacy-safe operational statistics only. No personal expense detail is shown.
      </p>
    </header>

    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <article className="rounded-xl border border-black/10 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.15em] text-(--text-muted)">Users</p>
        <p className="mt-2 text-3xl font-bold">{stats.users}</p>
      </article>
      <article className="rounded-xl border border-black/10 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.15em] text-(--text-muted)">Groups</p>
        <p className="mt-2 text-3xl font-bold">{stats.groups}</p>
      </article>
      <article className="rounded-xl border border-black/10 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.15em] text-(--text-muted)">Active Memberships</p>
        <p className="mt-2 text-3xl font-bold">{stats.activeMemberships}</p>
      </article>
      <article className="rounded-xl border border-black/10 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.15em] text-(--text-muted)">Expenses</p>
        <p className="mt-2 text-3xl font-bold">{stats.expenses}</p>
      </article>
      <article className="rounded-xl border border-black/10 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.15em] text-(--text-muted)">Pending Settlements</p>
        <p className="mt-2 text-3xl font-bold">{stats.pendingSettlements}</p>
      </article>
    </section>
  </main>
);
