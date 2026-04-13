const nodemailer = require('nodemailer');
const config = require('../config');

const emailPort = Number(config.email_port || 465);
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: emailPort,
  secure: emailPort === 465,
  auth: {
    user: config.email_user,
    pass: config.email_pass,
  },
});

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const appBanner = (title, subtitle) => `
  <div style="background:linear-gradient(135deg,#31185e 0%,#1a0e3f 70%,#ed6e00 100%);padding:28px 24px;color:#fff;">
    <div style="font-size:24px;font-weight:700;letter-spacing:.3px;">Lasglowtech</div>
    <div style="font-size:16px;margin-top:8px;font-weight:600;">${escapeHtml(title)}</div>
    <div style="font-size:13px;opacity:.9;margin-top:4px;">${escapeHtml(subtitle || '')}</div>
  </div>
`;

const renderEmailShell = ({ title, subtitle, contentHtml, layout = 'default' }) => {
  const maxInner = layout === 'certificate' ? '700px' : '640px';
  const padX = layout === 'certificate' ? '28px' : '24px';
  return `
  <div style="margin:0;padding:20px 12px;background:#eef2f6;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#111827;line-height:1.55;-webkit-text-size-adjust:100%;">
    <div style="max-width:${maxInner};width:100%;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;box-sizing:border-box;">
      ${appBanner(title, subtitle)}
      <div style="padding:22px ${padX} 26px;word-wrap:break-word;overflow-wrap:anywhere;">
        ${contentHtml}
      </div>
      <div style="padding:14px ${padX} 18px;border-top:1px solid #e5e7eb;color:#64748b;font-size:12px;line-height:1.45;">
        This is an automated message from Lasglowtech. Please do not reply directly to this email; use our website contact form instead.
      </div>
    </div>
  </div>
`;
};

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  if (!to || !config.email_user || !config.email_pass) {
    return;
  }

  await transporter.sendMail({
    from: `Lasglowtech <${config.email_user}>`,
    to,
    subject,
    html,
    attachments,
  });
};

const sendPasswordResetEmail = async ({ to, username, resetUrl }) => {
  const html = renderEmailShell({
    title: 'Password Reset Request',
    subtitle: 'Secure access to your Lasglowtech account',
    contentHtml: `
      <p style="margin:0 0 12px;font-size:14px;">Hello ${escapeHtml(username || 'there')},</p>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
        We received a request to reset your account password. Click the button below to continue.
      </p>
      <p style="margin:0 0 16px;">
        <a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#ed6e00;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:14px;font-weight:600;">
          Reset Password
        </a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;color:#4b5563;">If you did not request this, you can ignore this email.</p>
      <p style="margin:0;font-size:12px;color:#6b7280;">This link expires in 1 hour.</p>
    `,
  });

  await sendEmail({
    to,
    subject: 'Lasglowtech Password Reset',
    html,
  });
};

const sendCareerApplicationEmails = async ({ adminEmail, applicantEmail, data }) => {
  const safe = {
    fullName: escapeHtml(data.fullName),
    email: escapeHtml(data.email),
    phone: escapeHtml(data.phone),
    skillInterest: escapeHtml(data.skillInterest),
    experienceLevel: escapeHtml(data.experienceLevel || 'Not specified'),
    availability: escapeHtml(data.availability || 'Not specified'),
  };

  const adminHtml = renderEmailShell({
    title: 'New Career Application',
    subtitle: 'A new learner application was submitted',
    contentHtml: `
      <p style="margin:0 0 10px;font-size:14px;">A new application has been received:</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr><td style="padding:6px 0;color:#6b7280;">Full Name</td><td style="padding:6px 0;">${safe.fullName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;">${safe.email}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;">${safe.phone}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Skill Interest</td><td style="padding:6px 0;">${safe.skillInterest}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Experience</td><td style="padding:6px 0;">${safe.experienceLevel}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Availability</td><td style="padding:6px 0;">${safe.availability}</td></tr>
      </table>
    `,
  });

  const applicantHtml = renderEmailShell({
    title: 'Application Received',
    subtitle: 'Your career learning registration is in review',
    contentHtml: `
      <p style="margin:0 0 12px;font-size:14px;">Hello ${safe.fullName},</p>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.6;">
        We have received your application for <strong>${safe.skillInterest}</strong>. Our team will review your details and reach out with next steps.
      </p>
      <p style="margin:0;font-size:13px;color:#4b5563;">Thank you for choosing Lasglowtech.</p>
    `,
  });

  await Promise.allSettled([
    adminEmail ? sendEmail({ to: adminEmail, subject: 'New Career Application - Lasglowtech', html: adminHtml }) : Promise.resolve(),
    applicantEmail
      ? sendEmail({ to: applicantEmail, subject: 'Application Received - Lasglowtech', html: applicantHtml })
      : Promise.resolve(),
  ]);
};

