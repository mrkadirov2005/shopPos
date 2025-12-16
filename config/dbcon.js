import pkg from "pg";
const { Client } = pkg;

export const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "12345678",
  port: 5432,
});

export async function connectDB() {
  try {
    await client.connect();
  } catch (err) {
    console.error("Database connection error:", err);
  }
}
