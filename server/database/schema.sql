-- ================================================================
--  SUNSHINE ORPHANAGE MANAGEMENT SYSTEM
--  Complete Schema - Matches ALL routes exactly
--  Run entirely in MySQL Workbench: Ctrl+Shift+Enter
-- ================================================================

DROP DATABASE IF EXISTS orphanage_db;
CREATE DATABASE orphanage_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE orphanage_db;

-- ── USERS ────────────────────────────────────────────────────────
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','manager','staff','viewer') DEFAULT 'staff',
  phone         VARCHAR(20),
  avatar        VARCHAR(255),
  is_active     BOOLEAN DEFAULT TRUE,
  last_login    DATETIME,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── ACTIVITY LOGS ────────────────────────────────────────────────
CREATE TABLE activity_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  action      VARCHAR(100) NOT NULL,
  module      VARCHAR(50) NOT NULL,
  description TEXT,
  ip_address  VARCHAR(45),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── CHILDREN ─────────────────────────────────────────────────────
CREATE TABLE children (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  date_of_birth    DATE,
  gender           ENUM('Male','Female','Other') DEFAULT 'Male',
  admission_type   ENUM('Orphan','Half-Orphan','Abandoned','Surrendered') DEFAULT 'Orphan',
  status           ENUM('Active','Adopted','Transferred','Deceased') DEFAULT 'Active',
  hometown         VARCHAR(100),
  medical_notes    TEXT,
  guardian_name    VARCHAR(100),
  guardian_contact VARCHAR(20),
  photo_url        VARCHAR(255),
  hobby            VARCHAR(200),
  favourite_subject VARCHAR(100),
  dream            VARCHAR(200),
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── STAFF ────────────────────────────────────────────────────────
CREATE TABLE staff (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  position    VARCHAR(100),
  department  VARCHAR(100),
  email       VARCHAR(100),
  phone       VARCHAR(20),
  join_date   DATE,
  status      ENUM('Active','Inactive','On Leave') DEFAULT 'Active',
  salary      DECIMAL(10,2) DEFAULT 0,
  address     TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── DONATIONS ────────────────────────────────────────────────────
CREATE TABLE donations (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  donor_name    VARCHAR(100) NOT NULL,
  donation_type ENUM('Cash','Goods','Food','Clothing','Medicine','Other') DEFAULT 'Cash',
  amount        DECIMAL(12,2) DEFAULT 0,
  donation_date DATE NOT NULL,
  status        ENUM('Completed','Pending','Cancelled') DEFAULT 'Completed',
  notes         TEXT,
  child_id      INT DEFAULT NULL,
  user_id       INT DEFAULT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ── MEDICAL RECORDS ──────────────────────────────────────────────
CREATE TABLE medical_records (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  child_id         INT NOT NULL,
  record_type      VARCHAR(100),
  record_date      DATE,
  diagnosis        TEXT,
  treatment        TEXT,
  doctor_name      VARCHAR(100),
  next_appointment DATE,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);

-- ── EDUCATION RECORDS ────────────────────────────────────────────
CREATE TABLE education_records (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  child_id      INT NOT NULL,
  academic_year VARCHAR(20),
  grade         VARCHAR(20),
  school_name   VARCHAR(150),
  percentage    DECIMAL(5,2),
  grade_letter  VARCHAR(5),
  remarks       TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);

-- ── ADOPTIONS ────────────────────────────────────────────────────
CREATE TABLE adoptions (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  child_id             INT NOT NULL,
  adoptive_parent_name VARCHAR(100),
  contact_number       VARCHAR(20),
  email                VARCHAR(100),
  address              TEXT,
  application_date     DATE,
  status               ENUM('Pending','Approved','Rejected','Completed') DEFAULT 'Pending',
  notes                TEXT,
  user_id              INT DEFAULT NULL,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE SET NULL
);

-- ── EXPENSES ────────────────────────────────────────────────────
CREATE TABLE expenses (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  category     VARCHAR(100) NOT NULL,
  amount       DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  description  TEXT,
  status       ENUM('Pending','Approved','Rejected') DEFAULT 'Approved',
  approved_by  VARCHAR(100),
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── INVENTORY ────────────────────────────────────────────────────
CREATE TABLE inventory (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  item_name        VARCHAR(150) NOT NULL,
  category         VARCHAR(100),
  quantity         INT DEFAULT 0,
  unit             VARCHAR(30),
  minimum_quantity INT DEFAULT 5,
  expiry_date      DATE,
  supplier         VARCHAR(100),
  notes            TEXT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── EVENTS ───────────────────────────────────────────────────────
CREATE TABLE events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  event_type  ENUM('Cultural','Educational','Health','Sports','Religious','Fundraising','Environmental','Other') DEFAULT 'Other',
  start_date  DATE NOT NULL,
  end_date    DATE,
  location    VARCHAR(200),
  description TEXT,
  status      ENUM('Upcoming','Planned','Ongoing','Completed','Cancelled') DEFAULT 'Upcoming',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── SPONSORSHIPS (viewer can sponsor a child) ────────────────────
CREATE TABLE sponsorships (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  child_id     INT NOT NULL,
  user_id      INT NOT NULL,
  sponsor_name VARCHAR(100) NOT NULL,
  email        VARCHAR(100),
  phone        VARCHAR(20),
  amount       DECIMAL(10,2) DEFAULT 0,
  frequency    ENUM('Monthly','Quarterly','Yearly','One-time') DEFAULT 'Monthly',
  start_date   DATE,
  status       ENUM('Active','Paused','Cancelled') DEFAULT 'Active',
  notes        TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);