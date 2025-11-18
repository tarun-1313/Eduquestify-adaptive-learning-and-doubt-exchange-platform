import mysql from 'mysql2/promise';

async function checkPermissions() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'eduquestify_user',
    password: 'Tarun@2005',
    database: 'mysql',
    port: 3307
  });

  try {
    // Check user permissions
    const [grants] = await connection.execute(
      "SHOW GRANTS FOR 'eduquestify_user'@'%'"
    );
    
    console.log('\n=== DATABASE USER PERMISSIONS ===');
    grants.forEach(grant => console.log(grant[Object.keys(grant)[0]]));
    
    // Check if user has INSERT permission on eduquestify.quiz_attempts
    const [tablePriv] = await connection.execute(
      `SELECT * FROM information_schema.table_privileges 
       WHERE grantee LIKE '%eduquestify_user%' 
       AND table_name = 'quiz_attempts'`
    );
    
    console.log('\n=== QUIZ_ATTEMPTS TABLE PERMISSIONS ===');
    console.table(tablePriv);
    
  } catch (error) {
    console.error('Error checking permissions:', error);
  } finally {
    await connection.end();
  }
}

checkPermissions().catch(console.error);
