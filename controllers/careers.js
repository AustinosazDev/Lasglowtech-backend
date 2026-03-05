const db = require('../db');
const crypto = require('crypto');
const { sendCareerApplicationEmails } = require('../utils/notifications');
const { getAdminEmail } = require('../utils/admin');

const applyCareer = async (req, res) => {
  const userId = req.user?.id;
  const {
    fullName,
    email,
    phone,
    skillInterest,
    learningGoal,
    experienceLevel,
    availability,
    city,
    country,
    portfolioUrl,
    pictureUrl,
  } = req.body;

  if (!fullName || !email || !phone || !skillInterest || !learningGoal) {
    return res.status(400).json({
      error: 'fullName, email, phone, skillInterest and learningGoal are required.',
    });
  }

  try {
    const accessToken = crypto.randomBytes(20).toString('hex');
    const [result] = await db.query(
      `INSERT INTO career_applications
      (user_id, full_name, email, phone, skill_interest, learning_goal, experience_level, availability, city, country, portfolio_url, picture_url, status, access_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        fullName,
        email,
        phone,
        skillInterest,
        learningGoal,
        experienceLevel || '',
        availability || '',
        city || '',
        country || '',
        portfolioUrl || '',
        pictureUrl || '',
        'new',
        accessToken,
      ]
    );

    try {
      const adminEmail = await getAdminEmail();
      await sendCareerApplicationEmails({
        adminEmail,
        applicantEmail: email,
        data: {
          fullName,
          email,
          phone,
          skillInterest,
          experienceLevel: experienceLevel || '',
          availability: availability || '',
        },
      });
    } catch (mailError) {
      console.error('Career application email error:', mailError.message);
    }

    return res.status(201).json({
      message: 'Application submitted successfully.',
      id: result.insertId,
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMyCareerApplications = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, full_name, email, phone, skill_interest, learning_goal, experience_level, availability,
              city, country, portfolio_url, picture_url, status, fee_amount, payment_status, follow_up_date, cohort, admin_notes, created_at, updated_at
       FROM career_applications
       WHERE user_id = ?
       ORDER BY id DESC`,
      [userId]
    );

    return res.status(200).json({
      applications: rows,
      latest: rows[0] || null,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getCareerApplicationByToken = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ error: 'token is required.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, full_name, email, phone, skill_interest, learning_goal, experience_level, availability,
              city, country, portfolio_url, picture_url, status, fee_amount, payment_status, follow_up_date, cohort, admin_notes, created_at, updated_at
       FROM career_applications
       WHERE access_token = ?
       LIMIT 1`,
      [token]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getCareerApplications = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM career_applications ORDER BY id DESC');
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateCareerApplication = async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes, feeAmount, paymentStatus, followUpDate, cohort } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'status is required.' });
  }

  try {
    await db.query(
      `UPDATE career_applications
       SET status = ?, admin_notes = ?, fee_amount = ?, payment_status = ?, follow_up_date = ?, cohort = ?
       WHERE id = ?`,
      [
        status,
        adminNotes || '',
        Number(feeAmount || 0),
        paymentStatus || 'unpaid',
        followUpDate || null,
        cohort || '',
        id,
      ]
    );
    return res.status(200).json({ message: 'Application updated.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteCareerApplication = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM career_applications WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Application deleted.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  applyCareer,
  getMyCareerApplications,
  getCareerApplicationByToken,
  getCareerApplications,
  updateCareerApplication,
  deleteCareerApplication,
};
