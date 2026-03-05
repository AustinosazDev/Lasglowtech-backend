
const config = require('../config'); // 👈 import your config object
require('dotenv').config();

const nodemailer = require('nodemailer');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: config.email_user, 
    pass: config.email_pass, 
  },
});

const sendMailFromContactForm = async ({ firstName, lastName, email, subject, message }) => {
  const mailOptions = {
    from: `"${firstName} ${lastName}" <${config.email_user}>`, // 👈 dynamic from user input
    replyTo: email,
    to: config.email_user,                  // 👈 admin or your receiving email
    subject: `New Contact Form Submission: ${subject}`,
    html: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Mailchimp setup
mailchimp.setConfig({
  apiKey: config.apiKey,
  server: config.server,
});
const listId = config.listid;

// Add contact to Mailchimp list
const addToMailchimpList = async (email) => {
  try {
    await mailchimp.lists.addListMember(listId, {
      email_address: email,
      status: 'subscribed',
    });
  } catch (err) {
    if (err.response?.body?.title === 'Member Exists') {
      return;
    } else {
      console.error('Mailchimp error:', err.response?.body || err.message);
      throw err;
    }
  }
};

module.exports = { sendMailFromContactForm, addToMailchimpList };
