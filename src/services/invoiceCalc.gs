/**
 * Invoice Mathematical Calculation & Schema Engine
 * gjhaveli-os
 */

const InvoiceCalc = {
  /**
   * Generates a fully payload-compliant JSON schema for invoice-generator.com API
   * @param {Object} invoiceMeta - System records tracking database values
   * @param {Object} bookingMeta
   * @param {Array<Object>} lineItems - Custom or automated stay lists
   * @return {Object} Payload matching invoice-generator.com schema
   */
  buildGeneratorPayload(invoiceMeta, bookingMeta, lineItems) {
    return {
      from: CONFIG.HOTEL_BILLING_FROM,
      to: `${bookingMeta.guest_name}\nEmail: ${bookingMeta.guest_email}`,
      logo: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=150", // Placeholder hotel brand logo
      number: invoiceMeta.id,
      date: new Date(invoiceMeta.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }),
      currency: "INR",
      items: lineItems.map((item) => ({
        name: item.name,
        quantity: Number(item.quantity),
        unit_cost: Number(item.unit_cost),
        description: item.description || ""
      })),
      fields: {
        tax: "%",
        discounts: false,
        shipping: false
      },
      tax: CONFIG.TAX_RATE_GST, // Injects 5% GST into the API engine layout
      notes: "Thank you for staying at Garh Jaisal Haveli. Have a safe journey!"
    };
  }
};
