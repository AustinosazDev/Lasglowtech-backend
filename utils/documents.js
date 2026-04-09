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
    : `<div class="logo-fallback">
         <div class="logo-mark">L</div>
         <div>
           <div class="brand-name">LASGLOWTECH</div>
           <div class="brand-sub">DIGITAL SERVICES</div>
         </div>
       </div>`;
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
      body{margin:0;padding:24px;background:#1d2348;font-family:Georgia,serif}
      .page{max-width:1200px;margin:0 auto}
      .certificate{position:relative;background:#1d2348;aspect-ratio:1.414 / 1;width:100%;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,0.35)}
      .corner{position:absolute;width:16%;height:8.5%;border-style:solid;border-color:#ff6b35;z-index:1}
      .corner.tl{top:0;left:0;border-width:18px 0 0 18px}
      .corner.tr{top:0;right:0;border-width:18px 18px 0 0}
      .corner.bl{bottom:0;left:0;border-width:0 0 18px 18px}
      .corner.br{bottom:0;right:0;border-width:0 18px 18px 0}
      .inner{position:absolute;inset:4.2%;background:#f8f6f2;border-radius:18px;border:1px solid #f27b48;box-shadow:0 18px 60px rgba(0,0,0,.25);overflow:hidden}
      .inner::before{content:'';position:absolute;inset:2px;border:1px solid #cfd4df;border-radius:16px}
      .content{position:relative;height:100%;display:flex;flex-direction:column;padding:5.2% 4.8% 5.3%;z-index:2}
      .side-panel{position:absolute;right:0;top:0;bottom:0;width:15.5%;background:#1d2348;border-left:2px solid #ff7a3d}
      .brand-row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:4.6%}
      .logo-fallback{display:flex;align-items:center;gap:14px}
      .logo-mark{width:48px;height:48px;border-radius:999px;background:#ff6b35;border:2px solid #1d2348;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:24px;font-weight:800}
      .logo-image{height:56px;max-width:300px;object-fit:contain}
      .brand-name{font-family:'Cinzel',serif;font-size:26px;font-weight:800;letter-spacing:.08em;color:#13224a}
      .brand-sub{font-size:10px;letter-spacing:.38em;color:#a06b53}
      .title-top{font-family:'Cinzel',serif;font-size:14px;letter-spacing:.42em;color:#8f7966;margin-bottom:6px}
      .title-main{font-family:'Cinzel',serif;font-size:70px;line-height:.95;font-weight:800;color:#13224a}
      .recipient-wrap{margin:0 0 4.2%;padding:0 16% 2% 0;border-bottom:1px solid #b8bfcb}
      .recipient-name{font-family:'Brush Script MT','Segoe Script',cursive;font-size:64px;line-height:1;color:#10214b}
      .subcopy-wrap{padding-right:18%}
      .subcopy{font-size:20px;color:#1b1f2f;margin:0 0 1.8%}
      .course-name{font-family:'Cinzel',serif;font-size:33px;font-weight:700;line-height:1.1;color:#13224a;text-transform:uppercase}
      .body-copy{margin-top:3%;max-width:66%;font-size:15px;line-height:1.55;color:#263252}
      .footer{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;gap:24px;padding-right:18%}
      .footer .date{font-family:'Cinzel',serif;font-size:24px;font-weight:600;color:#13224a}
      .footer .code{font-size:11px;color:#6c7285;margin-top:4px}
      .signature{text-align:right;padding-bottom:4px}
      .signature-line{width:128px;border-bottom:1px solid #1a244f;margin:0 0 6px auto}
      .signature-label{font-size:10px;color:#596073}
      .seal-wrap{position:absolute;right:6.5%;bottom:8.8%;display:flex;align-items:flex-end;gap:8px;z-index:3}
      .seal-stem{width:96px;border-bottom:1px solid #1a244f}
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
        <div class="inner">
          <div class="side-panel"></div>
          <div class="content">
            <div class="brand-row">
              ${logoMarkup}
            </div>

            <div>
              <div class="title-top">CERTIFICATE OF</div>
              <div class="title-main">COMPLETION</div>
            </div>

            <div class="recipient-wrap">
              <div class="recipient-name">${escapeHtml(learnerName)}</div>
            </div>

            <div class="subcopy-wrap">
              <p class="subcopy">has successfully completed the online course</p>
              <div class="course-name">${escapeHtml(courseTitle)}</div>
            </div>

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
            <div class="seal-stem"></div>
            <svg viewBox="0 0 100 100" width="96" height="96" aria-hidden="true">
              <circle cx="50" cy="50" r="31" fill="#1f2752"></circle>
              ${Array.from({ length: 28 }).map((_, i) => {
                const angle = (i * 12.857 * Math.PI) / 180;
                const innerRadius = 32;
                const outerRadius = 46;
                const x1 = 50 + innerRadius * Math.cos(angle);
                const y1 = 50 + innerRadius * Math.sin(angle);
                const x2 = 50 + outerRadius * Math.cos(angle);
                const y2 = 50 + outerRadius * Math.sin(angle);
                return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="white" stroke-width="3"></line>`;
              }).join('')}
              <circle cx="50" cy="50" r="20" fill="#ff6b35"></circle>
              <circle cx="50" cy="50" r="11" fill="#1f2752"></circle>
            </svg>
          </div>
        </div>
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
