import { Pool } from "pg";
import chalk from "chalk";

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  user: process.env.PGUSER,
  database:
    process.env.NODE_ENV === "test"
      ? process.env.TEST_DATABASE
      : process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  ssl: process.env.NODE_ENV === "production" ? true : false
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err); // your callback here
  process.exit(-1);
});

export default pool;
