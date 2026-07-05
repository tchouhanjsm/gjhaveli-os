/**
 * Invoice Controller Layer with PDF Remote API Sync
 * gjhaveli-os
 */

const InvoiceCtrl = {
  /**
   * Main processor for handling and building external PDFs
   * @param {Object} payloadData - Constructed schema model
   * @param {string} invoiceId
   * @return {string} Shared Google Drive download URL
   */
  generateAndSavePDF(payloadData, invoiceId) {
    const url = "https://invoice-generator.com";

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payloadData),
      muteHttpExceptions: true
    };

    // If API Key configuration exists, inject bearer permissions
    if (CONFIG.INVOICE_GENERATOR_API_KEY) {
      options.headers = {
        Authorization: "Bearer " + CONFIG.INVOICE_GENERATOR_API_KEY
      };
    }

    // Call the external API
    const response = UrlFetchApp.fetch(url, options);

    if (response.getResponseCode() !== 200) {
      throw new Error(
        "Failed to generate PDF invoice from remote engine: " + response.getContentText()
      );
    }

    // Capture binary file content stream
    const pdfBlob = response.getBlob().setName(`${invoiceId}.pdf`);

    // Write file directly into Google Drive architecture folder
    const folder = DriveApp.getFolderById(CONFIG.INVOICE_DRIVE_FOLDER_ID);
    const file = folder.createFile(pdfBlob);

    // Grant read accessibility settings
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return file.getUrl();
  },

  /**
   * Automated Trigger for Checkout operations
   */
  autoCreateOnCheckout(bookingId) {
    try {
      const booking = DB.findByKey(CONFIG.SHEETS.BOOKINGS, "id", bookingId);
      if (!booking) throw new Error("Booking record not found.");

      const room = DB.findByKey(CONFIG.SHEETS.ROOMS, "id", booking.room_id);
      if (!room) throw new Error("Linked room assets not found.");

      // Calculate length of stay nights
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);
      const nights =
        Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) || 1;

      const basePrice = Number(room.price_per_night);
      const subtotal = nights * basePrice;
      const calculatedTotal = subtotal + subtotal * (CONFIG.TAX_RATE_GST / 100);

      const invoiceId = "INV-" + Math.random().toString(36).substr(2, 9).toUpperCase();

      const tempInvoiceMeta = {
        id: invoiceId,
        booking_id: bookingId,
        amount: subtotal,
        tax: subtotal * (CONFIG.TAX_RATE_GST / 100),
        total: calculatedTotal,
        status: "Unpaid",
        created_at: new Date().toISOString()
      };

      // Compile items array for the PDF layout generator
      const items = [
        {
          name: `Room Stay - Room ${room.room_number} (${room.type})`,
          quantity: nights,
          unit_cost: basePrice,
          description: `Stay from ${booking.check_in_date} to ${booking.check_out_date}`
        }
      ];

      const payload = InvoiceCalc.buildGeneratorPayload(tempInvoiceMeta, booking, items);

      // Execute pipeline connection out to API and fetch cloud Drive path link
      const driveUrl = this.generateAndSavePDF(payload, invoiceId);

      // Append final records containing reference tracking links into Database sheet
      tempInvoiceMeta.pdf_url = driveUrl; // Ensure this header exists in your invoices sheet tab columns!
      DB.insert(CONFIG.SHEETS.INVOICES, tempInvoiceMeta);

      return { success: true, message: "Invoice PDF created successfully", url: driveUrl };
    } catch (e) {
      Logger.log("[INVOICE ERROR] " + e.toString());
      return { success: false, message: e.message };
    }
  }
};
