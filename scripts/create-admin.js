
//  If a user with the email exists, their role is set to 'admin' and password updated.
// Otherwise a new admin user is created (username derived from email).
 
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcrypt');
const db = require('../db');

const email = process.argv[2] || process.env.ADMIN_EMAIL;
const password = process.argv[3] || process.env.ADMIN_PASSWORD;

async function main() {
  if (!email || !password) {
    console.error('Usage: node create-admin.js <email> <password>');
    console.error('Or set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const username = email.split('@')[0] || 'admin';

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length) {
      await db.query(
        'UPDATE users SET role = ?, password = ? WHERE email = ?',
        ['admin', hashedPassword, email]
      );
      console.log('Updated existing user to admin:', email);
    } else {
      await db.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, 'admin']
      );
      console.log('Created admin user:', email);
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
