import { getCurrentUserOrRedirect } from "@/app/_lib/get-current-user";
import { ExpensesPage } from "@/frontend/modules/expenses/pages/ExpensesPage";

export default async function ExpensesRoute() {
  await getCurrentUserOrRedirect();
  return <ExpensesPage />;
}
