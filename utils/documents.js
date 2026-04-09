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
  const resolvedLogo = certificateLogoUrl
    ? escapeHtml(certificateLogoUrl)
    : logoUrl
    ? `${escapeHtml(logoUrl.replace(/\/$/, ''))}/Logo.png`
    : '';
  const logoMarkup = resolvedLogo
    ? `<img src="${resolvedLogo}" alt="Lasglowtech" class="logo-image" />`
    : `<div class="logo-mark">L</div>`;
  const bodyText = bodyMessage.trim()
    ? escapeHtml(bodyMessage)
    : 'This professional has demonstrated initiative and a commitment to deepening their skills and advancing their career.';

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Lasglowtech Certificate ${escapeHtml(certificateCode)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;800&display=swap" rel="stylesheet" />
    <style>
      *{box-sizing:border-box}
      body{margin:0;padding:24px;background:#0f172a;font-family:Georgia,serif}
      .page{max-width:1200px;margin:0 auto}
      .certificate{position:relative;background:linear-gradient(135deg,#1a1f3a 0%,#2d3561 100%);aspect-ratio:1.414 / 1;width:100%;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,0.35)}
      .corner{position:absolute;width:11%;height:16%;border-style:solid;z-index:1}
      .corner.tl{top:0;left:0;border-width:32px 0 0 32px;border-color:#FF6B35 transparent transparent #FF6B35}
      .corner.tr{top:0;right:0;border-width:32px 32px 0 0;border-color:#FF6B35 #FF6B35 transparent transparent}
      .corner.bl{bottom:0;left:0;border-width:0 0 32px 32px;border-color:transparent transparent #FF6B35 #FF6B35}
      .corner.br{bottom:0;right:0;border-width:0 32px 32px 0;border-color:transparent #FF6B35 #FF6B35 transparent}
      .top-stripe{position:absolute;top:8%;left:0;right:0;height:6%;background:linear-gradient(90deg,transparent,#FF6B35,transparent);opacity:.8}
      .inner{position:absolute;inset:5%;background:linear-gradient(135deg,#f9fafb 0%,#ffffff 100%);border-radius:18px;border:4px solid #1a1f3a;box-shadow:0 24px 60px rgba(26,31,58,0.32);overflow:hidden}
      .inner::before{content:'';position:absolute;inset:8px;border:2px solid #FF6B35;border-radius:14px;opacity:.3}
      .content{position:relative;height:100%;display:flex;flex-direction:column;padding:38px 52px;z-index:2}
      .brand-row{display:flex;align-items:center;gap:14px;margin-bottom:28px}
      .logo-mark{width:64px;height:64px;border-radius:999px;background:#FF6B35;border:4px solid #1a1f3a;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:28px;font-weight:800}
      .logo-image{width:64px;height:64px;border-radius:999px;object-fit:cover;border:4px solid #1a1f3a;background:#fff}
      .brand-name{font-family:'Cinzel',serif;font-size:28px;font-weight:800;letter-spacing:.08em;color:#1a1f3a}
      .brand-sub{font-size:12px;letter-spacing:.35em;color:#6b7280}
      .title-top{font-size:18px;letter-spacing:.35em;color:#6b7280;margin-bottom:8px}
      .title-main{font-family:'Cinzel',serif;font-size:76px;line-height:.95;font-weight:800;color:#1a1f3a}
      .recipient-wrap{margin:26px 0 24px;padding-bottom:16px;border-bottom:2px solid #d1d5db}
      .recipient-name{font-family:'Brush Script MT','Segoe Script',cursive;font-size:72px;line-height:1;color:#1a1f3a}
      .subcopy{font-size:22px;color:#374151;margin:0 0 16px}
      .course-name{font-family:'Cinzel',serif;font-size:42px;font-weight:700;color:#1a1f3a}
      .body-copy{margin:22px 0 24px;max-width:70%;font-size:18px;line-height:1.6;color:#4b5563}
      .footer{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;gap:24px}
      .footer .date{font-size:20px;font-weight:600;color:#1f2937}
      .footer .code{font-size:13px;color:#6b7280;margin-top:6px}
      .signature{text-align:right}
      .signature-line{width:180px;border-bottom:2px solid #1f2937;margin:0 0 8px auto}
      .signature-label{font-size:13px;color:#6b7280}
      .seal-wrap{position:absolute;right:3%;bottom:5%;width:132px;height:132px;z-index:3}
      .seal-center{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
      .seal-core{width:82px;height:82px;border-radius:999px;background:linear-gradient(135deg,#facc15,#f97316);border:4px solid #1a1f3a;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(0,0,0,.18)}
      .seal-core::after{content:'';width:46px;height:46px;border-radius:999px;background:#1a1f3a}
      .side-panel{position:absolute;right:0;top:0;bottom:0;width:16%;background:linear-gradient(180deg,#1a1f3a 0%,#2d3561 100%);border-left:4px solid #FF6B35}
      .side-panel::after{content:'';position:absolute;inset:8px;border:2px solid rgba(250,204,21,.55)}
      @media print{body{padding:0;background:#fff}.page{max-width:none}.certificate{box-shadow:none}}
    </style>
  </head>
  <body>
    <div class="page">
      <div class="certificate">
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner bl"></div>
        <div class="corner br"></div>
        <div class="top-stripe"></div>

        <div class="inner">
          <div class="content">
            <div class="brand-row">
              ${logoMarkup}
              <div>
                <div class="brand-name">LASGLOWTECH</div>
                <div class="brand-sub">DIGITAL SERVICES</div>
              </div>
            </div>

            <div>
              <div class="title-top">CERTIFICATE OF</div>
              <div class="title-main">COMPLETION</div>
            </div>

            <div class="recipient-wrap">
              <div class="recipient-name">${escapeHtml(learnerName)}</div>
            </div>

            <p class="subcopy">has successfully completed the online course</p>
            <div class="course-name">${escapeHtml(courseTitle)}</div>

            <div class="body-copy">${bodyText}</div>

            <div class="footer">
              <div>
                <div class="date">${escapeHtml(displayDate)}</div>
                <div class="code">Certificate code: ${escapeHtml(certificateCode)}</div>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-label">${escapeHtml(signatureLabel)}</div>
              </div>
            </div>
          </div>

          <div class="seal-wrap">
            <svg viewBox="0 0 100 100" width="132" height="132" aria-hidden="true">
              <circle cx="50" cy="50" r="45" fill="#1a1f3a"></circle>
              ${Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 15 * Math.PI) / 180;
                const innerRadius = 35;
                const outerRadius = 48;
                const x1 = 50 + innerRadius * Math.cos(angle);
                const y1 = 50 + innerRadius * Math.sin(angle);
                const x2 = 50 + outerRadius * Math.cos(angle);
                const y2 = 50 + outerRadius * Math.sin(angle);
                return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="white" stroke-width="3"></line>`;
              }).join('')}
            </svg>
            <div class="seal-center"><div class="seal-core"></div></div>
          </div>
        </div>

        <div class="side-panel"></div>
      </div>
    </div>
  </body>
</html>
`;
};

module.exports = {
  buildInvoiceHtml,
  buildCertificateHtml,
};
