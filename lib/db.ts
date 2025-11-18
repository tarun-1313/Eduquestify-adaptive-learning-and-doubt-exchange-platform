import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

export function getDb(): mysql.Pool {
  if (!pool) {
    const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT } = process.env

    const host = MYSQL_HOST || 'localhost'
    const user = MYSQL_USER || 'eduquestify_user'
    const password = MYSQL_PASSWORD || 'Tarun@2005'
    const database = MYSQL_DATABASE || 'eduquestify'
    const port = MYSQL_PORT ? Number.parseInt(MYSQL_PORT, 10) : 3307

    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      connectionLimit: 10,
      waitForConnections: true,
    })
  }
  return pool as mysql.Pool
}
