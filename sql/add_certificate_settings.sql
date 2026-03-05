-- Certificate default settings (message, signature label). Used to pre-fill when issuing certificates.
-- Run once if the table does not exist.

CREATE TABLE IF NOT EXISTS certificate_settings (
  id INT PRIMARY KEY DEFAULT 1,
  default_message TEXT,
  default_signature_label VARCHAR(255) DEFAULT 'Authorized Signatory',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO certificate_settings (id, default_signature_label) VALUES (1, 'Authorized Signatory');
