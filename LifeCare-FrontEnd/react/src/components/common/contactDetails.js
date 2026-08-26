/** Single source of truth for the contact details shown in the footer and on
 *  the Contact page, so the two can never drift apart. */

export const CONTACT_EMAIL = "15aniruddh@gmail.com";

/* The footer fits each of these on one line. The narrower Contact-page card
 * has to wrap the second one, so the pincode is tied to the state with a
 * non-breaking space — it breaks after "Bengaluru," instead of stranding
 * "560068" on a line of its own. */
export const CONTACT_ADDRESS_LINES = [
  "87/88, 8th Cross Road, Madina Nagar",
  "Mangammanapalya, Bengaluru, Karnataka 560068",
];

export const SUPPORT_HOURS_LINES = [
  "Helpline open 24 / 7",
  "Office: Mon-Sat, 9am - 6pm",
];
