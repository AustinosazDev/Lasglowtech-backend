const crypto = require('crypto');
const db = require('../db');
const config = require('../config');
const { renderEmailShell, sendEmail } = require('../utils/notifications');

const PUBLIC_ORIGIN = config.remote_client_app || config.local_client_app || 'http://localhost:5173';
const BATCH_SIZE = 50;
const allowedAttachmentExt = new Set(['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg']);
const buildAttachments = (files = []) => files
  .filter((file) => allowedAttachmentExt.has(require('path').extname(file.originalname || '').toLowerCase()))
  .map((file) => ({ filename: file.originalname, content: file.buffer, contentType: file.mimetype || undefined }));

const sanitizeHtml = (value = '') => String(value)
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/\s+on[a-z]+\s*=\s*(["']).*?\1/gi, '')
  .replace(/javascript:/gi, '')
  .trim();

const hasContent = (content) => sanitizeHtml(content).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim().length > 0;
const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
const normalizeEmails = (value) => {
  const emails = String(value || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return [...new Set(emails.map((email) => email.toLowerCase()))];
};
const recipientEmails = (value) => {
  const emails = normalizeEmails(value);
  if (emails.some((email) => !validEmail(email))) throw new Error('One or more recipient emails are invalid.');
  return emails;
};

const getNewsletter = async (id) => {
  const [rows] = await db.query('SELECT * FROM newsletters WHERE id = ?', [id]);
  return rows[0] || null;
};

const listNewsletters = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const params = [];
    let where = '';
    if (req.query.status && req.query.status !== 'All') {
      where = ' WHERE status = ?';
      params.push(req.query.status);
    }
    const [rows] = await db.query(`SELECT * FROM newsletters${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM newsletters${where}`, params);
    res.json({ newsletters: rows, total: countRows[0]?.total || 0, page, limit });
  } catch (error) {
    console.error('Error listing newsletters:', error);
    res.status(500).json({ message: error.message });
  }
};

const createNewsletter = async (req, res) => {
  const subject = String(req.body.subject || '').trim();
  const content = sanitizeHtml(req.body.content || '');
  const recipients = recipientEmails(req.body.recipientEmails);
  if (!subject || !hasContent(content)) return res.status(400).json({ message: 'Subject and content are required.' });
  try {
    const [result] = await db.query(
      `INSERT INTO newsletters (subject, content, recipient_emails, status, created_by) VALUES (?, ?, ?, 'draft', ?)`,
      [subject, content, recipients.join(','), req.user.id]
    );
    res.status(201).json(await getNewsletter(result.insertId));
  } catch (error) {
    console.error('Error creating newsletter:', error);
    res.status(500).json({ message: error.message });
  }
};

const getOneNewsletter = async (req, res) => {
  try {
    const newsletter = await getNewsletter(req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found.' });
    res.json(newsletter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateNewsletter = async (req, res) => {
  const subject = String(req.body.subject || '').trim();
  const content = sanitizeHtml(req.body.content || '');
  const recipients = recipientEmails(req.body.recipientEmails);
  if (!subject || !hasContent(content)) return res.status(400).json({ message: 'Subject and content are required.' });
  try {
    const newsletter = await getNewsletter(req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found.' });
    if (!['draft', 'scheduled'].includes(newsletter.status)) return res.status(409).json({ message: 'Only drafts and scheduled newsletters can be edited.' });
    await db.query('UPDATE newsletters SET subject = ?, content = ?, recipient_emails = ? WHERE id = ?', [subject, content, recipients.join(','), req.params.id]);
    res.json(await getNewsletter(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNewsletter = async (req, res) => {
  try {
    const newsletter = await getNewsletter(req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found.' });
    if (newsletter.status !== 'draft') return res.status(409).json({ message: 'Only drafts can be deleted.' });
    await db.query('DELETE FROM newsletters WHERE id = ?', [req.params.id]);
    res.json({ message: 'Newsletter deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const buildNewsletterHtml = (newsletter, token) => renderEmailShell({
  title: newsletter.subject,
  subtitle: 'Lasglowtech newsletter',
  contentHtml: `${newsletter.content}<p style="margin:28px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#64748b;">You are receiving this because you subscribed to Lasglowtech updates. <a href="${PUBLIC_ORIGIN}/unsubscribe/${token}" style="color:#8700ff;">Unsubscribe</a></p>`,
});

const sendNewsletter = async (newsletterId, attachments = []) => {
  const newsletter = await getNewsletter(newsletterId);
  if (!newsletter) throw new Error('Newsletter not found.');
  if (!['draft', 'scheduled'].includes(newsletter.status)) throw new Error('This newsletter cannot be sent.');
  if (!hasContent(newsletter.content) || !newsletter.subject) throw new Error('Subject and content are required.');

  await db.query("UPDATE newsletters SET status = 'sending' WHERE id = ?", [newsletterId]);
  const selectedEmails = recipientEmails(newsletter.recipient_emails);
  const subscribers = selectedEmails.length
    ? selectedEmails.map((email) => ({ email, unsubscribe_token: 'direct' }))
    : (await db.query("SELECT id, email, unsubscribe_token FROM newsletter_subscribers WHERE active = 1"))[0];
  let sent = 0;
  let failed = 0;
  for (let index = 0; index < subscribers.length; index += BATCH_SIZE) {
    const batch = subscribers.slice(index, index + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map((subscriber) => sendEmail({
      to: subscriber.email,
      subject: newsletter.subject,
      html: buildNewsletterHtml(newsletter, subscriber.unsubscribe_token),
      attachments,
    })));
    results.forEach((result) => result.status === 'fulfilled' ? sent++ : failed++);
  }
  const finalStatus = failed && !sent ? 'failed' : 'sent';
  await db.query('UPDATE newsletters SET status = ?, sent_at = NOW(), recipient_count = ? WHERE id = ?', [finalStatus, sent, newsletterId]);
  return { sent, failed, recipientCount: subscribers.length, status: finalStatus };
};

const sendNow = async (req, res) => {
  try {
    const result = await sendNewsletter(req.params.id, buildAttachments(req.files));
    res.json(result);
  } catch (error) {
    console.error('Error sending newsletter:', error);
    await db.query("UPDATE newsletters SET status = 'failed' WHERE id = ?", [req.params.id]).catch(() => {});
    res.status(400).json({ message: error.message });
  }
};

const scheduleNewsletter = async (req, res) => {
  const scheduledAt = new Date(req.body.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) return res.status(400).json({ message: 'Choose a future schedule time.' });
  try {
    const newsletter = await getNewsletter(req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found.' });
    if (!['draft', 'scheduled'].includes(newsletter.status)) return res.status(409).json({ message: 'This newsletter cannot be scheduled.' });
    if (!newsletter.subject || !hasContent(newsletter.content)) return res.status(400).json({ message: 'Subject and content are required.' });
    await db.query("UPDATE newsletters SET status = 'scheduled', scheduled_at = ? WHERE id = ?", [scheduledAt, req.params.id]);
    res.json(await getNewsletter(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendTest = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid test email.' });
  try {
    const newsletter = await getNewsletter(req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found.' });
    await sendEmail({ to: email, subject: `[TEST] ${newsletter.subject}`, html: buildNewsletterHtml(newsletter, 'test'), attachments: buildAttachments(req.files) });
    res.json({ message: 'Test email sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listSubscribers = async (req, res) => {
  try {
    const params = [];
    const conditions = [];
    if (req.query.status && req.query.status !== 'All') { conditions.push('active = ?'); params.push(req.query.status === 'subscribed' ? 1 : 0); }
    if (req.query.search) { conditions.push('email LIKE ?'); params.push(`%${req.query.search}%`); }
    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await db.query(`SELECT id, email, active, subscribed_at, unsubscribed_at FROM newsletter_subscribers${where} ORDER BY subscribed_at DESC`, params);
    res.json(rows);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const addSubscriber = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email.' });
  try {
    await db.query(`INSERT INTO newsletter_subscribers (email, active, unsubscribe_token) VALUES (?, 1, ?) ON DUPLICATE KEY UPDATE active = 1, unsubscribed_at = NULL`, [email, crypto.randomBytes(24).toString('hex')]);
    res.status(201).json({ message: 'Subscriber added.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const removeSubscriber = async (req, res) => {
  try { await db.query('UPDATE newsletter_subscribers SET active = 0, unsubscribed_at = NOW() WHERE id = ?', [req.params.id]); res.json({ message: 'Subscriber unsubscribed.' }); }
  catch (error) { res.status(500).json({ message: error.message }); }
};

const unsubscribe = async (req, res) => {
  try { await db.query('UPDATE newsletter_subscribers SET active = 0, unsubscribed_at = NOW() WHERE unsubscribe_token = ?', [req.params.token]); res.send('<h1>You have been unsubscribed.</h1><p>You will no longer receive Lasglowtech newsletters.</p>'); }
  catch (error) { res.status(500).send('Unable to unsubscribe.'); }
};

const processScheduledNewsletters = async () => {
  const [rows] = await db.query("SELECT id FROM newsletters WHERE status = 'scheduled' AND scheduled_at <= NOW()");
  for (const row of rows) await sendNewsletter(row.id).catch((error) => console.error(`Scheduled newsletter ${row.id} failed:`, error.message));
};

module.exports = { listNewsletters, createNewsletter, getOneNewsletter, updateNewsletter, deleteNewsletter, sendNow, scheduleNewsletter, sendTest, listSubscribers, addSubscriber, removeSubscriber, unsubscribe, processScheduledNewsletters };
