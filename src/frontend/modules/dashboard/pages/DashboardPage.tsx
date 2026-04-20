import { DashboardTimelinePage } from "@/frontend/modules/dashboard/pages/DashboardTimelinePage";

type DashboardPageProps = {
  user: {
    id: string;
    displayName: string;
    email: string;
  };
};

export const DashboardPage = ({ user }: DashboardPageProps) => <DashboardTimelinePage user={user} />;
