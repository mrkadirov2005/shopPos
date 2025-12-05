import pkg from "pg";
const { Client } = pkg;

export const client = new Client({
  user: "muzaffar",
  host: "localhost",
  database: "mydatabase",
  password: "12345678",
  port: 5432,
});

export async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");
  } catch (err) {
    console.error("Database connection error:", err);
  }
}
