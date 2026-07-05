/**
 * Booking Business Logic Service
 * gjhaveli-os
 */

const BookingService = {
  /**
   * Verifies if a specific room is available for a given date range
   * @param {string} roomId
   * @param {string|Date} checkIn
   * @param {string|Date} checkOut
   * @return {boolean}
   */
  isRoomAvailable(roomId, checkIn, checkOut) {
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();

    if (start >= end) {
      throw new Error("Check-out date must be after the check-in date.");
    }

    // Fetch all current bookings from our DB driver
    const allBookings = DB.findAll(CONFIG.SHEETS.BOOKINGS);

    // Filter bookings linked to this room that are not already checked out
    const activeBookings = allBookings.filter(
      (b) => b.room_id == roomId && b.status !== "Checked-Out"
    );

    // Look for date overlaps
    for (let booking of activeBookings) {
      const bStart = new Date(booking.check_in_date).getTime();
      const bEnd = new Date(booking.check_out_date).getTime();

      // Overlap formula: (StartA < EndB) AND (EndA > StartB)
      if (start < bEnd && end > bStart) {
        return false; // Collision detected!
      }
    }

    return true; // Room is completely clear
  },

  /**
   * Generates a unique, standardized ID for bookings or transactions
   * @param {string} prefix - e.g., "BK" for booking
   * @return {string}
   */
  generateUniqueId(prefix) {
    return prefix + "-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
};