const sendOrderInitiatedEmails = async ({ adminEmail, customerEmail, order }) => {
  const safe = {
    serviceName: escapeHtml(order.serviceName),
    customerName: escapeHtml(order.customerName),
    email: escapeHtml(order.email),
    amount: escapeHtml(order.amount),
    currency: escapeHtml(order.currency || 'NGN'),
    txRef: escapeHtml(order.txRef),
    paymentLink: escapeHtml(order.paymentLink || ''),
  };

  const adminHtml = renderEmailShell({
    title: 'New Service Order',
    subtitle: 'A client has initiated payment',
    contentHtml: `
      <p style="margin:0 0 10px;font-size:14px;">Order details:</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr><td style="padding:6px 0;color:#6b7280;">Service</td><td style="padding:6px 0;">${safe.serviceName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Client</td><td style="padding:6px 0;">${safe.customerName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;">${safe.email}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Amount</td><td style="padding:6px 0;">${safe.currency} ${safe.amount}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Reference</td><td style="padding:6px 0;">${safe.txRef}</td></tr>
      </table>
    `,
  });

  const customerHtml = renderEmailShell({
    title: 'Order Received',
    subtitle: 'Continue your payment securely',
    contentHtml: `
      <p style="margin:0 0 12px;font-size:14px;">Hello ${safe.customerName},</p>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.6;">
        Your order for <strong>${safe.serviceName}</strong> has been created.
      </p>
      <p style="margin:0 0 12px;font-size:14px;">
        Amount: <strong>${safe.currency} ${safe.amount}</strong>
      </p>
      ${
        safe.paymentLink
          ? `<p style="margin:0 0 12px;"><a href="${safe.paymentLink}" style="display:inline-block;background:#ed6e00;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:14px;font-weight:600;">Complete Payment</a></p>`
          : ''
      }
      <p style="margin:0;font-size:12px;color:#6b7280;">Reference: ${safe.txRef}</p>
    `,
  });

  await Promise.allSettled([
    adminEmail ? sendEmail({ to: adminEmail, subject: 'New Order Initiated - Lasglowtech', html: adminHtml }) : Promise.resolve(),
    customerEmail
      ? sendEmail({ to: customerEmail, subject: 'Order Received - Lasglowtech', html: customerHtml })
      : Promise.resolve(),
  ]);
};

const sendPaymentSuccessEmails = async ({ adminEmail, customerEmail, order }) => {
  const safe = {
    serviceName: escapeHtml(order.serviceName),
    customerName: escapeHtml(order.customerName),
    amount: escapeHtml(order.amount),
    currency: escapeHtml(order.currency || 'NGN'),
    txRef: escapeHtml(order.txRef),
  };

  const adminHtml = renderEmailShell({
    title: 'Payment Confirmed',
    subtitle: 'An order payment has been completed',
    contentHtml: `
      <p style="margin:0 0 10px;font-size:14px;">Payment received for <strong>${safe.serviceName}</strong>.</p>
      <p style="margin:0;font-size:13px;">Client: ${safe.customerName} | Amount: ${safe.currency} ${safe.amount} | Ref: ${safe.txRef}</p>
    `,
  });

  const customerHtml = renderEmailShell({
    title: 'Payment Successful',
    subtitle: 'Your order is now in processing',
    contentHtml: `
      <p style="margin:0 0 12px;font-size:14px;">Hello ${safe.customerName},</p>
      <p style="margin:0 0 10px;font-size:14px;line-height:1.6;">
        We have confirmed your payment for <strong>${safe.serviceName}</strong>.
      </p>
      <p style="margin:0;font-size:13px;">Amount: ${safe.currency} ${safe.amount} | Reference: ${safe.txRef}</p>
    `,
  });

  const canSend = Boolean(config.email_user && config.email_pass);
  const jobs = [
    {
      key: 'admin',
      email: adminEmail,
      task: () => sendEmail({ to: adminEmail, subject: 'Payment Confirmed - Lasglowtech', html: adminHtml }),
    },
    {
      key: 'customer',
      email: customerEmail,
      task: () => sendEmail({ to: customerEmail, subject: 'Payment Successful - Lasglowtech', html: customerHtml }),
    },
  ];

  const outcome = { admin: { status: 'skipped', error: '' }, customer: { status: 'skipped', error: '' } };
  for (const job of jobs) {
    if (!job.email) {
      outcome[job.key] = { status: 'skipped', error: 'No recipient email provided.' };
      continue;
    }
    if (!canSend) {
      outcome[job.key] = { status: 'failed', error: 'Email service not configured.' };
      continue;
    }
    try {
      await job.task();
      outcome[job.key] = { status: 'sent', error: '' };
    } catch (error) {
      outcome[job.key] = { status: 'failed', error: String(error?.message || error) };
    }
  }

  return outcome;
};

const sendBulkEmail = async ({ recipients, subject, messageHtml, attachments = [] }) => {
  const uniqueRecipients = [...new Set((recipients || []).map((item) => String(item || '').trim().toLowerCase()).filter(Boolean))];
  const settled = await Promise.allSettled(
    uniqueRecipients.map((email) =>
      sendEmail({
        to: email,
        subject,
        html: renderEmailShell({
          title: subject || 'Lasglowtech Update',
          subtitle: 'Official communication from Lasglowtech',
          contentHtml: messageHtml || '<p>No content supplied.</p>',
        }),
        attachments,
      })
    )
  );

  return uniqueRecipients.map((email, index) => ({
    email,
    status: settled[index]?.status === 'fulfilled' ? 'sent' : 'failed',
    errorMessage: settled[index]?.status === 'rejected' ? String(settled[index].reason?.message || settled[index].reason || '') : '',
  }));
};

