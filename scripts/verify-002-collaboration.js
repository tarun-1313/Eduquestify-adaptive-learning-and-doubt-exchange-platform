import mysql from "mysql2/promise"

async function main() {
  const required = ["MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE"]
  const missing = required.filter((k) => !process.env[k])
  if (missing.length) {
    console.log("[v0] Missing env vars:", missing.join(", "))
    console.log("[v0] Please add them in Vars and re-run this script.")
    process.exit(1)
  }

  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT || 3306),
  })

  try {
    const tables = ["notes", "doubts", "doubt_messages", "question_bank"]
    console.log("[v0] Verifying tables:", tables.join(", "))
    const results = {}
    for (const t of tables) {
      const [rows] = await conn.query(
        "SELECT COUNT(*) as c FROM information_schema.tables WHERE table_schema = ? AND table_name = ?",
        [process.env.MYSQL_DATABASE, t],
      )
      results[t] = rows?.[0]?.c === 1 ? "present" : "missing"
    }
    console.log("[v0] Verification:", results)
    const missingAny = Object.values(results).some((v) => v === "missing")
    process.exitCode = missingAny ? 1 : 0
  } catch (err) {
    console.log("[v0] Error verifying tables:", err?.message || err)
    process.exitCode = 1
  } finally {
    await conn.end()
  }
}

main().catch((e) => {
  console.log("[v0] Fatal error:", e?.message || e)
  process.exit(1)
})
