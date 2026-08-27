Goal: Add PSD/Canva template products to Lasglowtech's catalogue, add a course+template bundle option,
add an agency lead-gen callout, and fix the success page — all configurable from the existing admin
dashboard (src/pages/dashboard/catalogues.jsx), not hardcoded per-product.

=== CONFIRMED CURRENT BEHAVIOR — build on this, don't rebuild it ===
- Everything a product needs is already entered once in the admin catalogue form
  (src/pages/dashboard/catalogues.jsx, defaultForm ~line 26-45) and then rendered generically by
  CatalogueProductCard.jsx, catalogue-detail.jsx, checkout.jsx, and payment-success.jsx. New fields
  must follow this same pattern: add to defaultForm + the form UI + let the existing render components
  read them conditionally. No new pages, no per-product hardcoding.
- Digital file delivery already works and is fully backend-automated:
    - deliveryType: "digital_link" -> admin pastes any external URL (Google Drive OR Canva template
      link OR any URL) into `deliverableExternalUrl`. Link is emailed to the buyer automatically after
      payment (dashboard/catalogues.jsx ~line 458) and also returned via
      GET /payments/verify/:txRef as delivery.externalUrl.
    - deliveryType: "digital_file" -> admin uploads a file (accept=".pdf,.zip,.epub,.doc,.docx" today,
      no .psd). Not needed for PSD/Canva work since digital_link already covers it.
- Cart/"Checkout Queue" (src/pages/cart.jsx) is a save-for-later list, NOT a combined checkout. Each
  item still checks out individually via GET /payments/packages/:slug and
  POST /payments/initialize { serviceSlug, ... } (src/pages/checkout.jsx). No multi-item cart charge
  exists — don't assume one.
- Full LMS already exists and is already in production use (e.g. "Learn Canva in 3 Days"):
  courses/modules/quizzes/enrollments/certificates, admin-managed at dashboard/lms.jsx, API under
  /lms/admin/*. Don't rebuild any of this — reuse it for the course-bundle feature below.
- payment-success.jsx currently AUTO-REDIRECTS after 1.8s when deliveryType === "digital_link"
  (lines 55-61: `window.setTimeout(() => window.location.href = delivery.externalUrl, 1800)`).
  This must change — see step 4.
- Payments are Flutterwave only (isValidFlutterwaveLink in checkout.jsx). Do not introduce Paystack.

=== IMPLEMENT ===

1. Admin form: new fields (src/pages/dashboard/catalogues.jsx defaultForm + form UI)
   - `assetFormat` (free text or select: "PSD" | "AI" | "Canva" | "" ) — drives the card badge.
     Leave blank/none for non-template products (courses, services) so the badge only shows when set.
   - `licenseNote` (free text, optional, e.g. "Commercial license included") — shown on
     catalogue-detail.jsx under the price, not on the card (keep the card compact).
   - `licenseTier` (optional select: "personal" | "commercial" | "extended") — lets admin sell the
     same asset at different price points by creating separate catalogue entries per tier
     (e.g. same title + " (Commercial License)" suffix, different price). No backend logic needed —
     it's just another catalogue entry, exactly like premiumPackageTemplates already does for
     service packages.
   - `linkedCourseSlug` (optional text field, or a select populated from GET /lms/admin/courses) —
     when set, this catalogue item is a "template + course bundle": the admin picks an existing LMS
     course to pair with a digital_link template. Purely a data pointer; actual enrollment logic
     stays inside the existing LMS system — don't duplicate it.
   - All new fields optional with sane defaults so existing service/course entries are unaffected.

2. CatalogueProductCard.jsx
   - When item.assetFormat is truthy, render a small top badge (e.g. "PSD TEMPLATE", "CANVA TEMPLATE")
     above the title, styled like the existing tag pills (bg-white/5 border border-white/10, same
     rounded-full sizing as the packageTier/Popular/Digital tags already rendered by cardTags()).
   - When item.linkedCourseSlug is set, add a small "+ Course included" tag alongside the existing tags.
   - Don't remove or restructure existing tag/badge logic — just extend cardTags() and the render.

3. catalogue-detail.jsx
   - Show licenseNote (if present) near the price.
   - When linkedCourseSlug is present, show a short line: "Includes the [Course Title] mini-course —
     access unlocks after purchase" (fetch course title from the linked course, or just display the
     slug/label the admin entered if no course lookup exists on this page yet).

4. payment-success.jsx — remove blind auto-redirect, always show the page + link
   - Delete or gate the auto-redirect useEffect (lines 55-61) so digital_link deliveries no longer
     auto-navigate away. Instead:
     - Keep the existing "Open product now" button/link pointing to delivery.externalUrl.
     - Relabel it contextually when the product is a template (e.g. "Open your files") vs. other
       digital_link uses (e.g. WhatsApp group invite) — base this on assetFormat or a delivery label
       already available in the `delivery` payload, not a hardcoded string.
     - Update the copy to: "Your files are ready. We've also emailed the link to you."
   - Directly below the button, render the AgencyCallout component (step 5).

5. New component: src/components/sections/AgencyCallout.jsx
   - Content: "Need more than templates? We build custom websites, web apps, mobile apps, and full
     brand identities." + a button "Book a Free Discovery Call" linking to a WhatsApp URL built from
     src/utils/siteConfig.js `phone` (same wa.me pattern as src/components/WhatsAppFloat.jsx) —
     reuse that helper/pattern rather than hardcoding a new number.
   - Style: brand-card block, consistent with existing card styling (rounded-3xl, existing color
     tokens: bg-Primarycolor, text-Secondarycolor, text-textcolor2).
   - Mount it: (a) on payment-success.jsx under the product-ready block, (b) on catalogue-detail.jsx
     for items where assetFormat is set (i.e. template products, not courses/services), (c) optionally
     on checkout.jsx below the payment form for the same item types.

6. Order bumps — SCOPE NOTE, needs backend change, keep separate from the rest
   - Do NOT attempt this in the same pass as steps 1-5. It requires POST /payments/initialize to accept
     an `addOns` array and recompute the charged amount server-side (never trust a client-sent total).
   - Until that backend work is scheduled, do not add fake checkboxes that don't actually charge —
     that's misleading to the buyer. Use the AgencyCallout link instead for "want this customized?" asks.

7. No changes needed for delivery/email logic itself
   - The email-sending backend is outside this frontend repo. If receipt-email copy needs an added
     portfolio link, file that as a separate backend ticket — do not attempt to edit it from this repo.

=== ACCEPTANCE CHECK ===
- A non-technical admin can create a new PSD or Canva template product entirely from the existing
  admin dashboard form (title, price, deliveryType: digital_link, paste Drive/Canva URL, set
  assetFormat, optionally set licenseNote/licenseTier/linkedCourseSlug) with zero code changes needed
  per product.
- Existing service packages and the LMS course flow are untouched and keep working exactly as before.
- payment-success.jsx no longer silently redirects away from digital_link deliveries.

Ship as separate PRs: (1) admin fields + card badge + detail page, (2) success page fix + AgencyCallout,
(3) backend note for order bumps (not implemented yet), (4) backend note for receipt email portfolio link.