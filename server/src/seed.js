const bcrypt = require("bcrypt");
const pool = require("./config/db");

const seedDatabase = async () => {
  try {
    const demoEmail = "demo@sweety.com";
    const demoPassword = "SweetyDemo123!";
    const passwordHash = await bcrypt.hash(demoPassword, 10);

    const userResult = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash
       RETURNING id, name, email`,
      ["Sweety Demo User", demoEmail, passwordHash]
    );

    const user = userResult.rows[0];

    await pool.query(
      `DELETE FROM readings
       WHERE user_id = $1`,
      [user.id]
    );

    await pool.query(
      `INSERT INTO readings
       (user_id, reading_date, slot, glucose_value)
       VALUES
       ($1, CURRENT_DATE - INTERVAL '5 days', 'Morning', 110),
       ($1, CURRENT_DATE - INTERVAL '5 days', 'After breakfast', 145),
       ($1, CURRENT_DATE - INTERVAL '5 days', 'After lunch', 180),
       ($1, CURRENT_DATE - INTERVAL '5 days', 'After dinner', 155)`,
      [user.id]
    );

    console.log("");
    console.log("Seed completed successfully.");
    console.log("");
    console.log("Demo user:");
    console.log(`Email: ${demoEmail}`);
    console.log(`Password: ${demoPassword}`);
    console.log("");
    console.log("4 sample glucose readings were created.");
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

seedDatabase();