const sendInvoiceEmail = async ({ to, customerName, invoiceNumber, invoiceHtml, serviceName }) => {
  if (!to) {
    return { status: 'skipped', error: 'No recipient email provided.' };
  }
  if (!config.email_user || !config.email_pass) {
    return { status: 'failed', error: 'Email service not configured.' };
  }

  try {
    await sendEmail({
      to,
      subject: `Invoice ${invoiceNumber} - Lasglowtech`,
      html: renderEmailShell({
        title: 'Invoice Generated',
        subtitle: 'Your catalogue service payment receipt',
        contentHtml: `
          <p style="margin:0 0 12px;font-size:14px;">Hello ${escapeHtml(customerName || 'Client')},</p>
          <p style="margin:0;font-size:14px;line-height:1.6;">
            Your payment for <strong>${escapeHtml(serviceName || 'Service')}</strong> has been confirmed.
            Your invoice is attached to this email.
          </p>
        `,
      }),
      attachments: [
        {
          filename: `${invoiceNumber}.html`,
          content: invoiceHtml,
          contentType: 'text/html; charset=utf-8',
        },
      ],
    });
    return { status: 'sent', error: '' };
  } catch (error) {
    return { status: 'failed', error: String(error?.message || error) };
  }
};

const safePdfFilename = (code) => {
  const base = String(code || 'certificate').replace(/[^\w.-]+/g, '_').replace(/_+/g, '_').slice(0, 80);
  return `${base || 'certificate'}.pdf`;
};

const sendCourseCertificateEmail = async ({ to, learnerName, courseTitle, certificateCode, certificateHtml }) => {
  if (!to || !config.email_user || !config.email_pass) {
    return { status: 'skipped', error: 'Email not configured.' };
  }

  let pdfBuffer = null;
  let pdfError = '';
  try {
    const { certificateHtmlToPdfBuffer } = require('./certificatePdf');
    pdfBuffer = await certificateHtmlToPdfBuffer(certificateHtml);
  } catch (err) {
    pdfError = String(err?.message || err);
    console.error('Certificate PDF:', pdfError);
  }

  const attachments = [];
  if (pdfBuffer && pdfBuffer.length) {
    attachments.push({
      filename: safePdfFilename(certificateCode),
      content: pdfBuffer,
      contentType: 'application/pdf',
    });
  } else {
    attachments.push({
      filename: `${safePdfFilename(certificateCode).replace(/\.pdf$/i, '')}.html`,
      content: certificateHtml,
      contentType: 'text/html; charset=utf-8',
    });
  }

  const attachmentNote = pdfBuffer?.length
    ? '<p style="margin:16px 0 0;font-size:14px;line-height:1.55;color:#475569;">Your official certificate is attached as a <strong>PDF</strong> (A4 landscape). Open it in any PDF viewer or print it. If the certificate includes a QR code, scan it to verify authenticity on our website.</p>'
    : `<p style="margin:16px 0 0;font-size:14px;line-height:1.55;color:#b45309;">We could not build the PDF automatically (${escapeHtml(
        pdfError.slice(0, 220)
      )}). Your certificate is attached as an <strong>HTML</strong> file: open it in Chrome or Edge, then use <strong>Print → Save as PDF</strong>.</p>`;

  try {
    await sendEmail({
      to,
      subject: `Your Lasglowtech certificate — ${courseTitle}`,
      html: renderEmailShell({
        title: 'Course completion certificate',
        subtitle: 'Lasglowtech Digital Learning',
        layout: 'certificate',
        contentHtml: `
        <p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#1e293b;">Hello ${escapeHtml(learnerName || 'Learner')},</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#334155;">
          Congratulations on completing <strong style="color:#0f172a;">${escapeHtml(courseTitle)}</strong>.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
          <tr>
            <td style="padding:12px 14px;font-size:13px;color:#64748b;vertical-align:top;width:34%;">Certificate ID</td>
            <td style="padding:12px 14px;font-size:14px;color:#0f172a;vertical-align:top;word-break:break-word;font-family:Consolas,Monaco,monospace;"><strong>${escapeHtml(
              certificateCode
            )}</strong></td>
          </tr>
        </table>
        ${attachmentNote}
      `,
      }),
      attachments,
    });
    return { status: 'sent', error: '', pdfAttached: Boolean(pdfBuffer && pdfBuffer.length) };
  } catch (error) {
    console.error('sendCourseCertificateEmail:', error);
    return { status: 'failed', error: String(error?.message || error), pdfAttached: false };
  }
};

module.exports = {
  renderEmailShell,
  sendEmail,
  sendPasswordResetEmail,
  sendCareerApplicationEmails,
  sendOrderInitiatedEmails,
  sendPaymentSuccessEmails,
  sendBulkEmail,
  sendInvoiceEmail,
  sendCourseCertificateEmail,
};
