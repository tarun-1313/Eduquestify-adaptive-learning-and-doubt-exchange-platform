#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'

async function readSql(filePath) {
  const sql = await fs.readFile(filePath, 'utf8')
  return sql
}

// Naive splitter: OK for simple DDL without procedures/triggers
function splitStatements(sql) {
  // Remove BOM if present
  const clean = sql.replace(/^\uFEFF/, '')
  // Split on semicolons that are followed by end-of-line or EOF
  const parts = clean
    .split(/;\s*(?=\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('--') && !s.startsWith('#'))
  return parts
}

function isBenignDuplicateError(err) {
  // MySQL duplicate errors to ignore for idempotency
  const safeCodes = new Set([
    'ER_TABLE_EXISTS_ERROR', // 1050
    'ER_DUP_FIELDNAME', // 1060
    'ER_DUP_KEYNAME', // 1061
    'ER_CANT_DROP_FIELD_OR_KEY', // 1091 (dropping non-existent)
    'ER_DUP_INDEX', // alias in some connectors
  ])
  const safeErrnos = new Set([1050, 1060, 1061, 1091])
  return safeCodes.has(err.code) || safeErrnos.has(err.errno)
}

async function executeSqlFile(connection, filePath) {
  console.log(`\nRunning: ${filePath}`)
  const sql = await readSql(filePath)
  const statements = splitStatements(sql)
  for (const [i, stmt] of statements.entries()) {
    try {
      await connection.query(stmt)
    } catch (err) {
      if (isBenignDuplicateError(err)) {
        console.warn(`  [skip duplicate] stmt ${i + 1}: ${err.code || err.errno}`)
        continue
      }
      err.message = `In ${path.basename(filePath)} (stmt ${i + 1}): ${err.message}`
      throw err
    }
  }
  console.log(`Completed: ${path.basename(filePath)}`)
}

async function run() {
  const {
    MYSQL_HOST = 'localhost',
    MYSQL_PORT = '3307',
    MYSQL_USER = 'eduquestify_user',
    MYSQL_PASSWORD = 'Tarun@2005',
    MYSQL_DATABASE = 'eduquestify',
  } = process.env

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  const sqlDir = path.resolve(__dirname, 'sql')
  const files = [
    path.join(sqlDir, '001_init.sql'),
    path.join(sqlDir, '002_collaboration.sql'),
    path.join(sqlDir, '003_quiz_tables.sql')
  ]

  console.log('Connecting to MySQL...')
  const connection = await mysql.createConnection({
    host: MYSQL_HOST,
    port: Number.parseInt(MYSQL_PORT, 10),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    multipleStatements: true,
  })

  try {
    for (const file of files) {
      await executeSqlFile(connection, file)
    }
    console.log('\nAll migrations executed successfully.')
  } catch (err) {
    console.error('Error executing SQL:', err.message)
    console.error(err)
    process.exitCode = 1
  } finally {
    await connection.end()
  }
}

run().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
