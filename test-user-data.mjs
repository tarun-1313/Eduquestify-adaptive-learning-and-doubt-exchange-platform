import mysql from "mysql2/promise";

let pool = null;

function getDb() {
  if (!pool) {
    const host = 'localhost';
    const user = 'eduquestify_user';
    const password = 'Tarun@2005';
    const database = 'eduquestify';
    const port = 3307;

    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      connectionLimit: 10,
      waitForConnections: true,
    });
  }
  return pool;
}

async function testUserData() {
  try {
    const db = getDb();

    // Check if user_stats table exists and has data
    const [statsCount] = await db.query('SELECT COUNT(*) as count FROM user_stats');
    console.log('User stats count:', statsCount[0].count);

    // Check specific user data
    const [userData] = await db.query(`
      SELECT u.id, u.email, u.phone, u.name, u.role, s.xp, s.coins, s.streak
      FROM users u
      LEFT JOIN user_stats s ON s.user_id = u.id
      WHERE u.id = 1
    `);
    console.log('User 1 data:', JSON.stringify(userData, null, 2));

    // Test the exact query from the API
    const [profile] = await db.query(`
      SELECT u.id, u.email, u.phone, u.name, u.role, s.xp, s.coins, s.streak
      FROM users u JOIN user_stats s ON s.user_id = u.id WHERE u.id = ? LIMIT 1
    `, [1]);
    console.log('Profile query result:', JSON.stringify(profile, null, 2));

    await db.end();
  } catch (err) {
    console.error('Database error:', err.message);
    console.error('Full error:', err);
  }
}

testUserData();
