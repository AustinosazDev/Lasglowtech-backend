const axios = require('axios');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const db = require('../db');
const {
  sendOrderInitiatedEmails,
  sendPaymentSuccessEmails,
  sendInvoiceEmail,
  sendDigitalDeliveryEmail,
  sendDigitalFileDeliveryEmail,
} = require('../utils/notifications');
const { buildInvoiceHtml } = require('../utils/documents');
const { getAdminEmail } = require('../utils/admin');
const {
  generateDownloadToken,
  getDownloadPageUrl,
  getApiDownloadUrl,
  isDigitalDelivery,
  getStoredFilePath,
  mapDeliveryMeta,
} = require('../utils/delivery');

const { getPublicClientOrigin } = require('../utils/publicClientOrigin');

const FLUTTERWAVE_PAYMENTS_URL = 'https://api.flutterwave.com/v3/payments';
const MIN_PAYMENT_AMOUNT_NGN = 100;

const mapPackage = (row) => ({
  id: row.id,
  slug: row.slug,
  name: row.title,
  amount: Number(row.price),
  currency: row.currency || 'NGN',
  paymentType: row.payment_type || 'full',
  assetFormat: row.asset_format || '',
  licenseNote: row.license_note || '',
  licenseTier: row.license_tier || '',
  linkedCourseSlug: row.linked_course_slug || '',
  ...mapDeliveryMeta(row),
});

const buildPaymentMeta = ({ orderId, userId, serviceSlug, serviceName, paymentType }) => {
  const meta = {
    orderId: String(orderId),
    serviceSlug: String(serviceSlug || ''),
    serviceName: String(serviceName || ''),
    paymentType: String(paymentType || 'full'),
  };
  if (userId) meta.userId = String(userId);
  return meta;
};

const resolvePaymentRedirectUrl = (callbackUrl = '') => {
  const configuredOrigin = getPublicClientOrigin();
  if (configuredOrigin) {
    return `${configuredOrigin}/payment/success`;
  }
  const trimmed = String(callbackUrl || '').trim();
  return trimmed || '';
};

const isValidFlutterwaveHostedLink = (link = '') =>
  typeof link === 'string' &&
  /^https:\/\/checkout\.flutterwave\.com\/v3\/hosted\/pay\/.+/i.test(link.trim());

const extractFlutterwaveError = (error) => {
  const data = error?.response?.data;
  if (!data) return error?.message || 'Payment provider error';
  if (typeof data.message === 'string') return data.message;
  return JSON.stringify(data);
};

const initializePayment = async (req, res) => {
  const userId = req.user?.id || null;
  const { serviceSlug, email, customerName, callbackUrl } = req.body;

  if (!serviceSlug || !email || !customerName) {
    return res.status(400).json({
      error: 'serviceSlug, email, and customerName are required.',
    });
  }

  const redirectUrl = resolvePaymentRedirectUrl(callbackUrl);
  if (!redirectUrl) {
    return res.status(500).json({
      error: 'Payment redirect URL is not configured. Set LOCAL_CLIENT_APP or REMOTE_CLIENT_APP in server .env.',
    });
  }

  if (!config.flutterwave_secret_key) {
    return res.status(500).json({ error: 'Payment is not configured on server.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedName = String(customerName).trim();

  try {
    const [rows] = await db.query(
      `SELECT *
       FROM catalogues
       WHERE slug = ? AND is_payment_enabled = 1 AND is_published = 1
       LIMIT 1`,
      [serviceSlug]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Service package not found.' });
    }

    const pkg = mapPackage(rows[0]);
    const amount = Number(pkg.amount);

    if (!Number.isFinite(amount) || amount < MIN_PAYMENT_AMOUNT_NGN) {
      return res.status(400).json({
        error: `Invalid product price. Minimum charge is ${MIN_PAYMENT_AMOUNT_NGN} ${pkg.currency || 'NGN'}.`,
      });
    }

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
        normalizedName,
        normalizedEmail,
        amount,
        pkg.currency,
        pkg.paymentType,
        'initiated',
        txRef,
      ]
    );
    const orderId = orderResult.insertId;

    const payload = {
      tx_ref: txRef,
      amount,
      currency: pkg.currency || 'NGN',
      redirect_url: redirectUrl,
      payment_options: 'card,ussd,banktransfer',
      customer: {
        email: normalizedEmail,
        name: normalizedName,
      },
      customizations: {
        title: 'Lasglowtech',
        description: `${pkg.name} (${pkg.paymentType})`,
      },
      meta: buildPaymentMeta({
        orderId,
        userId,
        serviceSlug: pkg.slug,
        serviceName: pkg.name,
        paymentType: pkg.paymentType,
      }),
    };

    const response = await axios.post(FLUTTERWAVE_PAYMENTS_URL, payload, {
      headers: {
        Authorization: `Bearer ${config.flutterwave_secret_key}`,
        'Content-Type': 'application/json',
      },
    });

    const flutterwaveBody = response.data || {};
    const paymentLink = flutterwaveBody?.data?.link || '';

    if (flutterwaveBody.status !== 'success' || !isValidFlutterwaveHostedLink(paymentLink)) {
      console.error('Flutterwave invalid hosted link:', flutterwaveBody);
      await db.query('UPDATE service_orders SET status = ? WHERE id = ?', ['failed', orderId]);
      return res.status(502).json({
        error:
          flutterwaveBody?.message ||
          'Flutterwave did not return a valid checkout link. Check your Flutterwave keys and redirect URL settings.',
      });
    }

    await db.query('UPDATE service_orders SET payment_link = ?, status = ? WHERE id = ?', [
      paymentLink,
      'pending',
      orderId,
    ]);

    try {
      const adminEmail = await getAdminEmail();
      await sendOrderInitiatedEmails({
        adminEmail,
        customerEmail: normalizedEmail,
        order: {
          serviceName: pkg.name,
          customerName: normalizedName,
          email: normalizedEmail,
          amount,
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
      data: { link: paymentLink },
      package: pkg,
      txRef,
      orderId,
      redirectUrl,
    });
  } catch (error) {
    console.error('Flutterwave initialize error:', error.response?.data || error.message);
    return res.status(500).json({
      error: extractFlutterwaveError(error) || 'Unable to initialize payment right now.',
    });
  }
};

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
      `SELECT *
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

const buildDeliveryPayload = (order, catalogue) => {
  if (!order || order.status !== 'paid' || !catalogue) return null;

  const delivery = mapDeliveryMeta(catalogue);
  if (!delivery.isDigitalProduct) {
    return { deliveryType: 'service', isDigitalProduct: false };
  }

  const token = order.download_token;
  const base = {
    deliveryType: delivery.deliveryType,
    isDigitalProduct: true,
    serviceName: order.service_name,
    orderId: order.id,
    downloadToken: token,
    deliverableFileName: catalogue.deliverable_file_name || '',
  };

  if (delivery.deliveryType === 'digital_file' && catalogue.deliverable_file_url) {
    return {
      ...base,
      downloadUrl: token ? getApiDownloadUrl(token) : '',
      accessUrl: token ? getDownloadPageUrl(token) : '',
    };
  }

  if (delivery.deliveryType === 'digital_link' && catalogue.deliverable_external_url) {
    return {
      ...base,
      externalUrl: catalogue.deliverable_external_url,
      accessUrl: catalogue.deliverable_external_url,
    };
  }

  return { ...base, pendingSetup: true };
};

const fulfillDigitalOrder = async (orderId) => {
  const [[order]] = await db.query(
    `SELECT id, user_id, catalogue_id, service_name, customer_name, email, status, download_token
     FROM service_orders
     WHERE id = ?
     LIMIT 1`,
    [orderId]
  );
  if (!order || order.status !== 'paid') return null;

  let catalogue = null;
  if (order.catalogue_id) {
    const [[row]] = await db.query('SELECT * FROM catalogues WHERE id = ? LIMIT 1', [order.catalogue_id]);
    catalogue = row || null;
  }

  if (!catalogue || !isDigitalDelivery(catalogue.delivery_type)) {
    return null;
  }

  let downloadToken = order.download_token;
  const wasAlreadyFulfilled = Boolean(downloadToken);
  if (!downloadToken) {
    downloadToken = generateDownloadToken();
    await db.query(
      'UPDATE service_orders SET download_token = ?, delivered_at = NOW() WHERE id = ?',
      [downloadToken, order.id]
    );
  }

  const delivery = mapDeliveryMeta(catalogue);
  const isGuestOrder = !order.user_id;

  if (!wasAlreadyFulfilled && delivery.deliveryType === 'digital_link' && catalogue.deliverable_external_url) {
    await sendDigitalDeliveryEmail({
      customerEmail: order.email,
      customerName: order.customer_name,
      serviceName: order.service_name,
      externalUrl: catalogue.deliverable_external_url,
    });
  }

  if (
    !wasAlreadyFulfilled &&
    isGuestOrder &&
    delivery.deliveryType === 'digital_file' &&
    catalogue.deliverable_file_url
  ) {
    await sendDigitalFileDeliveryEmail({
      customerEmail: order.email,
      customerName: order.customer_name,
      serviceName: order.service_name,
      downloadPageUrl: getDownloadPageUrl(downloadToken),
      deliverableFileName: catalogue.deliverable_file_name,
    });
  }

  return buildDeliveryPayload(
    { ...order, download_token: downloadToken, status: 'paid' },
    catalogue
  );
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
    `SELECT id, catalogue_id, service_name, customer_name, email, amount, currency, status, paid_at, tx_ref, invoice_number, invoice_sent_at, download_token
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

    try {
      await fulfillDigitalOrder(existingOrder.id);
    } catch (deliveryError) {
      console.error('Digital delivery error:', deliveryError.message);
    }
  }
};

const verifyPayment = async (req, res) => {
  const { reference: txRef } = req.params;
  const transactionId = req.query?.transaction_id;
  const authenticatedUser = req.user; // Will be null if not authenticated

  console.log('VERIFY PAYMENT DEBUG START:', { 
    txRef, 
    transactionId, 
    authenticatedUser: authenticatedUser ? { id: authenticatedUser.id, email: authenticatedUser.email } : null,
    authHeader: req.headers.authorization ? 'Present' : 'Missing'
  });

  if (!txRef) {
    return res.status(400).json({ error: 'txRef is required.' });
  }

  if (!config.flutterwave_secret_key) {
    return res.status(500).json({ error: 'Payment is not configured on server.' });
  }

  try {
    // First, get the order details to check ownership before verifying with Flutterwave
    const [[order]] = await db.query(
      `SELECT id, user_id, email, customer_name, service_name, status
       FROM service_orders
       WHERE tx_ref = ?
       LIMIT 1`,
      [txRef]
    );

    console.log('ORDER DEBUG:', order);

    if (!order) {
      console.log('ORDER NOT FOUND for txRef:', txRef);
      return res.status(404).json({ error: 'Order not found.' });
    }

    // If user is authenticated, verify they own this order
    if (authenticatedUser) {
      const userEmail = authenticatedUser.email?.toLowerCase();
      const orderEmail = order.email?.toLowerCase();
      const userId = authenticatedUser.id;
      const orderUserId = order.user_id;

      console.log('ACCESS CHECK DEBUG:', { 
        userEmail, 
        orderEmail, 
        userId, 
        orderUserId,
        emailMatch: userEmail === orderEmail,
        userIdMatch: userId === orderUserId,
        user_id_type: typeof userId,
        order_user_id_type: typeof orderUserId
      });

      // User must match by email OR by user_id
      const hasAccess = (userEmail && userEmail === orderEmail) || (userId && userId === orderUserId);
      
      console.log('ACCESS RESULT:', hasAccess);
      
      if (!hasAccess) {
        console.log('ACCESS DENIED for user:', authenticatedUser.email, 'order:', order.email);
        return res.status(403).json({ 
          error: 'You do not have permission to view this transaction. Please sign in with the email address used for this purchase.',
          requiresAuth: true 
        });
      }
    }

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
    let delivery = null;
    if (data) {
      await persistVerification(data);
      const lookupId = data.meta?.orderId;
      if (data.status === 'successful') {
        if (lookupId) {
          delivery = await fulfillDigitalOrder(lookupId);
        } else if (txRef) {
          const [[paidOrder]] = await db.query(
            `SELECT o.id, o.service_name, o.status, o.download_token, c.delivery_type, c.deliverable_file_url, c.deliverable_file_name, c.deliverable_external_url
             FROM service_orders o
             LEFT JOIN catalogues c ON c.id = o.catalogue_id
             WHERE o.tx_ref = ? AND o.status = ?
             LIMIT 1`,
            [txRef, 'paid']
          );
          if (paidOrder) {
            delivery = buildDeliveryPayload(paidOrder, paidOrder);
          }
        }
      }
    }

    return res.status(200).json({
      message: 'Payment verification completed.',
      data,
      delivery,
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
  const userEmail = req.user?.email;
  if (!userId || !userEmail) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [rows] = await db.query(
      `SELECT o.id, o.service_name, o.amount, o.currency, o.payment_type, o.status, o.tx_ref, o.paid_at, o.created_at,
              o.invoice_number, o.invoice_sent_at, o.download_token,
              c.delivery_type, c.deliverable_file_url, c.deliverable_file_name, c.deliverable_external_url
       FROM service_orders o
       LEFT JOIN catalogues c ON c.id = o.catalogue_id
       WHERE o.user_id = ? OR (o.user_id IS NULL AND o.email = ?)
       ORDER BY o.id DESC`,
      [userId, userEmail]
    );
    return res.status(200).json(
      rows.map((row) => ({
        id: row.id,
        service_name: row.service_name,
        amount: row.amount,
        currency: row.currency,
        payment_type: row.payment_type,
        status: row.status,
        tx_ref: row.tx_ref,
        paid_at: row.paid_at,
        created_at: row.created_at,
        invoice_number: row.invoice_number,
        invoice_sent_at: row.invoice_sent_at,
        delivery: buildDeliveryPayload(row, row),
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMyOrderInvoice = async (req, res) => {
  const userId = req.user?.id;
  const userEmail = req.user?.email;
  const { orderId } = req.params;
  if (!userId || !userEmail || !orderId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [[order]] = await db.query(
      `SELECT id, customer_name, email, service_name, amount, currency, tx_ref, paid_at, status, invoice_number
       FROM service_orders
       WHERE id = ? AND (user_id = ? OR (user_id IS NULL AND email = ?))
       LIMIT 1`,
      [orderId, userId, userEmail]
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

const getDeliveryByToken = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ error: 'Download token is required.' });
  }

  try {
    const [[row]] = await db.query(
      `SELECT o.id, o.service_name, o.status, o.download_token, c.delivery_type, c.deliverable_file_url, c.deliverable_file_name, c.deliverable_external_url
       FROM service_orders o
       LEFT JOIN catalogues c ON c.id = o.catalogue_id
       WHERE o.download_token = ?
       LIMIT 1`,
      [token]
    );

    if (!row || row.status !== 'paid') {
      return res.status(404).json({ error: 'Download not found or payment not confirmed.' });
    }

    return res.status(200).json(buildDeliveryPayload(row, row));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const downloadDeliverable = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ error: 'Download token is required.' });
  }

  try {
    const [[row]] = await db.query(
      `SELECT o.id, o.service_name, o.status, o.download_token, c.delivery_type, c.deliverable_file_url, c.deliverable_file_name
       FROM service_orders o
       LEFT JOIN catalogues c ON c.id = o.catalogue_id
       WHERE o.download_token = ?
       LIMIT 1`,
      [token]
    );

    if (!row || row.status !== 'paid') {
      return res.status(404).json({ error: 'Download not available.' });
    }

    if (row.delivery_type !== 'digital_file' || !row.deliverable_file_url) {
      return res.status(400).json({ error: 'This order does not include a hosted file download.' });
    }

    const filePath = getStoredFilePath(row.deliverable_file_url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server.' });
    }

    const downloadName = row.deliverable_file_name || path.basename(filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName.replace(/"/g, '')}"`);
    return res.sendFile(filePath);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMyOrderDelivery = async (req, res) => {
  const userId = req.user?.id;
  const userEmail = req.user?.email;
  const { orderId } = req.params;
  if (!userId || !userEmail || !orderId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [[row]] = await db.query(
      `SELECT o.id, o.service_name, o.status, o.download_token, c.delivery_type, c.deliverable_file_url, c.deliverable_file_name, c.deliverable_external_url
       FROM service_orders o
       LEFT JOIN catalogues c ON c.id = o.catalogue_id
       WHERE o.id = ? AND (o.user_id = ? OR (o.user_id IS NULL AND o.email = ?))
       LIMIT 1`,
      [orderId, userId, userEmail]
    );

    if (!row) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    if (row.status !== 'paid') {
      return res.status(400).json({ error: 'Delivery is available only for paid orders.' });
    }

    if (isDigitalDelivery(row.delivery_type) && !row.download_token) {
      await fulfillDigitalOrder(row.id);
      const [[updated]] = await db.query(
        `SELECT o.id, o.service_name, o.status, o.download_token, c.delivery_type, c.deliverable_file_url, c.deliverable_file_name, c.deliverable_external_url
         FROM service_orders o
         LEFT JOIN catalogues c ON c.id = o.catalogue_id
         WHERE o.id = ? AND (o.user_id = ? OR (o.user_id IS NULL AND o.email = ?))
         LIMIT 1`,
        [orderId, userId, userEmail]
      );
      return res.status(200).json(buildDeliveryPayload(updated, updated));
    }

    return res.status(200).json(buildDeliveryPayload(row, row));
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
  getDeliveryByToken,
  downloadDeliverable,
  getMyOrderDelivery,
};
