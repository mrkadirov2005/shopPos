import { client } from "../config/dbcon.js";
import { v4 as uuidv4 } from "uuid";

export const logger = async (shop_id, user_id, message) => {
  // user_id is equal to target_id in db
  const uuid = uuidv4();
  const today = new Date();
  const day = today.getDate();        // use getDate() instead of getDay()
  const month = today.getMonth() + 1; // getMonth() is zero-based, add 1 for month number
  const year = today.getFullYear();

  const query = `
    INSERT INTO reports(uuid, shop_id, day, month, year, target_id, log)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

  const values = [uuid, shop_id, day, month, year, user_id, message];

  try {
    const response = await client.query(query, values);
    return response;
  } catch (error) {
    console.error("Error inserting into reports:", error);
    throw error;
  }
};
