import { AuthController } from "@/backend/modules/auth/auth.controller";
import { AuthService } from "@/backend/modules/auth/auth.service";
import { BalancesController } from "@/backend/modules/balances/balances.controller";
import { BalancesService } from "@/backend/modules/balances/balances.service";
import { BudgetsController } from "@/backend/modules/budgets/budgets.controller";
import { BudgetsService } from "@/backend/modules/budgets/budgets.service";
import { CategoriesController } from "@/backend/modules/categories/categories.controller";
import { CategoriesService } from "@/backend/modules/categories/categories.service";
import { CollaborationsController } from "@/backend/modules/collaborations/collaborations.controller";
import { CollaborationsService } from "@/backend/modules/collaborations/collaborations.service";
import { ExpensesController } from "@/backend/modules/expenses/expenses.controller";
import { ExpensesService } from "@/backend/modules/expenses/expenses.service";
import { GroupsController } from "@/backend/modules/groups/groups.controller";
import { GroupsService } from "@/backend/modules/groups/groups.service";
import { MinimizationController } from "@/backend/modules/minimization/minimization.controller";
import { MinimizationService } from "@/backend/modules/minimization/minimization.service";
import { NotificationsController } from "@/backend/modules/notifications/notifications.controller";
import { NotificationsService } from "@/backend/modules/notifications/notifications.service";
import { P2PController } from "@/backend/modules/p2p/p2p.controller";
import { P2PService } from "@/backend/modules/p2p/p2p.service";
import { SettlementsController } from "@/backend/modules/settlements/settlements.controller";
import { SettlementsService } from "@/backend/modules/settlements/settlements.service";
import { SysAdminController } from "@/backend/modules/sysadmin/sysadmin.controller";
import { SysAdminService } from "@/backend/modules/sysadmin/sysadmin.service";
import { TransactionsController } from "@/backend/modules/transactions/transactions.controller";
import { TransactionsService } from "@/backend/modules/transactions/transactions.service";
import { UsersController } from "@/backend/modules/users/users.controller";
import { UsersService } from "@/backend/modules/users/users.service";

const usersService = new UsersService();
const authService = new AuthService(usersService);
const transactionsService = new TransactionsService();
const categoriesService = new CategoriesService();
const budgetsService = new BudgetsService();
const collaborationsService = new CollaborationsService();
const groupsService = new GroupsService();
const expensesService = new ExpensesService();
const balancesService = new BalancesService();
const settlementsService = new SettlementsService();
const minimizationService = new MinimizationService();
const p2pService = new P2PService();
const notificationsService = new NotificationsService();
const sysAdminService = new SysAdminService();

export const container = {
  usersController: new UsersController(usersService),
  authController: new AuthController(authService),
  transactionsController: new TransactionsController(transactionsService),
  categoriesController: new CategoriesController(categoriesService),
  budgetsController: new BudgetsController(budgetsService),
  collaborationsController: new CollaborationsController(collaborationsService),
  groupsController: new GroupsController(groupsService),
  expensesController: new ExpensesController(expensesService),
  balancesController: new BalancesController(balancesService),
  settlementsController: new SettlementsController(settlementsService),
  minimizationController: new MinimizationController(minimizationService),
  p2pController: new P2PController(p2pService),
  notificationsController: new NotificationsController(notificationsService),
  sysAdminController: new SysAdminController(sysAdminService, usersService),
};
