const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDate = (dateInput) => {
  const date = dateInput ? new Date(dateInput) : new Date();
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const buildInvoiceHtml = ({ invoiceNumber, customerName, customerEmail, serviceName, amount, currency, paidAt, txRef }) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Lasglowtech Invoice ${escapeHtml(invoiceNumber)}</title>
    <style>
      body{font-family:Arial,sans-serif;background:#f8fafc;color:#111827;margin:0;padding:24px}
      .card{max-width:780px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden}
      .hero{background:linear-gradient(135deg,#31185e 0%,#1a0e3f 70%,#ed6e00 100%);color:#fff;padding:24px}
      .hero h1{margin:0;font-size:24px}
      .hero p{margin:8px 0 0;font-size:13px;opacity:.92}
      .body{padding:24px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .meta{font-size:13px;color:#374151}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border-bottom:1px solid #e5e7eb;padding:10px;text-align:left;font-size:14px}
      th{color:#6b7280;font-weight:600}
      .total{font-weight:700}
      .footer{padding:14px 24px;color:#6b7280;font-size:12px;border-top:1px solid #e5e7eb}
    </style>
  </head>
  <body>
    <div class="card">
      <div class="hero">
        <h1>Lasglowtech Invoice</h1>
        <p>Professional digital services receipt</p>
      </div>
      <div class="body">
        <div class="grid">
          <div class="meta"><strong>Invoice No:</strong> ${escapeHtml(invoiceNumber)}</div>
          <div class="meta"><strong>Date:</strong> ${escapeHtml(formatDate(paidAt))}</div>
          <div class="meta"><strong>Client:</strong> ${escapeHtml(customerName)}</div>
          <div class="meta"><strong>Email:</strong> ${escapeHtml(customerEmail)}</div>
          <div class="meta"><strong>Payment Ref:</strong> ${escapeHtml(txRef)}</div>
        </div>
        <table>
          <thead>
            <tr><th>Description</th><th>Amount</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>${escapeHtml(serviceName)}</td>
              <td>${escapeHtml(currency)} ${Number(amount || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td class="total">Total Paid</td>
              <td class="total">${escapeHtml(currency)} ${Number(amount || 0).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="footer">
        Thank you for choosing Lasglowtech. For support: lasglowtech@gmail.com
      </div>
    </div>
  </body>
</html>
`;

const buildCertificateHtml = ({
  certificateCode,
  learnerName,
  courseTitle,
  completionDate,
  bodyMessage = '',
  signedDate = null,
  signatureLabel = 'Authorized Signatory',
  logoUrl = '',
  certificateBackgroundUrl = '',
  certificateLogoUrl = '',
}) => {
  const displayDate = signedDate ? formatDate(signedDate) : formatDate(completionDate);
  const bodyText = bodyMessage.trim()
    ? escapeHtml(bodyMessage)
    : `has successfully completed the programme <strong>${escapeHtml(courseTitle)}</strong>. Programme completion and payment have been verified by Lasglowtech.`;
  const logoSrc = certificateLogoUrl
    ? certificateLogoUrl
    : (logoUrl ? `${logoUrl.replace(/\/$/, '')}/Logo.png` : '');
  const logoImg = logoSrc ? `<img src="${escapeHtml(logoSrc)}" alt="Lasglowtech" class="logo-img" />` : '';
  const hasCustomBg = Boolean(certificateBackgroundUrl && certificateBackgroundUrl.trim());
  const hasOverlayText = Boolean(
    (learnerName && String(learnerName).trim() && String(learnerName).trim().toLowerCase() !== 'learner') ||
    (courseTitle && String(courseTitle).trim()) ||
    (bodyMessage && String(bodyMessage).trim())
  );
  const showOnlyDesign = hasCustomBg && !hasOverlayText;
  const bgStyle = hasCustomBg
    ? `background: url('${escapeHtml(certificateBackgroundUrl)}') center/cover no-repeat;`
    : certificateBackgroundUrl
    ? `background: linear-gradient( rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.92) 100% ), url('${escapeHtml(certificateBackgroundUrl)}') center/cover no-repeat;`
    : 'background: linear-gradient(135deg, #f8f7f5 0%, #ebe9e6 50%, #f0eeeb 100%);';
  const certWrapClass = hasCustomBg ? 'cert-wrap cert-wrap-custom' : 'cert-wrap';
  const certMainClass = hasCustomBg ? 'cert-main cert-main-custom' : 'cert-main';
  const sidebarHtml = hasCustomBg ? '' : `
      <div class="cert-sidebar">
        <div class="cert-seal">LGT</div>
      </div>`;
  const contentHtml = showOnlyDesign ? '' : `
        <div class="verified-watermark" aria-hidden="true"><div class="verified-text">VERIFIED</div><div class="verified-stars">★ ★ ★</div></div>
        <div class="cert-content">
          <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
          <div class="gold tl"></div><div class="gold tr"></div><div class="gold bl"></div><div class="gold br"></div>
          <div class="head-row">
            <div class="badge-left">CERTIFICATE</div>
            <div class="brand">${logoImg ? logoImg + ' ' : ''}LASGLOWTECH</div>
          </div>
          <div class="title-block">
            <div class="title-top">CERTIFICATE OF</div>
            <div class="title-main">COMPLETION</div>
          </div>
          <p class="presented">PROUDLY PRESENTED TO</p>
          <div class="recipient-name">${escapeHtml(learnerName)}</div>
          <div class="body-text">
            <p>${bodyText}</p>
          </div>
          <div class="sig-row">
            <div class="date-block">Date <strong>${escapeHtml(displayDate)}</strong></div>
            <div class="sig-block">${escapeHtml(signatureLabel)}<div class="sig-line"></div></div>
          </div>
          <div class="cert-id">Certificate code: ${escapeHtml(certificateCode)}</div>
        </div>`;
  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Lasglowtech Certificate ${escapeHtml(certificateCode)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Libre+Baskerville:wght@400;700&display=swap" rel="stylesheet" />
    <style>
      *{box-sizing:border-box}
      body{font-family:'Libre Baskerville',Georgia,serif;background:#e5e2dd;margin:0;padding:24px;color:#1a0e3f}
      .cert-wrap{max-width:920px;margin:0 auto;position:relative;display:flex;min-height:520px;box-shadow:0 8px 32px rgba(49,24,94,0.15)}
      .cert-wrap-custom{max-width:100%;min-height:520px;aspect-ratio:1.6}
      .cert-main{flex:1;position:relative;padding:0;${bgStyle} border:12px solid #31185e; border-right:none;}
      .cert-main-custom{border:1px solid rgba(0,0,0,0.08);border-right:1px solid rgba(0,0,0,0.08)}
      .cert-main-custom::before,.cert-main-custom::after{display:none}
      .cert-main-custom .corner,.cert-main-custom .gold{display:none}
      .cert-main-custom .verified-watermark{opacity:0.04}
      .cert-main-custom .badge-left{background:rgba(0,0,0,0.5);color:#fff}
      .cert-main-custom .cert-content{text-shadow:0 1px 2px rgba(255,255,255,0.9)}
      .cert-main-custom .recipient-name,.cert-main-custom .body-text,.cert-main-custom .title-block .title-main{text-shadow:0 1px 3px rgba(255,255,255,0.95)}
      .cert-main::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#F1AB1E,#ed6e00);z-index:2;pointer-events:none}
      .cert-main::after{content:'';position:absolute;top:8px;left:8px;right:8px;bottom:8px;border:2px solid #F1AB1E;pointer-events:none;z-index:0}
      .cert-sidebar{width:100px;background:linear-gradient(180deg,#31185e 0%,#1a0e3f 100%);position:relative;border:12px solid #31185e;border-left:6px solid #31185e}
      .cert-sidebar::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:4px;height:100%;background:linear-gradient(180deg,#F1AB1E,#ed6e00);opacity:0.9}
      .cert-seal{position:absolute;bottom:80px;left:50%;transform:translateX(-50%);width:60px;height:60px;border:4px solid #F1AB1E;border-radius:50%;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#31185e;letter-spacing:0.5px;box-shadow:0 0 0 2px rgba(241,171,30,0.5)}
      .verified-watermark{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-18deg);pointer-events:none;z-index:0;text-align:center}
      .verified-watermark .verified-text{font-size:64px;font-weight:800;color:#31185e;letter-spacing:6px;opacity:0.08;text-shadow:0 0 40px rgba(255,255,255,0.5)}
      .verified-watermark .verified-stars{margin-top:4px;font-size:20px;color:#31185e;opacity:0.07;letter-spacing:6px}
      .corner{position:absolute;width:40px;height:40px;border-color:#31185e;border-style:solid;border-width:0;z-index:2}
      .corner.tl{top:20px;left:20px;border-top-width:4px;border-left-width:4px}
      .corner.tr{top:20px;right:20px;border-top-width:4px;border-right-width:4px}
      .corner.bl{bottom:20px;left:20px;border-bottom-width:4px;border-left-width:4px}
      .corner.br{bottom:20px;right:20px;border-bottom-width:4px;border-right-width:4px}
      .gold{position:absolute;width:20px;height:20px;border:2px solid #F1AB1E;z-index:2}
      .gold.tl{top:26px;left:26px}
      .gold.tr{top:26px;right:26px}
      .gold.bl{bottom:26px;left:26px}
      .gold.br{bottom:26px;right:26px}
      .cert-content{position:relative;z-index:1;padding-right:24px}
      .head-row{display:flex;justify-content:space-between;align-items:flex-start;padding:24px 32px 12px}
      .brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px;color:#31185e;letter-spacing:0.5px}
      .logo-img{height:42px;width:auto;object-fit:contain}
      .badge-left{background:#31185e;color:#F1AB1E;padding:6px 12px;font-size:11px;font-weight:700;letter-spacing:1px}
      .title-block{text-align:center;padding:12px 32px 8px}
      .title-block .title-top{margin:0;font-size:18px;font-weight:600;color:#374151;letter-spacing:3px}
      .title-block .title-main{margin:4px 0 0;font-size:42px;font-weight:700;color:#31185e;letter-spacing:2px}
      .presented{text-align:center;font-size:13px;color:#374151;letter-spacing:2px;margin-top:16px}
      .recipient-name{text-align:center;font-family:'Great Vibes',cursive;font-size:48px;color:#31185e;margin:10px 0 20px;font-weight:400;line-height:1.2;text-decoration:underline;text-decoration-style:dashed;text-underline-offset:6px}
      .body-text{padding:0 40px;text-align:center;font-size:15px;line-height:1.7;color:#374151;max-width:640px;margin:0 auto}
      .body-text p{margin:0 0 10px}
      .sig-row{display:flex;justify-content:space-between;align-items:flex-end;padding:28px 48px 24px;margin-top:8px}
      .sig-row .date-block{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b7280}
      .sig-row .date-block strong{display:block;font-size:14px;color:#1a0e3f;margin-top:4px;text-transform:none}
      .sig-row .sig-block{text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b7280}
      .sig-row .sig-line{border-bottom:1px solid #1a0e3f;width:180px;margin-top:28px;margin-left:auto;height:24px}
      .cert-id{padding:10px 32px 20px;text-align:center;font-size:11px;color:#6b7280}
    </style>
  </head>
  <body>
    <div class="${certWrapClass}">
      <div class="${certMainClass}">
        <div class="verified-watermark" aria-hidden="true"><div class="verified-text">VERIFIED</div><div class="verified-stars">★ ★ ★</div></div>
        <div class="cert-content">
          <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
          <div class="gold tl"></div><div class="gold tr"></div><div class="gold bl"></div><div class="gold br"></div>
          <div class="head-row">
            <div class="badge-left">CERTIFICATE</div>
            <div class="brand">${logoImg ? logoImg + ' ' : ''}LASGLOWTECH</div>
          </div>
          <div class="title-block">
            <div class="title-top">CERTIFICATE OF</div>
            <div class="title-main">COMPLETION</div>
          </div>
          <p class="presented">PROUDLY PRESENTED TO</p>
          <div class="recipient-name">${escapeHtml(learnerName)}</div>
          <div class="body-text">
            <p>${bodyText}</p>
          </div>
          <div class="sig-row">
            <div class="date-block">Date <strong>${escapeHtml(displayDate)}</strong></div>
            <div class="sig-block">${escapeHtml(signatureLabel)}<div class="sig-line"></div></div>
          </div>
          <div class="cert-id">Certificate code: ${escapeHtml(certificateCode)}</div>
        </div>
      </div>${sidebarHtml}
    </div>
  </body>
</html>
`;
};

module.exports = {
  buildInvoiceHtml,
  buildCertificateHtml,
};

