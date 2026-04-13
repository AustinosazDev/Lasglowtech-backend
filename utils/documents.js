const { getPublicClientOrigin } = require('./publicClientOrigin');

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Matches frontend certificate-preview ordinal date (en-GB). */
const formatCertificateDate = (input) => {
  if (!input) return '';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return String(input);
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
      ? 'nd'
      : day % 10 === 3 && day !== 13
      ? 'rd'
      : 'th';
  return `${day}${suffix} ${date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })}`;
};

const formatInvoiceDate = (dateInput) => {
  const date = dateInput ? new Date(dateInput) : new Date();
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const buildInvoiceHtml = ({
  invoiceNumber,
  customerName,
  customerEmail,
  serviceName,
  amount,
  currency,
  paidAt,
  txRef,
}) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Lasglowtech Invoice ${escapeHtml(invoiceNumber)}</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet" />
    <style>
      *{box-sizing:border-box}
      body{margin:0;padding:32px 20px;background:#0f0a1a;color:#e8e4f0;font-family:'DM Sans',system-ui,sans-serif;line-height:1.45}
      .wrap{max-width:820px;margin:0 auto}
      .sheet{background:#fff;color:#1a1530;border-radius:20px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.45)}
      .head{background:linear-gradient(125deg,#1a0f2e 0%,#2d1b4e 42%,#c45a12 100%);color:#fff;padding:28px 32px}
      .head h1{margin:0;font-size:26px;font-weight:700;letter-spacing:-.02em}
      .head p{margin:10px 0 0;font-size:13px;opacity:.9}
      .badge{display:inline-block;margin-top:14px;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.12);font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
      .body{padding:28px 32px 8px}
      .inv-no{font-family:'IBM Plex Mono',monospace;font-size:13px;color:#6b5a8c;background:#f4f1fb;padding:10px 14px;border-radius:10px;border:1px solid #e6dff5}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:22px}
      .meta{font-size:13px;color:#4a425f}
      .meta strong{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9a8ab8;margin-bottom:4px}
      table{width:100%;border-collapse:collapse;margin-top:22px;border-radius:12px;overflow:hidden;border:1px solid #ece8f4}
      th,td{padding:14px 16px;text-align:left;font-size:14px}
      thead{background:linear-gradient(180deg,#faf8ff,#f3effb)}
      th{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b5a8c;border-bottom:1px solid #ece8f4}
      tbody tr:nth-child(even){background:#fcfbff}
      td{border-bottom:1px solid #f0ecf8;color:#2d2640}
      tbody tr:last-child td{border-bottom:none}
      .total td{font-weight:700;font-size:15px;color:#13224a}
      .accent{color:#c45a12;font-weight:600}
      .foot{padding:20px 32px 28px;font-size:12px;color:#7a7194;border-top:1px solid #ece8f4;background:#faf9fc}
      .foot a{color:#7c3aed;text-decoration:none}
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="sheet">
        <div class="head">
          <h1>Lasglowtech</h1>
          <p>Digital services — payment receipt</p>
          <span class="badge">Paid</span>
        </div>
        <div class="body">
          <div class="inv-no">Invoice ${escapeHtml(invoiceNumber)}</div>
          <div class="grid">
            <div class="meta"><strong>Date</strong>${escapeHtml(formatInvoiceDate(paidAt))}</div>
            <div class="meta"><strong>Client</strong>${escapeHtml(customerName)}</div>
            <div class="meta"><strong>Email</strong>${escapeHtml(customerEmail)}</div>
            <div class="meta"><strong>Payment reference</strong>${escapeHtml(txRef)}</div>
          </div>
          <table>
            <thead>
              <tr><th>Description</th><th style="text-align:right">Amount</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>${escapeHtml(serviceName)}</td>
                <td style="text-align:right" class="accent">${escapeHtml(currency)} ${Number(amount || 0).toLocaleString()}</td>
              </tr>
              <tr class="total">
                <td>Total paid</td>
                <td style="text-align:right">${escapeHtml(currency)} ${Number(amount || 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="foot">
          Thank you for choosing Lasglowtech. Questions? <a href="mailto:lasglowtech@gmail.com">lasglowtech@gmail.com</a>
        </div>
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
  certificateLogoUrl = '',
  certificateBackgroundUrl = '',
  sealUrl = '',
  signatureImageUrl = '',
  qrDataUrl = '',
  verifyUrl = '',
}) => {
  const displayDate = signedDate ? formatCertificateDate(signedDate) : formatCertificateDate(completionDate);
  const bodyText = bodyMessage.trim()
    ? escapeHtml(bodyMessage)
    : 'This professional has demonstrated initiative and a commitment to deepening their skills and advancing their career.';

  const logoHtml = certificateLogoUrl
    ? `<img src="${escapeHtml(certificateLogoUrl)}" alt="Lasglowtech" class="logo-img" crossorigin="anonymous" />`
    : `<div class="logo-mark" aria-hidden="true">L</div>`;

  const sealHtml = sealUrl
    ? `<div class="seal"><img src="${escapeHtml(sealUrl)}" alt="" class="seal-img" crossorigin="anonymous" /></div>`
    : '';

  const signatureBlock = signatureImageUrl
    ? `<div class="signature"><img src="${escapeHtml(signatureImageUrl)}" alt="" class="sig-img" crossorigin="anonymous" /><div class="signature-label">${escapeHtml(signatureLabel)}</div></div>`
    : `<div class="signature"><div class="signature-line"></div><div class="signature-label">${escapeHtml(signatureLabel)}</div></div>`;

  const bgStyle = certificateBackgroundUrl
    ? `background-image:url('${escapeHtml(certificateBackgroundUrl)}');background-size:cover;background-position:center;`
    : '';

  const hasQr = !!(qrDataUrl && verifyUrl);
  const qrFooter = hasQr
    ? `<div class="footer-qr"><img src="${qrDataUrl}" alt="Verify certificate" class="qr-img" width="88" height="88"/><span class="verify-text">Scan to verify</span></div>`
    : '';

  return `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Certificate ${escapeHtml(certificateCode)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box}
body{margin:0;padding:20px;background:linear-gradient(180deg,#120b1f,#1d2348);font-family:Georgia,'Times New Roman',serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{max-width:1123px;margin:0 auto}
.certificate{position:relative;aspect-ratio:1.414/1;background:linear-gradient(180deg,#120b1f,#1d2348);overflow:hidden;border-radius:4px}
.corner{position:absolute;width:16%;height:8.5%;border-style:solid;border-color:#f27b02;z-index:1}
.tl{top:0;left:0;border-width:16px 0 0 16px}
.tr{top:0;right:0;border-width:16px 16px 0 0}
.bl{bottom:0;left:0;border-width:0 0 16px 16px}
.br{bottom:0;right:0;border-width:0 16px 16px 0}
.inner{position:absolute;inset:4.2%;background:#f8f6f2;border-radius:16px;border:1px solid #e8894a;box-shadow:inset 0 0 12px rgba(0,0,0,.06),0 20px 64px rgba(0,0,0,.28);overflow:hidden;${bgStyle}}
.inner::before{content:'';position:absolute;inset:2px;border:1px solid #cfd4df;border-radius:14px;pointer-events:none;z-index:1}
.side{position:absolute;right:0;top:0;bottom:0;width:15.5%;background:linear-gradient(180deg,#120b1f,#1d2348);border-left:6px solid #f27b02;z-index:0}
.content{position:relative;height:100%;display:flex;flex-direction:column;padding:5.2% 17% 6% 5%;z-index:2}
.logo-row{display:flex;align-items:center;gap:12px;margin-bottom:4%}
.logo-img{height:52px;width:auto;max-width:220px;object-fit:contain}
.logo-mark{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#f27b02,#ff9a4d);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:22px;font-weight:700;border:2px solid #13224a}
.brand h1{margin:0;font-family:'Cinzel',serif;font-size:clamp(20px,2.4vw,28px);font-weight:700;color:#13224a;letter-spacing:.04em}
.brand p{margin:2px 0 0;font-family:Georgia,serif;font-size:clamp(11px,1.1vw,14px);color:#5c5f72}
.title-top{font-size:clamp(11px,1.15vw,15px);letter-spacing:.38em;text-transform:uppercase;color:#555;margin-bottom:6px;font-family:Georgia,serif}
.title-main{font-family:'Cinzel',serif;font-size:clamp(36px,6.5vw,72px);font-weight:800;line-height:1;color:#13224a;margin-bottom:3%}
.name{font-family:'Brush Script MT','Segoe Script',cursive;font-size:clamp(32px,5.5vw,64px);line-height:1.05;color:#10214b;padding-bottom:14px}
.name-line{height:0;border-bottom:2px solid #132d4c;max-width:min(100%,78%);margin-top:6px;margin-bottom:20px}
.sub{font-size:clamp(12px,1.25vw,18px);color:#1b1f2f;margin:0 0 10px;font-family:'Poppins',sans-serif;font-weight:400;line-height:1.45}
.course{font-family:'Poppins',sans-serif;font-size:clamp(16px,2.4vw,28px);font-weight:600;color:#13224a;line-height:1.25;max-width:min(100%,76%)}
.body{margin-top:20px;max-width:min(100%,72%);font-size:clamp(11px,1.15vw,15px);line-height:1.68;color:#263252}
.footer{margin-top:auto;display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px 20px;padding:20px 0 12px 4px;border-top:1px solid rgba(19,34,74,.08)}
.footer-qr{flex:0 0 auto;display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding-left:2px}
.footer-meta{flex:1 1 160px;min-width:0;align-self:flex-end;padding-bottom:4px;padding-left:4px}
.date{font-family:'Cinzel',serif;font-size:clamp(13px,1.4vw,18px);font-weight:600;color:#13224a}
.code{font-size:clamp(9px,.85vw,12px);color:#6c7285;margin-top:8px;line-height:1.35;word-break:break-word}
.signature{flex:0 0 auto;text-align:right;padding:0 6px 8px 0;align-self:flex-end;max-width:34%;min-width:6.5rem}
.signature-line{width:120px;border-bottom:1px solid #1a244f;margin:0 0 6px auto}
.signature-label{font-size:clamp(9px,.8vw,11px);color:#596073}
.sig-img{max-height:56px;max-width:180px;object-fit:contain;object-position:bottom;display:block;margin:0 0 4px auto}
.seal{position:absolute;right:3%;bottom:7%;z-index:3}
.seal-img{width:clamp(72px,11vw,140px);height:clamp(72px,11vw,140px);object-fit:contain;background:#fff;padding:8px;border-radius:50%;transform:rotate(-8deg);box-shadow:0 12px 28px rgba(0,0,0,.35)}
.qr-img{display:block;border-radius:6px;background:#fff;padding:4px;box-shadow:0 4px 14px rgba(0,0,0,.12)}
.verify-text{font-size:9px;font-weight:600;color:#596073;letter-spacing:.04em;text-transform:uppercase}
@media print{
  body{padding:0;background:#fff}
  .page{max-width:none}
  .certificate{box-shadow:none;border-radius:0}
  @page{size:A4 landscape;margin:0}
}
</style>
</head>
<body>
<div class="page">
<div class="certificate">
<div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
<div class="inner">
<div class="side"></div>
<div class="content">
<div class="logo-row">
  ${logoHtml}
  <div class="brand"><h1>LASGLOWTECH</h1><p>DIGITAL SERVICES</p></div>
</div>
<div class="title-top">Certificate of</div>
<div class="title-main">COMPLETION</div>
<div class="name">${escapeHtml(learnerName)}</div>
<div class="name-line"></div>
<p class="sub">has successfully completed the online course</p>
<div class="course">${escapeHtml(courseTitle)}</div>
<div class="body">${bodyText}</div>
<div class="footer">
  ${qrFooter}
  <div class="footer-meta">
    <div class="date">${escapeHtml(displayDate)}</div>
    <div class="code">Certificate code: ${escapeHtml(certificateCode)}</div>
  </div>
  ${signatureBlock}
</div>
</div>
${sealHtml}
</div>
</div>
</div>
</body>
</html>
`;
};

/**
 * Same as buildCertificateHtml but embeds a QR linking to /verify-certificate when a public client origin is known
 * (FRONTEND_URL, SITE_URL, or LOCAL_CLIENT_APP / REMOTE_CLIENT_APP from .env).
 */
const buildCertificateHtmlAsync = async (opts) => {
  const QRCode = require('qrcode');
  const base = getPublicClientOrigin();
  let qrDataUrl = '';
  let verifyUrl = '';
  if (base && opts.certificateCode) {
    verifyUrl = `${base}/verify-certificate?code=${encodeURIComponent(String(opts.certificateCode))}`;
    try {
      qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 200,
        color: { dark: '#13224a', light: '#ffffff' },
      });
    } catch (err) {
      console.error('Certificate QR:', err.message);
    }
  }
  return buildCertificateHtml({ ...opts, qrDataUrl, verifyUrl });
};

module.exports = {
  buildInvoiceHtml,
  buildCertificateHtml,
  buildCertificateHtmlAsync,
  formatCertificateDate,
  escapeHtml,
};
