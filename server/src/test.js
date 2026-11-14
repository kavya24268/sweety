const pool = require("./config/db");

const runTests = async () => {
  try {
    console.log("Running Sweety database tests...\n");

    const usersTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);

    const readingsTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'readings'
      );
    `);

    if (!usersTable.rows[0].exists) {
      throw new Error("users table does not exist");
    }

    console.log("✓ users table exists");

    if (!readingsTable.rows[0].exists) {
      throw new Error("readings table does not exist");
    }

    console.log("✓ readings table exists");

    const userCount = await pool.query(
      "SELECT COUNT(*) FROM users"
    );

    const readingCount = await pool.query(
      "SELECT COUNT(*) FROM readings"
    );

    console.log(
      `✓ Users in database: ${userCount.rows[0].count}`
    );

    console.log(
      `✓ Readings in database: ${readingCount.rows[0].count}`
    );

    console.log("\nAll database tests passed.");
  } catch (error) {
    console.error("\nTest failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

runTests();