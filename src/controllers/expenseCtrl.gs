/**
 * Expense & Salary Management Controller
 * gjhaveli-os
 */

const ExpenseCtrl = {
  /**
   * Logs an operational expense or salary payout to the database
   * @param {Object} formData - Input data from the portal UI
   * @param {Object} userContext - Contextual profile details of the current operator
   * @return {Object} Status execution response payload
   */
  createExpense(formData, userContext) {
    // 1. Core Security Gate: Only Admin and Manager tiers can modify finances
    const isAuthorized = RBAC.authorize(userContext.role, [
      CONFIG.ROLES.ADMIN,
      CONFIG.ROLES.MANAGER
    ]);

    if (!isAuthorized) {
      return {
        success: false,
        message: "Access Denied: Insufficient authorization to log expenditures."
      };
    }

    // 2. Structural Destructuring & Primitive Type Casting
    const { category, amount, description, date } = formData;

    if (!category || !amount || isNaN(amount) || Number(amount) <= 0) {
      return { success: false, message: "Validation Failure: Invalid or empty allocation amount." };
    }

    try {
      // 3. Construct clean audited transactional data record
      const newExpense = {
        id: "EXP-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        category: category, // e.g., 'Salary', 'Utility', 'Maintenance'
        amount: Number(amount),
        description: description || "",
        date: date || new Date().toISOString().split("T")[0], // Falls back to current date string
        recorded_by: userContext.email.toLowerCase().trim() // Immutable audit trail footprint
      };

      // 4. Thread-Safe Insert via our Database driver
      DB.insert(CONFIG.SHEETS.EXPENSES, newExpense);

      return {
        success: true,
        message: `Successfully logged transaction under ${category}.`,
        expenseId: newExpense.id
      };
    } catch (error) {
      Logger.log(`[EXPENSE CTRL ERROR] Processing failure: ${error.toString()}`);
      return { success: false, message: "Internal Server Processing Error: " + error.message };
    }
  },

  /**
   * Compiles monthly aggregated financial records for the manager dashboard view
   * @param {Object} userContext
   * @return {Object} Categorized metrics breakdowns
   */
  getFinancialSummary(userContext) {
    const isAuthorized = RBAC.authorize(userContext.role, [
      CONFIG.ROLES.ADMIN,
      CONFIG.ROLES.MANAGER
    ]);

    if (!isAuthorized) {
      return { success: false, message: "Access Denied." };
    }

    const allExpenses = DB.findAll(CONFIG.SHEETS.EXPENSES);
    const summary = {
      total_spent: 0,
      salary: 0,
      utilities: 0,
      maintenance: 0,
      other: 0
    };

    allExpenses.forEach((item) => {
      const amt = Number(item.amount) || 0;
      summary.total_spent += amt;

      const cat = (item.category || "").toLowerCase();
      if (cat === "salary") summary.salary += amt;
      else if (cat === "utility" || cat === "utilities") summary.utilities += amt;
      else if (cat === "maintenance") summary.maintenance += amt;
      else summary.other += amt;
    });

    return { success: true, data: summary };
  }
};
