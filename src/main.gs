/**
 * Main Application Entry Point Router
 * Web App HTTP Interface Gateway (doPost Engine)
 * gjhaveli-os
 */

/**
 * Handles all incoming portal form submissions and API traffic
 * @param {Object} e - HTTP POST event configuration from Google network layer
 * @return {HtmlOutput} JSON formatted server payload response
 */
function doPost(e) {
  // 1. Establish structural response container framework
  const output = {
    success: false,
    message: "Malformed request or unhandled routing exception.",
    data: null
  };

  try {
    // 2. Parse incoming JSON body parameter string safety
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Bad Request: Missing parameter execution body contents.");
    }

    const requestPayload = JSON.parse(e.postData.contents);
    const action = requestPayload.action;
    const data = requestPayload.data || {};

    if (!action) {
      throw new Error("Routing Target Error: The parameter 'action' must be explicitly declared.");
    }

    // 3. Authenticate User Context Identity footprints via Google Active Sessions
    const currentEmail = Session.getActiveUser().getEmail();
    if (!currentEmail) {
      throw new Error("Authentication Failure: Client session identification missing.");
    }

    // Resolve structural profile roles from database registers
    const userContext = RBAC.getUserAccess(currentEmail);
    if (!userContext) {
      return compileJsonResponse({
        success: false,
        message: `Access Blocked: Your account (${currentEmail}) is not registered in the system.`
      });
    }

    // 4. Centralized Application Command Routing Gateway Matrix
    let executionResult;

    switch (action) {
      // --- BOOKING ENGINE DOMAINS ---
      case "createBooking":
        executionResult = BookingCtrl.createBooking(data, userContext);
        break;

      // --- INVOICING & CHECKOUT DOMAINS ---
      case "checkOut":
        executionResult = InvoiceCtrl.autoCreateOnCheckout(data.bookingId);
        break;

      case "createManualInvoice":
        executionResult = InvoiceCtrl.createManualInvoice(data);
        break;

      // --- EXPENSE & FINANCES DOMAINS ---
      case "logExpense":
        executionResult = ExpenseCtrl.createExpense(data, userContext);
        break;

      case "getFinances":
        executionResult = ExpenseCtrl.getFinancialSummary(userContext);
        break;

      default:
        throw new Error(`Routing Target Error: Action handler "${action}" is not implemented.`);
    }

    // Map internal controller outputs back to client response wrapper
    output.success = executionResult.success;
    output.message = executionResult.message;
    if (executionResult.data || executionResult.bookingId || executionResult.url) {
      output.data = executionResult.data || executionResult;
    }
  } catch (error) {
    Logger.log(`[FATAL ROUTER ERROR] Executing failure trace: ${error.toString()}`);
    output.success = false;
    output.message = error.message;
  }

  // 5. Build and transmit secure, unified JSON string back out to frontend
  return compileJsonResponse(output);
}

/**
 * Utility helper to compile structured Apps Script CORS JSON string responses
 * @param {Object} dataPayload
 * @return {HtmlOutput}
 */
function compileJsonResponse(dataPayload) {
  const stringified = JSON.stringify(dataPayload);
  return HtmlService.createHtmlOutput(stringified)
    .setXFrameOptionsMode(HtmlService.SandboxMode.IFRAME)
    .setMimeType(HtmlService.MimeType.JSON);
}

/**
 * Basic GET route validation hook to confirm API online status health indicators
 */
function doGet() {
  return HtmlService.createHtmlOutput(
    `<h1>${CONFIG.APP_NAME}</h1><p>Backend API Engine Status: ONLINE (v${CONFIG.VERSION})</p>`
  );
}
