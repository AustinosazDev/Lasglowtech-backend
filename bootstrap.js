const db = require('./db');

const hasColumn = async (tableName, columnName) => {
  try {
    const [rows] = await db.query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_schema = DATABASE()
         AND table_name = ?
         AND column_name = ?
       LIMIT 1`,
      [tableName, columnName]
    );
    return rows.length > 0;
  } catch (_) {
    return false;
  }
};

const ensureColumn = async (tableName, columnName, definitionSql) => {
  if (await hasColumn(tableName, columnName)) return;
  await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${definitionSql}`);
};

const ensureTables = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('client','talent','student','learner','admin') NOT NULL DEFAULT 'client',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    ALTER TABLE users
    MODIFY COLUMN role ENUM('client','talent','student','learner','admin') NOT NULL DEFAULT 'client'
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS catalogues (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      slug VARCHAR(220) NOT NULL UNIQUE,
      summary VARCHAR(400) NOT NULL,
      description TEXT,
      image_url VARCHAR(400),
      price DECIMAL(12,2) NOT NULL DEFAULT 0,
      package_tier ENUM('starter','standard','premium') NOT NULL DEFAULT 'standard',
      is_popular TINYINT(1) NOT NULL DEFAULT 0,
      features_json TEXT,
      payment_type ENUM('full','deposit') NOT NULL DEFAULT 'full',
      currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
      is_payment_enabled TINYINT(1) NOT NULL DEFAULT 0,
      is_published TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS service_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      catalogue_id INT NULL,
      service_slug VARCHAR(220) NOT NULL,
      service_name VARCHAR(220) NOT NULL,
      customer_name VARCHAR(180) NOT NULL,
      email VARCHAR(190) NOT NULL,
      amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
      payment_type ENUM('full','deposit') NOT NULL DEFAULT 'full',
      status ENUM('initiated','pending','paid','failed','cancelled') NOT NULL DEFAULT 'initiated',
      tx_ref VARCHAR(220) NOT NULL UNIQUE,
      flutterwave_tx_id VARCHAR(120),
      flutterwave_ref VARCHAR(180),
      payment_link VARCHAR(400),
      invoice_number VARCHAR(120),
      invoice_sent_at DATETIME NULL,
      email_notification_status ENUM('pending','sent','failed','skipped') NOT NULL DEFAULT 'pending',
      email_notification_error VARCHAR(500),
      invoice_email_status ENUM('pending','sent','failed','skipped') NOT NULL DEFAULT 'pending',
      invoice_email_error VARCHAR(500),
      paid_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  await ensureColumn('service_orders', 'invoice_number', 'invoice_number VARCHAR(120) NULL');
  await ensureColumn('service_orders', 'invoice_sent_at', 'invoice_sent_at DATETIME NULL');
  await ensureColumn(
    'service_orders',
    'email_notification_status',
    "email_notification_status ENUM('pending','sent','failed','skipped') NOT NULL DEFAULT 'pending'"
  );
  await ensureColumn('service_orders', 'email_notification_error', 'email_notification_error VARCHAR(500) NULL');
  await ensureColumn(
    'service_orders',
    'invoice_email_status',
    "invoice_email_status ENUM('pending','sent','failed','skipped') NOT NULL DEFAULT 'pending'"
  );
  await ensureColumn('service_orders', 'invoice_email_error', 'invoice_email_error VARCHAR(500) NULL');

  await ensureColumn(
    'catalogues',
    'package_tier',
    "package_tier ENUM('starter','standard','premium') NOT NULL DEFAULT 'standard'"
  );
  await ensureColumn('catalogues', 'is_popular', 'is_popular TINYINT(1) NOT NULL DEFAULT 0');
  await ensureColumn('catalogues', 'features_json', 'features_json TEXT NULL');
  await ensureColumn(
    'catalogues',
    'delivery_type',
    "delivery_type ENUM('service','digital_file','digital_link') NOT NULL DEFAULT 'service'"
  );
  await ensureColumn('catalogues', 'deliverable_file_url', 'deliverable_file_url VARCHAR(500) NULL');
  await ensureColumn('catalogues', 'deliverable_file_name', 'deliverable_file_name VARCHAR(255) NULL');
  await ensureColumn('catalogues', 'deliverable_external_url', 'deliverable_external_url VARCHAR(500) NULL');
  await ensureColumn('service_orders', 'download_token', 'download_token VARCHAR(64) NULL');
  await ensureColumn('service_orders', 'delivered_at', 'delivered_at DATETIME NULL');
  await ensureColumn('service_orders', 'catalogue_id', 'catalogue_id INT NULL');

  await db.query(`
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NULL,
      tx_ref VARCHAR(220) NOT NULL UNIQUE,
      flutterwave_tx_id VARCHAR(120),
      flutterwave_ref VARCHAR(180),
      gateway_status VARCHAR(50),
      amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
      payload_json LONGTEXT,
      verified_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS lms_courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(220) NOT NULL,
      slug VARCHAR(240) NOT NULL UNIQUE,
      summary VARCHAR(420) NOT NULL,
      description TEXT,
      level ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
      duration_weeks INT NOT NULL DEFAULT 4,
      image_url VARCHAR(400),
      is_featured TINYINT(1) NOT NULL DEFAULT 0,
      is_published TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS lms_modules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_id INT NOT NULL,
      title VARCHAR(220) NOT NULL,
      module_order INT NOT NULL DEFAULT 1,
      duration_minutes INT NOT NULL DEFAULT 0,
      resource_url VARCHAR(400),
      slide_url VARCHAR(500),
      video_url VARCHAR(500),
      module_content LONGTEXT,
      reference_links_json LONGTEXT,
      is_preview TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await ensureColumn('lms_modules', 'slide_url', 'slide_url VARCHAR(500) NULL');
  await ensureColumn('lms_modules', 'video_url', 'video_url VARCHAR(500) NULL');
  await ensureColumn('lms_modules', 'module_content', 'module_content LONGTEXT NULL');
  await ensureColumn('lms_modules', 'reference_links_json', 'reference_links_json LONGTEXT NULL');
  await ensureColumn('lms_modules', 'week_num', 'week_num INT NULL');

  await ensureColumn('lms_courses', 'schedule_start_date', 'schedule_start_date DATE NULL');
  await ensureColumn('lms_modules', 'scheduled_date', 'scheduled_date DATE NULL');
  await ensureColumn('lms_modules', 'scheduled_time', 'scheduled_time VARCHAR(20) NULL');

  await db.query(`
    CREATE TABLE IF NOT EXISTS lms_enrollments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      course_id INT NOT NULL,
      status ENUM('active','completed','paused') NOT NULL DEFAULT 'active',
      progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
      certificate_code VARCHAR(120),
      certificate_sent_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_user_course (user_id, course_id)
    )
  `);
  await ensureColumn('lms_enrollments', 'certificate_code', 'certificate_code VARCHAR(120) NULL');
  await ensureColumn('lms_enrollments', 'certificate_sent_at', 'certificate_sent_at DATETIME NULL');
  await ensureColumn('lms_enrollments', 'certificate_message', 'certificate_message TEXT NULL');
  await ensureColumn('lms_enrollments', 'certificate_signed_at', 'certificate_signed_at DATETIME NULL');
  await ensureColumn(
    'lms_enrollments',
    'certificate_signature_label',
    'certificate_signature_label VARCHAR(120) NULL'
  );

  await ensureColumn('lms_courses', 'brochure_url', 'brochure_url VARCHAR(500) NULL');
  await ensureColumn(
    'lms_courses',
    'issue_certificate_on_completion',
    'issue_certificate_on_completion TINYINT(1) NOT NULL DEFAULT 1'
  );

  await db.query(`
    CREATE TABLE IF NOT EXISTS lms_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      enrollment_id INT NOT NULL,
      module_id INT NOT NULL,
      is_completed TINYINT(1) NOT NULL DEFAULT 0,
      last_position_seconds INT NOT NULL DEFAULT 0,
      completed_at DATETIME NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_enrollment_module (enrollment_id, module_id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS lms_module_quizzes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id INT NOT NULL,
      title VARCHAR(220) NOT NULL DEFAULT 'Module quiz',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_module_quiz (module_id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS lms_quiz_questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quiz_id INT NOT NULL,
      question_text TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS lms_quiz_options (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question_id INT NOT NULL,
      option_text VARCHAR(500) NOT NULL,
      is_correct TINYINT(1) NOT NULL DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS lms_quiz_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      enrollment_id INT NOT NULL,
      module_id INT NOT NULL,
      quiz_id INT NOT NULL,
      score INT NOT NULL DEFAULT 0,
      total INT NOT NULL DEFAULT 0,
      percent INT NOT NULL DEFAULT 0,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_enrollment_module_quiz_submission (enrollment_id, module_id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash VARCHAR(128) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS bulk_email_campaigns (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject VARCHAR(250) NOT NULL,
      body_html LONGTEXT,
      total_recipients INT NOT NULL DEFAULT 0,
      total_sent INT NOT NULL DEFAULT 0,
      total_failed INT NOT NULL DEFAULT 0,
      created_by VARCHAR(190),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS bulk_email_recipients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      campaign_id INT NOT NULL,
      email VARCHAR(190) NOT NULL,
      status ENUM('sent','failed') NOT NULL DEFAULT 'sent',
      error_message VARCHAR(500),
      sent_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS career_applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      full_name VARCHAR(180) NOT NULL,
      email VARCHAR(190) NOT NULL,
      phone VARCHAR(60) NOT NULL,
      skill_interest VARCHAR(160) NOT NULL,
      learning_goal TEXT NOT NULL,
      experience_level VARCHAR(80),
      availability VARCHAR(80),
      city VARCHAR(120),
      country VARCHAR(120),
      portfolio_url VARCHAR(300),
      picture_url VARCHAR(400),
      status ENUM('new','reviewing','accepted','waitlist','rejected') NOT NULL DEFAULT 'new',
      access_token VARCHAR(120),
      fee_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      payment_status ENUM('unpaid','part_paid','paid','waived') NOT NULL DEFAULT 'unpaid',
      follow_up_date DATE,
      cohort VARCHAR(120),
      admin_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  await ensureColumn('career_applications', 'user_id', 'user_id INT NULL');
  await ensureColumn('career_applications', 'access_token', 'access_token VARCHAR(120) NULL');
  await ensureColumn('career_applications', 'fee_amount', 'fee_amount DECIMAL(12,2) NOT NULL DEFAULT 0');
  await ensureColumn(
    'career_applications',
    'payment_status',
    "payment_status ENUM('unpaid','part_paid','paid','waived') NOT NULL DEFAULT 'unpaid'"
  );
  await ensureColumn('career_applications', 'follow_up_date', 'follow_up_date DATE NULL');
  await ensureColumn('career_applications', 'cohort', 'cohort VARCHAR(120) NULL');

  await db.query(`
    CREATE TABLE IF NOT EXISTS certificate_settings (
      id INT PRIMARY KEY DEFAULT 1,
      default_message TEXT,
      default_signature_label VARCHAR(255) DEFAULT 'Authorized Signatory',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `).catch(() => {});
  await db.query(`INSERT IGNORE INTO certificate_settings (id, default_signature_label) VALUES (1, 'Authorized Signatory')`).catch(() => {});

  await db.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cover VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      shares INT DEFAULT 0,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      slug VARCHAR(255) DEFAULT NULL
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(100) DEFAULT NULL,
      lastName VARCHAR(100) DEFAULT NULL,
      email VARCHAR(150) DEFAULT NULL,
      subject VARCHAR(200) DEFAULT NULL,
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS email_subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      status ENUM('subscribed','unsubscribed') DEFAULT 'subscribed',
      subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      unsubscribed_at TIMESTAMP NULL DEFAULT NULL
    )
  `);

  const [countRows] = await db.query('SELECT COUNT(*) AS total FROM catalogues');
  if ((countRows[0]?.total || 0) === 0) {
    await db.query(
      `INSERT INTO catalogues
      (title, slug, summary, description, image_url, price, payment_type, currency, is_payment_enabled, is_published, sort_order)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Web Development',
        'web-development',
        'High-performance websites and web applications for serious growth.',
        'Custom websites, company platforms, and frontend/backend engineering delivery.',
        '',
        150000,
        'deposit',
        'NGN',
        1,
        1,
        1,
        'Mobile Development',
        'mobile-apps',
        'Cross-platform mobile apps with stable architecture and polished UI.',
        'React Native and Flutter builds for startups and enterprise teams.',
        '',
        250000,
        'deposit',
        'NGN',
        1,
        1,
        2,
        'UI/UX Design',
        'ui-ux-design',
        'Research-backed interface design and product prototypes.',
        'Design systems, user flows, and high-fidelity screens with usability depth.',
        '',
        80000,
        'full',
        'NGN',
        1,
        1,
        3,
        'Graphic Design',
        'graphic-design',
        'Brand visuals and campaign assets that stand out in crowded markets.',
        'Logos, social media graphics, flyers, and publication-ready assets.',
        '',
        50000,
        'full',
        'NGN',
        1,
        1,
        4,
      ]
    );
  }
};

module.exports = {
  ensureTables,
};
