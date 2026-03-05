const axios = require('axios');
const config = require('../config');
const db = require('../db');
const {
  sendOrderInitiatedEmails,
  sendPaymentSuccessEmails,
  sendInvoiceEmail,
} = require('../utils/notifications');
const { buildInvoiceHtml } = require('../utils/documents');
const { getAdminEmail } = require('../utils/admin');

const mapPackage = (row) => ({
  id: row.id,
  slug: row.slug,
  name: row.title,
  amount: Number(row.price),
  currency: row.currency || 'NGN',
  paymentType: row.payment_type || 'full',
});

const getPackages = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, slug, title, price, currency, payment_type
       FROM catalogues
       WHERE is_payment_enabled = 1 AND is_published = 1
       ORDER BY sort_order ASC, id DESC`
    );
    return res.status(200).json(rows.map(mapPackage));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getPackageBySlug = async (req, res) => {
  const { serviceSlug } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT id, slug, title, price, currency, payment_type
       FROM catalogues
       WHERE slug = ? AND is_payment_enabled = 1 AND is_published = 1
       LIMIT 1`,
      [serviceSlug]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Service package not found.' });
    }

    return res.status(200).json(mapPackage(rows[0]));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const initializePayment = async (req, res) => {
  const userId = req.user?.id || null;
  const { serviceSlug, email, customerName, callbackUrl } = req.body;

  if (!serviceSlug || !email || !customerName || !callbackUrl) {
    return res.status(400).json({
      error: 'serviceSlug, email, customerName and callbackUrl are required.',
    });
  }

  if (!config.flutterwave_secret_key) {
    return res.status(500).json({ error: 'Payment is not configured on server.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, slug, title, price, currency, payment_type
       FROM catalogues
       WHERE slug = ? AND is_payment_enabled = 1 AND is_published = 1
       LIMIT 1`,
      [serviceSlug]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Service package not found.' });
    }

    const pkg = mapPackage(rows[0]);
    const txRef = `LASGLOW-${pkg.slug}-${Date.now()}`;

    const [orderResult] = await db.query(
      `INSERT INTO service_orders
      (user_id, catalogue_id, service_slug, service_name, customer_name, email, amount, currency, payment_type, status, tx_ref)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        pkg.id,
        pkg.slug,
        pkg.name,
        customerName,
        email,
        pkg.amount,
        pkg.currency,
        pkg.paymentType,
        'initiated',
        txRef,
      ]
    );
    const orderId = orderResult.insertId;

    const payload = {
      tx_ref: txRef,
      amount: pkg.amount,
      currency: pkg.currency,
      redirect_url: callbackUrl,
      customer: {
        email,
        name: customerName,
      },
      customizations: {
        title: 'Lasglowtech Services Payment',
        description: `${pkg.name} (${pkg.paymentType})`,
      },
      meta: {
        orderId,
        userId,
        serviceSlug: pkg.slug,
        serviceName: pkg.name,
        paymentType: pkg.paymentType,
      },
    };

    const response = await axios.post('https://api.flutterwave.com/v3/payments', payload, {
      headers: {
        Authorization: `Bearer ${config.flutterwave_secret_key}`,
        'Content-Type': 'application/json',
      },
    });

    const paymentLink = response.data?.data?.link || '';
    await db.query('UPDATE service_orders SET payment_link = ?, status = ? WHERE id = ?', [
      paymentLink,
      'pending',
      orderId,
    ]);

    try {
      const adminEmail = await getAdminEmail();
      await sendOrderInitiatedEmails({
        adminEmail,
        customerEmail: email,
        order: {
          serviceName: pkg.name,
          customerName,
          email,
          amount: pkg.amount,
          currency: pkg.currency,
          txRef,
          paymentLink,
        },
      });
    } catch (mailError) {
      console.error('Order initiated email error:', mailError.message);
    }

    return res.status(200).json({
      message: 'Payment initialized successfully.',
      data: response.data.data,
      package: pkg,
      txRef,
      orderId,
    });
  } catch (error) {
    console.error('Flutterwave initialize error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Unable to initialize payment right now.' });
  }
};

