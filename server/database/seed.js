require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const pool = require("./db");

// ── Tamil Nadu name data ─────────────────────────────────────────
const MALE_NAMES = [
  "Arjun",
  "Karthik",
  "Vijay",
  "Ravi",
  "Suresh",
  "Ganesh",
  "Dinesh",
  "Arun",
  "Murugan",
  "Selvam",
  "Balu",
  "Shankar",
  "Praveen",
  "Ajith",
  "Surya",
  "Vikram",
  "Deepak",
  "Naveen",
  "Manoj",
  "Gopal",
  "Siva",
  "Ram",
  "Kumar",
  "Venkat",
  "Pradeep",
  "Anand",
  "Rajan",
  "Sathish",
  "Mani",
  "Durai",
  "Prabhu",
  "Senthil",
  "Vignesh",
  "Harish",
  "Balaji",
  "Ramesh",
  "Mahesh",
  "Rajesh",
  "Suresh",
  "Lokesh",
  "Nitesh",
  "Aswin",
  "Kavin",
  "Kamal",
  "Saravanan",
  "Mohan",
  "Krishnan",
  "Prakash",
  "Pandian",
  "Thilak",
];
const FEMALE_NAMES = [
  "Priya",
  "Meena",
  "Lakshmi",
  "Kavitha",
  "Deepa",
  "Saranya",
  "Nithya",
  "Pavithra",
  "Anitha",
  "Rekha",
  "Geetha",
  "Shalini",
  "Divya",
  "Swetha",
  "Sumitha",
  "Malathi",
  "Valli",
  "Radha",
  "Pooja",
  "Asha",
  "Revathi",
  "Kamala",
  "Savitha",
  "Padma",
  "Bharathi",
  "Suganya",
  "Kanimozhi",
  "Tamilselvi",
  "Nirmala",
  "Vasantha",
  "Sangeetha",
  "Hema",
  "Kala",
  "Mala",
  "Usha",
  "Vani",
  "Santha",
  "Amudha",
  "Kokila",
  "Janaki",
  "Vijaya",
  "Nalini",
  "Ponni",
  "Selvi",
  "Rani",
  "Devi",
  "Malar",
  "Thenmozhi",
  "Parvathi",
  "Inba",
];
const LAST_NAMES = [
  "Kumar",
  "Raj",
  "Devi",
  "Selvam",
  "Krishnan",
  "Rajan",
  "Pillai",
  "Nair",
  "Pandian",
  "Murugan",
  "Shankar",
  "Iyer",
  "Balu",
  "Durai",
  "Samy",
  "Mohan",
  "Venkat",
  "Naidu",
  "Reddy",
  "Ganesan",
  "Perumal",
  "Subramanian",
  "Annamalai",
  "Sundaram",
  "Natarajan",
];
const TOWNS = [
  "Chennai",
  "Madurai",
  "Coimbatore",
  "Trichy",
  "Salem",
  "Vellore",
  "Erode",
  "Tirunelveli",
  "Thoothukudi",
  "Dindigul",
  "Cuddalore",
  "Villupuram",
  "Kancheepuram",
  "Thanjavur",
  "Namakkal",
  "Dharmapuri",
  "Krishnagiri",
  "Tirupur",
  "Karur",
  "Perambalur",
  "Ariyalur",
  "Nagapattinam",
  "Ramanathapuram",
  "Sivaganga",
  "Virudhunagar",
];
const HOBBIES = [
  "Drawing",
  "Singing",
  "Dancing",
  "Reading",
  "Cricket",
  "Football",
  "Kabaddi",
  "Chess",
  "Painting",
  "Storytelling",
  "Cooking",
  "Gardening",
  "Music",
  "Carrom",
  "Badminton",
];
const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Tamil",
  "Social Studies",
  "Art",
  "Physical Education",
  "Computer Science",
];
const DREAMS = [
  "To become a Doctor",
  "To become an Engineer",
  "To become a Teacher",
  "To become a Cricketer",
  "To become a Singer",
  "To become a Pilot",
  "To become a Police Officer",
  "To become a Nurse",
  "To become an Artist",
  "To become a Chef",
];
const ADMISSION = ["Orphan", "Half-Orphan", "Abandoned", "Surrendered"];
const MEDICAL_NOTE = [
  "Healthy, no known conditions",
  "Blood group A+, no allergies",
  "Asthmatic, uses inhaler twice daily",
  "Allergic to penicillin",
  "Needs reading glasses, mild myopia",
  "Diabetic, insulin managed",
  "Healthy and active",
  "Minor hearing difficulty left ear",
  "Healthy, vaccinations up to date",
  "Nutritional support ongoing",
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randDate(startYear, endYear) {
  const y = randInt(startYear, endYear);
  const m = String(randInt(1, 12)).padStart(2, "0");
  const d = String(randInt(1, 28)).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function seed() {
  console.log("🌱 Seeding database - this may take a moment...");
  const conn = await pool.getConnection();

  try {
    // ── USERS ──────────────────────────────────────────────────────
    const users = [
      {
        name: "Admin User",
        email: "admin@sunshinehome.org",
        password: "admin123",
        role: "admin",
      },
      {
        name: "Priya Sharma",
        email: "priya@sunshinehome.org",
        password: "manager123",
        role: "manager",
      },
      {
        name: "Anitha Rajan",
        email: "anitha@sunshinehome.org",
        password: "staff123",
        role: "staff",
      },
      {
        name: "Murugan Durai",
        email: "murugan@sunshinehome.org",
        password: "staff123",
        role: "staff",
      },
      {
        name: "Demo Viewer",
        email: "viewer@sunshinehome.org",
        password: "viewer123",
        role: "viewer",
      },
    ];
    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10);
      await conn.execute(
        `INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)
         ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role=VALUES(role)`,
        [u.name, u.email, hash, u.role],
      );
    }
    console.log("✅ Users seeded (5)");

    // ── CHILDREN - Generate 150 realistic children ──────────────────
    await conn.execute("DELETE FROM children");
    const childInserts = [];
    for (let i = 0; i < 150; i++) {
      const isMale = Math.random() > 0.48;
      const fname = isMale ? rand(MALE_NAMES) : rand(FEMALE_NAMES);
      const lname = rand(LAST_NAMES);
      const name = `${fname} ${lname}`;
      const dob = randDate(2008, 2018);
      const gender = isMale ? "Male" : "Female";
      const type = rand(ADMISSION);
      const status =
        Math.random() > 0.1 ? "Active" : rand(["Adopted", "Transferred"]);
      const town = rand(TOWNS);
      const medical = rand(MEDICAL_NOTE);
      const gName = `${rand(isMale ? FEMALE_NAMES : MALE_NAMES)} ${rand(LAST_NAMES)}`;
      const gPhone = `9${randInt(600000000, 999999999)}`;
      const hobby = rand(HOBBIES);
      const subj = rand(SUBJECTS);
      const dream = rand(DREAMS);
      childInserts.push([
        name,
        dob,
        gender,
        type,
        status,
        town,
        medical,
        gName,
        gPhone,
        hobby,
        subj,
        dream,
      ]);
    }
    for (const c of childInserts) {
      await conn.execute(
        `INSERT INTO children (name,date_of_birth,gender,admission_type,status,hometown,medical_notes,guardian_name,guardian_contact,hobby,favourite_subject,dream) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        c,
      );
    }
    console.log("✅ Children seeded (150)");

    // ── STAFF ──────────────────────────────────────────────────────
    const staff = [
      [
        "Dr. Ramesh Iyer",
        "Doctor",
        "Medical",
        "doctor@sunshinehome.org",
        "9876540001",
        "2019-01-15",
        "Active",
        65000,
      ],
      [
        "Mrs. Shanthi Mohan",
        "Teacher",
        "Education",
        "shanthi@sunshinehome.org",
        "9876540002",
        "2018-06-01",
        "Active",
        38000,
      ],
      [
        "Mr. Senthil Kumar",
        "Cook",
        "Kitchen",
        "senthil@sunshinehome.org",
        "9876540003",
        "2020-03-10",
        "Active",
        28000,
      ],
      [
        "Ms. Geetha Rajan",
        "Counselor",
        "Welfare",
        "geetha@sunshinehome.org",
        "9876540004",
        "2017-09-22",
        "Active",
        42000,
      ],
      [
        "Mr. Balu Pandian",
        "Security",
        "Security",
        "balu@sunshinehome.org",
        "9876540005",
        "2021-01-05",
        "Active",
        25000,
      ],
      [
        "Mrs. Kamala Devi",
        "Nurse",
        "Medical",
        "kamala@sunshinehome.org",
        "9876540006",
        "2019-07-18",
        "Active",
        35000,
      ],
      [
        "Mr. Arumugam",
        "Driver",
        "Transport",
        "arul@sunshinehome.org",
        "9876540007",
        "2020-11-30",
        "Active",
        26000,
      ],
      [
        "Ms. Parvathi Nair",
        "Teacher",
        "Education",
        "parvathi@sunshinehome.org",
        "9876540008",
        "2018-04-14",
        "Active",
        37000,
      ],
      [
        "Mr. Chandran Raja",
        "Warden",
        "Administration",
        "chandran@sunshinehome.org",
        "9876540009",
        "2016-08-20",
        "Active",
        45000,
      ],
      [
        "Ms. Vasantha Devi",
        "Caretaker",
        "Welfare",
        "vasantha@sunshinehome.org",
        "9876540010",
        "2021-06-01",
        "Active",
        22000,
      ],
      [
        "Mr. Suresh Babu",
        "Accountant",
        "Finance",
        "suresh@sunshinehome.org",
        "9876540011",
        "2020-08-15",
        "Active",
        40000,
      ],
      [
        "Ms. Nalini Devi",
        "Teacher",
        "Education",
        "nalini@sunshinehome.org",
        "9876540012",
        "2019-03-01",
        "Active",
        36000,
      ],
    ];
    for (const s of staff) {
      await conn.execute(
        `INSERT IGNORE INTO staff (name,position,department,email,phone,join_date,status,salary) VALUES (?,?,?,?,?,?,?,?)`,
        s,
      );
    }
    console.log("✅ Staff seeded (12)");

    // ── DONATIONS ──────────────────────────────────────────────────
    const donations = [
      [
        "Rajesh Mehta",
        "Cash",
        50000,
        "2025-01-10",
        "Completed",
        "Monthly donation",
      ],
      [
        "Infosys Foundation",
        "Cash",
        200000,
        "2025-02-14",
        "Completed",
        "Annual CSR donation",
      ],
      [
        "Anonymous",
        "Goods",
        15000,
        "2025-03-05",
        "Completed",
        "Clothes and books",
      ],
      [
        "Sundar Trust",
        "Cash",
        100000,
        "2025-03-20",
        "Completed",
        "Education fund",
      ],
      [
        "Lions Club Chennai",
        "Cash",
        75000,
        "2025-04-02",
        "Completed",
        "Food and nutrition",
      ],
      [
        "Mrs. Kavitha",
        "Cash",
        25000,
        "2025-04-18",
        "Completed",
        "Birthday donation",
      ],
      [
        "TCS Volunteers",
        "Goods",
        30000,
        "2025-05-10",
        "Completed",
        "Stationery and toys",
      ],
      [
        "Rotary Club",
        "Cash",
        60000,
        "2025-05-25",
        "Completed",
        "Medical expenses",
      ],
      ["Anonymous", "Cash", 10000, "2025-06-01", "Completed", "General fund"],
      [
        "HCL Technologies",
        "Cash",
        150000,
        "2025-06-15",
        "Completed",
        "Scholarship fund",
      ],
      [
        "Dr. Priya Nair",
        "Cash",
        20000,
        "2025-07-04",
        "Completed",
        "Independence Day donation",
      ],
      [
        "Chennai Cultural Society",
        "Goods",
        18000,
        "2025-07-20",
        "Completed",
        "Festival supplies",
      ],
      ["Anonymous", "Cash", 5000, "2025-08-12", "Completed", "General"],
      [
        "Wipro Cares",
        "Cash",
        80000,
        "2025-08-30",
        "Completed",
        "Infrastructure support",
      ],
      [
        "Mr. Karthikeyan",
        "Cash",
        35000,
        "2025-09-14",
        "Completed",
        "School fee support",
      ],
    ];
    for (const d of donations) {
      await conn.execute(
        `INSERT IGNORE INTO donations (donor_name,donation_type,amount,donation_date,status,notes) VALUES (?,?,?,?,?,?)`,
        d,
      );
    }
    console.log("✅ Donations seeded (15)");

    // ── EXPENSES ──────────────────────────────────────────────────
    const expenses = [
      [
        "Food & Nutrition",
        45000,
        "2025-01-31",
        "Monthly groceries",
        "Approved",
      ],
      [
        "Medical Supplies",
        18000,
        "2025-02-10",
        "Medicines and first aid",
        "Approved",
      ],
      ["Education", 22000, "2025-02-28", "Books, uniforms, fees", "Approved"],
      ["Utilities", 12000, "2025-03-05", "Electricity and water", "Approved"],
      ["Maintenance", 8500, "2025-03-20", "Building repairs", "Approved"],
      ["Staff Salaries", 360000, "2025-03-31", "Monthly salaries", "Approved"],
      [
        "Food & Nutrition",
        47000,
        "2025-04-30",
        "Monthly groceries",
        "Approved",
      ],
      ["Recreation", 5000, "2025-05-15", "Sports equipment", "Approved"],
      [
        "Medical Supplies",
        21000,
        "2025-05-25",
        "Quarterly medicines",
        "Approved",
      ],
      ["Utilities", 13500, "2025-06-05", "Electricity bill", "Approved"],
      ["Education", 35000, "2025-06-30", "Annual school fees", "Approved"],
      [
        "Food & Nutrition",
        44000,
        "2025-07-31",
        "Monthly groceries",
        "Approved",
      ],
    ];
    for (const e of expenses) {
      await conn.execute(
        `INSERT IGNORE INTO expenses (category,amount,expense_date,description,status) VALUES (?,?,?,?,?)`,
        e,
      );
    }
    console.log("✅ Expenses seeded (12)");

    // ── INVENTORY ──────────────────────────────────────────────────
    const inventory = [
      ["Rice", "Food", 150, "kg", 50, "2025-12-31"],
      ["Dal", "Food", 80, "kg", 20, "2025-12-31"],
      ["Cooking Oil", "Food", 40, "Litre", 10, "2025-12-31"],
      ["School Notebooks", "Stationery", 200, "pieces", 50, "2026-06-30"],
      ["Pencils", "Stationery", 500, "pieces", 100, "2026-06-30"],
      ["School Bags", "Stationery", 25, "pieces", 10, "2026-12-31"],
      ["Paracetamol", "Medicine", 300, "tablets", 100, "2026-03-31"],
      ["Bandages", "Medicine", 50, "rolls", 20, "2026-06-30"],
      ["Antiseptic", "Medicine", 10, "bottles", 5, "2026-01-31"],
      ["Bed Sheets", "Bedding", 60, "pieces", 20, "2027-12-31"],
      ["Pillows", "Bedding", 35, "pieces", 10, "2027-12-31"],
      ["Blankets", "Bedding", 40, "pieces", 15, "2027-12-31"],
      ["Boys Uniform", "Clothing", 30, "sets", 10, "2026-12-31"],
      ["Girls Uniform", "Clothing", 28, "sets", 10, "2026-12-31"],
      ["Toothbrushes", "Hygiene", 80, "pieces", 30, "2026-06-30"],
      ["Soap", "Hygiene", 120, "bars", 50, "2026-03-31"],
    ];
    for (const i of inventory) {
      await conn.execute(
        `INSERT IGNORE INTO inventory (item_name,category,quantity,unit,minimum_quantity,expiry_date) VALUES (?,?,?,?,?,?)`,
        i,
      );
    }
    console.log("✅ Inventory seeded (16)");

    // ── EVENTS ────────────────────────────────────────────────────
    const events = [
      [
        "Republic Day Celebration",
        "Cultural",
        "2024-01-26",
        "2024-01-26",
        "Orphanage Grounds",
        "Flag hoisting and programs",
        "Completed",
      ],
      [
        "Annual Health Camp",
        "Health",
        "2024-01-10",
        "2024-01-10",
        "Medical Room",
        "Free health checkup",
        "Completed",
      ],
      [
        "Pongal Celebration",
        "Cultural",
        "2024-01-14",
        "2024-01-14",
        "Dining Hall",
        "Traditional Pongal festival",
        "Completed",
      ],
      [
        "Annual Sports Day",
        "Sports",
        "2024-03-15",
        "2024-03-15",
        "Orphanage Ground",
        "Athletics and prizes",
        "Completed",
      ],
      [
        "Independence Day",
        "Cultural",
        "2024-08-15",
        "2024-08-15",
        "Orphanage Grounds",
        "Patriotic programs",
        "Completed",
      ],
      [
        "Diwali Celebration",
        "Cultural",
        "2024-11-01",
        "2024-11-01",
        "Grounds",
        "Lights and sweets",
        "Completed",
      ],
      [
        "Christmas Party",
        "Cultural",
        "2025-12-25",
        "2025-12-25",
        "Orphanage Hall",
        "Gifts and carols",
        "Upcoming",
      ],
      [
        "Children Day 2025",
        "Cultural",
        "2025-11-14",
        "2025-11-14",
        "Orphanage Hall",
        "Fun activities",
        "Upcoming",
      ],
      [
        "Annual Sports Day 2025",
        "Sports",
        "2025-12-10",
        "2025-12-10",
        "Ground",
        "Sports meet",
        "Upcoming",
      ],
      [
        "Donor Appreciation Day",
        "Fundraising",
        "2026-02-14",
        "2026-02-14",
        "Hall",
        "Honoring donors",
        "Planned",
      ],
    ];
    for (const e of events) {
      await conn.execute(
        `INSERT IGNORE INTO events (title,event_type,start_date,end_date,location,description,status) VALUES (?,?,?,?,?,?,?)`,
        e,
      );
    }
    console.log("✅ Events seeded (10)");

    // ── MEDICAL RECORDS ───────────────────────────────────────────
    const [childRows] = await conn.execute("SELECT id FROM children LIMIT 20");
    for (let i = 0; i < Math.min(childRows.length, 20); i++) {
      await conn.execute(
        `INSERT IGNORE INTO medical_records (child_id,record_type,record_date,diagnosis,treatment,doctor_name,next_appointment) VALUES (?,?,?,?,?,?,?)`,
        [
          childRows[i].id,
          "Routine Checkup",
          `2025-0${(i % 9) + 1}-15`,
          "Good health",
          "Vitamins prescribed",
          "Dr. Ramesh Iyer",
          `2025-${String((i % 9) + 2).padStart(2, "0")}-15`,
        ],
      );
    }
    console.log("✅ Medical records seeded");

    // ── EDUCATION RECORDS ─────────────────────────────────────────
    const grades = [
      ["1st", "A+", 95],
      ["2nd", "A", 88],
      ["3rd", "B+", 78],
      ["4th", "B", 72],
      ["5th", "A", 85],
      ["6th", "A+", 92],
      ["7th", "B+", 76],
      ["8th", "A", 83],
    ];
    for (let i = 0; i < Math.min(childRows.length, 20); i++) {
      const g = grades[i % grades.length];
      await conn.execute(
        `INSERT IGNORE INTO education_records (child_id,academic_year,grade,school_name,percentage,grade_letter,remarks) VALUES (?,?,?,?,?,?,?)`,
        [
          childRows[i].id,
          "2024-2025",
          `${g[0]} Grade`,
          "Good Morning School",
          g[2],
          g[1],
          "Good progress",
        ],
      );
    }
    console.log("✅ Education records seeded");

    // ── ADOPTIONS ─────────────────────────────────────────────────
    if (childRows.length >= 2) {
      await conn.execute(
        `INSERT IGNORE INTO adoptions (child_id,adoptive_parent_name,contact_number,email,address,application_date,status,notes) VALUES (?,?,?,?,?,?,?,?)`,
        [
          childRows[0].id,
          "Mr. and Mrs. Suresh Nair",
          "9944332211",
          "suresh@email.com",
          "Chennai",
          "2025-06-10",
          "Approved",
          "Verification complete",
        ],
      );
      await conn.execute(
        `INSERT IGNORE INTO adoptions (child_id,adoptive_parent_name,contact_number,email,address,application_date,status,notes) VALUES (?,?,?,?,?,?,?,?)`,
        [
          childRows[1].id,
          "Mr. and Mrs. Prakash",
          "9944332212",
          "prakash@email.com",
          "Bangalore",
          "2025-07-22",
          "Pending",
          "Documents under review",
        ],
      );
    }
    console.log("✅ Adoptions seeded");

    // ── ACTIVITY LOGS ─────────────────────────────────────────────
    await conn.execute(`INSERT IGNORE INTO activity_logs (user_id,action,module,description,ip_address) VALUES
      (1,'LOGIN','Auth','Admin logged in','127.0.0.1'),
      (1,'CREATE','Children','Added children data','127.0.0.1'),
      (2,'LOGIN','Auth','Manager Priya logged in','127.0.0.1'),
      (3,'LOGIN','Auth','Staff Anitha logged in','127.0.0.1')`);
    console.log("✅ Activity logs seeded");

    console.log("\n🎉 DATABASE SEEDED SUCCESSFULLY!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 LOGIN CREDENTIALS:");
    console.log(
      "   admin@sunshinehome.org   / admin123   (Admin - Full Access)",
    );
    console.log("   priya@sunshinehome.org   / manager123 (Manager)");
    console.log("   anitha@sunshinehome.org  / staff123   (Staff)");
    console.log("   viewer@sunshinehome.org  / viewer123  (Viewer - Public)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (err) {
    console.error("\n❌ Error:", err.message);
    console.error(err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
