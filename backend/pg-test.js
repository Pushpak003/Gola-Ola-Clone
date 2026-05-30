import "dotenv/config";
import pg from "pg";

const { Client } = pg;

console.log("URL exists:", !!process.env.DATABASE_URL);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  await client.connect();
  console.log("CONNECTED");

  const result = await client.query("SELECT NOW()");
  console.log(result.rows);

  await client.end();
} catch (err) {
  console.error(err);
}