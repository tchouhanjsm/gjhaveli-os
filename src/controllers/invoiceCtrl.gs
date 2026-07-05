/**
 * Invoice Controller Layer
 * gjhaveli-os
 */

const InvoiceCtrl = {
  /**
   * Automated Trigger for Checkout operations
   * @param {string} bookingId
   * @return {Object} Invoice results
   */
  autoCreateOnCheckout(bookingId) {
    try {
      // 1. Fetch booking record
      const booking = DB.findByKey(CONFIG.SHEETS.BOOKINGS, "id", bookingId);
      if (!booking) throw new Error("Booking record not found.");

      // 2. Fetch room pricing metadata
      const room = DB.findByKey(CONFIG.SHEETS.ROOMS, "id", booking.room_id);
      if (!room) throw new Error("Linked room assets not found.");

      // 3. Compute Invoice Math
      const pricing = InvoiceCalc.calculateRoomStay(
        booking.check_in_date,
        booking.check_out_date,
        Number(room.price_per_night)
      );

      const newInvoice = {
        id: "INV-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        booking_id: bookingId,
        amount: pricing.baseAmount,
        tax: pricing.tax,
        total: pricing.total,
        status: "Unpaid",
        created_at: new Date().toISOString()
      };

      // 4. Record to Database sheet
      DB.insert(CONFIG.SHEETS.INVOICES, newInvoice);
      return { success: true, data: newInvoice };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  /**
   * Manual manual creation form input override
   */
  createManualInvoice(formData) {
    try {
      const newInvoice = {
        id: "INV-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        booking_id: formData.booking_id || "MANUAL_BILL",
        amount: Number(formData.amount),
        tax: Number(formData.tax || 0),
        total: Number(formData.amount) + Number(formData.tax || 0),
        status: formData.status || "Unpaid",
        created_at: new Date().toISOString()
      };

      DB.insert(CONFIG.SHEETS.INVOICES, newInvoice);
      return { success: true, data: newInvoice };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }
};