const persistVerification = async (verificationData) => {
  const txRef = verificationData?.tx_ref;
  if (!txRef) return;

  const gatewayStatus = verificationData?.status || 'unknown';
  const isPaid = gatewayStatus === 'successful';
  const amount = Number(verificationData?.amount || 0);
  const currency = verificationData?.currency || 'NGN';
  const orderId = verificationData?.meta?.orderId || null;
  const flutterwaveTxId = verificationData?.id ? String(verificationData.id) : null;
  const flutterwaveRef = verificationData?.flw_ref || null;

  const [[existingOrder]] = await db.query(
    `SELECT id, service_name, customer_name, email, amount, currency, status, paid_at, tx_ref, invoice_number, invoice_sent_at
     FROM service_orders
     WHERE tx_ref = ?
     LIMIT 1`,
    [txRef]
  );

  const wasPaid = existingOrder?.status === 'paid';

  await db.query(
    `INSERT INTO payment_transactions
    (order_id, tx_ref, flutterwave_tx_id, flutterwave_ref, gateway_status, amount, currency, payload_json, verified_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      order_id = VALUES(order_id),
      flutterwave_tx_id = VALUES(flutterwave_tx_id),
      flutterwave_ref = VALUES(flutterwave_ref),
      gateway_status = VALUES(gateway_status),
      amount = VALUES(amount),
      currency = VALUES(currency),
      payload_json = VALUES(payload_json),
      verified_at = NOW()`,
    [
      orderId,
      txRef,
      flutterwaveTxId,
      flutterwaveRef,
      gatewayStatus,
      amount,
      currency,
      JSON.stringify(verificationData || {}),
    ]
  );

  await db.query(
    `UPDATE service_orders
     SET status = ?, flutterwave_tx_id = ?, flutterwave_ref = ?, paid_at = ?
     WHERE tx_ref = ?`,
    [isPaid ? 'paid' : 'failed', flutterwaveTxId, flutterwaveRef, isPaid ? new Date() : null, txRef]
  );

  if (isPaid && !wasPaid && existingOrder) {
    const invoiceNumber =
      existingOrder.invoice_number || `LGT-INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${existingOrder.id}`;
    const invoiceHtml = buildInvoiceHtml({
      invoiceNumber,
      customerName: existingOrder.customer_name,
      customerEmail: existingOrder.email,
      serviceName: existingOrder.service_name,
      amount: existingOrder.amount,
      currency: existingOrder.currency,
      paidAt: new Date(),
      txRef,
    });

    try {
      const adminEmail = await getAdminEmail();
      const emailResult = await sendPaymentSuccessEmails({
        adminEmail,
        customerEmail: existingOrder.email,
        order: {
          serviceName: existingOrder.service_name,
          customerName: existingOrder.customer_name,
          amount: existingOrder.amount,
          currency: existingOrder.currency,
          txRef,
        },
      });
      const customerEmailStatus = emailResult?.customer?.status || 'pending';
      const customerEmailError = emailResult?.customer?.error || '';
      await db.query(
        `UPDATE service_orders
         SET email_notification_status = ?, email_notification_error = ?
         WHERE id = ?`,
        [customerEmailStatus, customerEmailError, existingOrder.id]
      );
    } catch (mailError) {
      console.error('Payment success email error:', mailError.message);
      await db.query(
        `UPDATE service_orders
         SET email_notification_status = ?, email_notification_error = ?
         WHERE id = ?`,
        ['failed', String(mailError?.message || mailError), existingOrder.id]
      );
    }

    try {
      const invoiceEmail = await sendInvoiceEmail({
        to: existingOrder.email,
        customerName: existingOrder.customer_name,
        invoiceNumber,
        invoiceHtml,
        serviceName: existingOrder.service_name,
      });
      await db.query(
        `UPDATE service_orders
         SET invoice_number = ?, invoice_sent_at = ?, invoice_email_status = ?, invoice_email_error = ?
         WHERE id = ?`,
        [
          invoiceNumber,
          invoiceEmail?.status === 'sent' ? new Date() : null,
          invoiceEmail?.status || 'pending',
          invoiceEmail?.error || '',
          existingOrder.id,
        ]
      );
    } catch (invoiceError) {
      console.error('Invoice email error:', invoiceError.message);
      await db.query(
        `UPDATE service_orders
         SET invoice_number = ?, invoice_email_status = ?, invoice_email_error = ?
         WHERE id = ?`,
        [
          invoiceNumber,
          'failed',
          String(invoiceError?.message || invoiceError),
          existingOrder.id,
        ]
      );
    }
  }
};

const verifyPayment = async (req, res) => {
  const { reference: txRef } = req.params;
  const transactionId = req.query?.transaction_id;
  if (!txRef) {
    return res.status(400).json({ error: 'txRef is required.' });
  }

  if (!config.flutterwave_secret_key) {
    return res.status(500).json({ error: 'Payment is not configured on server.' });
  }

  try {
    let response = null;

    if (transactionId) {
      try {
        response = await axios.get(
          `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`,
          {
            headers: {
              Authorization: `Bearer ${config.flutterwave_secret_key}`,
            },
          }
        );
      } catch (transactionVerifyError) {
        console.error('Flutterwave verify by transaction id failed, falling back to tx_ref:', transactionVerifyError.response?.data || transactionVerifyError.message);
      }
    }

    if (!response) {
      response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
        {
          headers: {
            Authorization: `Bearer ${config.flutterwave_secret_key}`,
          },
        }
      );
    }

    const data = response.data?.data || null;
    if (data) {
      await persistVerification(data);
    }

    return res.status(200).json({
      message: 'Payment verification completed.',
      data,
      needsManualReview: false,
    });
  } catch (error) {
    console.error('Flutterwave verify error:', error.response?.data || error.message);
    return res.status(200).json({
      message: 'Verification is temporarily unavailable. Please retry shortly.',
      data: null,
      needsManualReview: true,
      error: 'Unable to verify payment right now.',
    });
  }
};

