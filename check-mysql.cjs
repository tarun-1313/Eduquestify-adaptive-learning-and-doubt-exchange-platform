const { getDb } = require('./lib/db.ts');

async function checkFlashcardTables() {
  const db = getDb();
  try {
    console.log('Checking for flashcard tables...');
    
    // Check if flashcard tables exist
    const [tables] = await db.query("SHOW TABLES LIKE 'flashcard_%'");
    console.log('Flashcard tables found:', tables);
    
    if (tables.length > 0) {
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        console.log(`\nStructure of ${tableName}:`);
        const [columns] = await db.query(`DESCRIBE ${tableName}`);
        console.table(columns);
      }
    } else {
      console.log('No flashcard tables found in MySQL');
    }
    
  } catch (error) {
    console.error('Error checking tables:', error.message);
  } finally {
    await db.end();
  }
}

checkFlashcardTables();