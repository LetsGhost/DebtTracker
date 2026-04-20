import { GroupModel } from "@/backend/modules/groups/group.entity";
import { GroupMemberModel } from "@/backend/modules/groups/group-member.entity";
import { SettlementModel } from "@/backend/modules/settlements/settlement.entity";
import { UserModel } from "@/backend/modules/users/users.entity";
import { ExpenseModel } from "@/backend/modules/expenses/expense.entity";

export class SysAdminService {
  async getStats() {
    const [users, groups, activeMemberships, expenses, pendingSettlements] = await Promise.all([
      UserModel.countDocuments({}),
      GroupModel.countDocuments({ deletedAt: null }),
      GroupMemberModel.countDocuments({ removedAt: null }),
      ExpenseModel.countDocuments({}),
      SettlementModel.countDocuments({ status: "pending_receiver" }),
    ]);

    return {
      users,
      groups,
      activeMemberships,
      expenses,
      pendingSettlements,
    };
  }
}
