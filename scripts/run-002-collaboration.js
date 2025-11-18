import { readFile } from "node:fs/promises"
import mysql from "mysql2/promise"

async function main() {
  const required = ["MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE"]
  const missing = required.filter((k) => !process.env[k])
  if (missing.length) {
    console.log("[v0] Missing env vars:", missing.join(", "))
    console.log("[v0] Please add them in Vars and re-run this script.")
    process.exit(1)
  }

  const SQL_PATH = "scripts/sql/002_collaboration.sql"
  console.log("[v0] Reading SQL from:", SQL_PATH)
  const sql = await readFile(SQL_PATH, "utf-8")

  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT || 3306),
    multipleStatements: true,
  })

  try {
    console.log("[v0] Applying migration 002_collaboration.sql ...")
    const start = Date.now()
    await conn.query(sql)
    const dur = Date.now() - start
    console.log("[v0] Migration applied successfully in", dur, "ms")
  } catch (err) {
    console.log("[v0] Error applying migration:", err?.message || err)
    process.exitCode = 1
  } finally {
    await conn.end()
  }
}

main().catch((e) => {
  console.log("[v0] Fatal error:", e?.message || e)
  process.exit(1)
})
