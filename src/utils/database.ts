import { Pool } from 'pg';

let conn: Pool | undefined;

const getConnection = (): Pool => {
  if (!conn) {
    conn = new Pool({
      user: 'postgres',
      password: '12345678',
      host: 'localhost',
      port: 5432,
      database: 'inventorydb',
    });
  }
  return conn;
};

export { getConnection };
