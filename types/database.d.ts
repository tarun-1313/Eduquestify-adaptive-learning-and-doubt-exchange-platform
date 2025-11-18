import { Pool, RowDataPacket } from 'mysql2/promise';

export interface User extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  name: string | null;
  created_at: Date;
  updated_at: Date;
}

declare global {
  // Keep the global declaration for backward compatibility
  interface User extends RowDataPacket {
    id: number;
    email: string;
    password: string;
    name: string | null;
    created_at: Date;
    updated_at: Date;
  }
}
