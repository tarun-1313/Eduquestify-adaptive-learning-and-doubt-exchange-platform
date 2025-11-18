import { Pool, PoolConnection, RowDataPacket, ResultSetHeader, OkPacket } from 'mysql2/promise';

export function getDb(): Pool;

export function query<T = RowDataPacket[]>(
  sql: string,
  params?: any[]
): Promise<T>;

export function execute<T = ResultSetHeader | OkPacket>(
  sql: string,
  params?: any[]
): Promise<T>;

export function getConnection(): Promise<PoolConnection>;

export interface User extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  name: string | null;
  created_at: Date;
  updated_at: Date;
}

export type QueryResult = RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader;