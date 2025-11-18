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

async function createUserStats() {
  try {
    const db = getDb();

    // Get all users who don't have stats
    const [users] = await db.query(`
      SELECT id FROM users u WHERE NOT EXISTS (SELECT 1 FROM user_stats s WHERE s.user_id = u.id)
    `);

    console.log(`Found ${users.length} users without stats`);

    if (users.length > 0) {
      // Create user_stats records for users who don't have them
      const insertPromises = users.map(user =>
        db.query('INSERT INTO user_stats (user_id, xp, coins, streak) VALUES (?, 0, 0, 0)', [user.id])
      );

      await Promise.all(insertPromises);
      console.log(`Created ${users.length} user stats records`);
    } else {
      console.log('All users already have stats records');
    }

    // Verify the fix
    const [userData] = await db.query(`
      SELECT u.id, u.email, u.name, u.role, s.xp, s.coins, s.streak
      FROM users u JOIN user_stats s ON s.user_id = u.id WHERE u.id = 1
    `);
    console.log('User 1 data after fix:', JSON.stringify(userData, null, 2));

    await db.end();
  } catch (err) {
    console.error('Database error:', err.message);
    console.error('Full error:', err);
  }
}

createUserStats();
