/**
 * Role-Based Access Control (RBAC) Service Engine
 */

const RBAC = {
  /**
   * Verifies if an email exists in the users database and maps their access tier
   * @param {string} email
   * @return {Object|null} User contextual authorization payload
   */
  getUserAccess(email) {
    if (!email) return null;
    return DB.findByKey(CONFIG.SHEETS.USERS, "email", email.toLowerCase().trim());
  },

  /**
   * Middleware validation to assert if user permissions suffice
   * @param {string} userRole - Current role of active user
   * @param {Array<string>} allowedRoles - Collection of allowed roles for the action
   * @return {boolean}
   */
  authorize(userRole, allowedRoles) {
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  }
};