const reverifyAdminOrder = async (req, res) => {
  const { orderId } = req.params;
  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required.' });
  }
  if (!config.flutterwave_secret_key) {
    return res.status(500).json({ error: 'Payment is not configured on server.' });
  }

  try {
    const [[order]] = await db.query(
      `SELECT id, tx_ref, status
       FROM service_orders
       WHERE id = ?
       LIMIT 1`,
      [orderId]
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    if (!order.tx_ref) {
      return res.status(400).json({ error: 'Order has no transaction reference.' });
    }

    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(order.tx_ref)}`,
      {
        headers: {
          Authorization: `Bearer ${config.flutterwave_secret_key}`,
        },
      }
    );

    const data = response.data?.data || null;
    if (data) {
      await persistVerification(data);
    }

    const [[updated]] = await db.query(
      `SELECT id, status, tx_ref, flutterwave_tx_id, flutterwave_ref, paid_at
       FROM service_orders
       WHERE id = ?
       LIMIT 1`,
      [orderId]
    );

    return res.status(200).json({
      message: 'Order reverification completed.',
      order: updated || null,
      verification: data,
    });
  } catch (error) {
    console.error('Admin reverify error:', error.response?.data || error.message);
    return res.status(200).json({
      message: 'Reverification currently unavailable. Try again shortly.',
      order: null,
      verification: null,
      needsManualReview: true,
      error: 'Unable to reverify order right now.',
    });
  }
};

const webhook = async (req, res) => {
  try {
    if (!config.flutterwave_secret_key || !config.flutterwave_webhook_hash) {
      return res.status(500).json({ error: 'Payment is not configured on server.' });
    }

    const signature = req.headers['verif-hash'];
    if (signature !== config.flutterwave_webhook_hash) {
      return res.status(401).json({ error: 'Invalid webhook signature.' });
    }

    const event = req.body;
    if (event.event === 'charge.completed' && event.data?.tx_ref) {
      await persistVerification(event.data);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(500).json({ error: 'Webhook processing failed.' });
  }
};

const getAdminRevenueStats = async (req, res) => {
  try {
    const [[totals]] = await db.query(
      `SELECT
        COUNT(*) AS total_orders,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS total_revenue,
        SUM(CASE WHEN status IN ('initiated','pending') THEN 1 ELSE 0 END) AS pending_orders,
        SUM(CASE WHEN status = 'paid' AND MONTH(paid_at) = MONTH(CURDATE()) AND YEAR(paid_at) = YEAR(CURDATE()) THEN amount ELSE 0 END) AS revenue_this_month
       FROM service_orders`
    );

    const [latestPayments] = await db.query(
      `SELECT id, service_name, customer_name, email, amount, currency, status, tx_ref, paid_at, created_at
       FROM service_orders
       ORDER BY id DESC
       LIMIT 10`
    );

    return res.status(200).json({
      stats: {
        totalOrders: Number(totals?.total_orders || 0),
        totalRevenue: Number(totals?.total_revenue || 0),
        pendingOrders: Number(totals?.pending_orders || 0),
        revenueThisMonth: Number(totals?.revenue_this_month || 0),
      },
      latestPayments,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAdminPayments = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, user_id, service_name, customer_name, email, amount, currency, payment_type, status, tx_ref,
              flutterwave_tx_id, flutterwave_ref, paid_at, created_at, email_notification_status, email_notification_error,
              invoice_number, invoice_sent_at, invoice_email_status, invoice_email_error
       FROM service_orders
       ORDER BY id DESC
       LIMIT 200`
    );
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMyOrders = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, service_name, amount, currency, payment_type, status, tx_ref, paid_at, created_at, invoice_number, invoice_sent_at
       FROM service_orders
       WHERE user_id = ?
       ORDER BY id DESC`,
      [userId]
    );
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMyOrderInvoice = async (req, res) => {
  const userId = req.user?.id;
  const { orderId } = req.params;
  if (!userId || !orderId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [[order]] = await db.query(
      `SELECT id, customer_name, email, service_name, amount, currency, tx_ref, paid_at, status, invoice_number
       FROM service_orders
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [orderId, userId]
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    if (order.status !== 'paid') {
      return res.status(400).json({ error: 'Invoice is available only for paid orders.' });
    }

    const invoiceNumber =
      order.invoice_number || `LGT-INV-${new Date(order.paid_at || new Date()).toISOString().slice(0, 10).replace(/-/g, '')}-${order.id}`;
    const html = buildInvoiceHtml({
      invoiceNumber,
      customerName: order.customer_name,
      customerEmail: order.email,
      serviceName: order.service_name,
      amount: order.amount,
      currency: order.currency,
      paidAt: order.paid_at || new Date(),
      txRef: order.tx_ref,
    });

    if (!order.invoice_number) {
      await db.query('UPDATE service_orders SET invoice_number = ? WHERE id = ?', [invoiceNumber, order.id]);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${invoiceNumber}.html"`);
    return res.status(200).send(html);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPackages,
  getPackageBySlug,
  initializePayment,
  verifyPayment,
  webhook,
  getAdminRevenueStats,
  getAdminPayments,
  getMyOrders,
  getMyOrderInvoice,
  reverifyAdminOrder,
};
