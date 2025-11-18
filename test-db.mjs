import mysql from "mysql2/promise";

let pool = null;

function getDb() {
  if (!pool) {
    const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT } = process.env;

    const host = MYSQL_HOST || 'localhost';
    const user = MYSQL_USER || 'eduquestify_user';
    const password = MYSQL_PASSWORD || 'Tarun@2005';
    const database = MYSQL_DATABASE || 'eduquestify';
    const port = MYSQL_PORT ? Number.parseInt(MYSQL_PORT, 10) : 3307;

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

async function testDb() {
  try {
    const db = getDb();
    const [rows] = await db.query('SELECT COUNT(*) as count FROM users');
    console.log('Users in database:', rows[0].count);

    // Also check if we can query user data
    const [userRows] = await db.query('SELECT id, email, name, role FROM users LIMIT 5');
    console.log('Sample users:', JSON.stringify(userRows, null, 2));

    await db.end();
  } catch (err) {
    console.error('Database error:', err.message);
    console.error('Full error:', err);
  }
}

testDb();
