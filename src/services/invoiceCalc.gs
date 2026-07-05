/**
 * Invoice Mathematical Calculation Engine
 * gjhaveli-os
 */

const InvoiceCalc = {
  /**
   * Calculates total room cost based on nights stayed
   * @param {string} checkInStr
   * @param {string} checkOutStr
   * @param {number} pricePerNight
   * @return {Object} Breakdown of total, tax, and base amount
   */
  calculateRoomStay(checkInStr, checkOutStr, pricePerNight) {
    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    // Calculate difference in nights
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    const baseAmount = (nights <= 0 ? 1 : nights) * pricePerNight;
    const taxRate = 0.12; // Standard 12% luxury room tax
    const tax = baseAmount * taxRate;
    const total = baseAmount + tax;

    return {
      baseAmount: baseAmount,
      tax: tax,
      total: total
    };
  }
};
