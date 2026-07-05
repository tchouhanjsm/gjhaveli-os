/**
 * Booking API Controller Layer
 * gjhaveli-os
 */

const BookingCtrl = {
  /**
   * Processes a front-desk request to create a new reservation
   * @param {Object} requestData - Form inputs from the UI portal
   * @param {Object} userContext - Context of the operator making the entry
   * @return {Object} Response execution status
   */
  createBooking(requestData, userContext) {
    // 1. RBAC Check: Ensure the user is Staff, Manager, or Admin
    const isAuthorized = RBAC.authorize(userContext.role, [
      CONFIG.ROLES.ADMIN,
      CONFIG.ROLES.MANAGER,
      CONFIG.ROLES.STAFF
    ]);

    if (!isAuthorized) {
      return { success: false, message: "Unauthorized: Insufficient permissions." };
    }

    const { room_id, guest_name, guest_email, check_in_date, check_out_date } = requestData;

    try {
      // 2. Validate Room Availability
      const clear = BookingService.isRoomAvailable(room_id, check_in_date, check_out_date);
      if (!clear) {
        return { success: false, message: "Selected room is already booked for these dates." };
      }

      // 3. Compile Data Payload
      const newBooking = {
        id: BookingService.generateUniqueId("BK"),
        room_id: room_id,
        guest_name: guest_name,
        guest_email: guest_email,
        check_in_date: check_in_date,
        check_out_date: check_out_date,
        status: "Booked"
      };

      // 4. Thread-Safe Insert into Database via Driver
      DB.insert(CONFIG.SHEETS.BOOKINGS, newBooking);

      return {
        success: true,
        message: "Booking successfully created.",
        bookingId: newBooking.id
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};
