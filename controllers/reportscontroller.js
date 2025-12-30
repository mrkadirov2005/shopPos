import {client} from "../config/dbcon.js"
import { errorMessages } from "../config/errorMessages.js";
import { logger } from "../middleware/Logger.js";
import { extractJWT } from "../middleware/extractToken.js";

export const getShopReports = async (req, res) => {
  const { shop_id } = req.headers;
  const{ role,uuid,name}=req.body;
  const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);

  // Validate role
  if (!role) {
    await logger(shop_id, user_id, "Get shop reports failed - missing role");
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  try {
    let response;

    if (role === "superuser") {
      // Superuser can get all reports
      response = await client.query("SELECT * FROM reports where shop_id=$1 or target_id=$2",[shop_id,uuid]);
      await logger(shop_id, user_id, `Fetched shop reports as superuser - count: ${response.rows.length}`);
    } else if (role === "admin") {
      // Admin must provide shop_id
      if (!name || !uuid) {
        await logger(shop_id, user_id, "Get shop reports failed - admin missing name or uuid");
        return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
      }

      response = await client.query("SELECT * FROM reports WHERE target_id = $1 or target_id=$2", [name,uuid]);
      await logger(shop_id, user_id, `Fetched shop reports as admin - count: ${response.rows.length}`);
    } else {
      await logger(shop_id, user_id, `Get shop reports failed - unauthorized role: ${role}`);
      return res.status(403).json({ message: "Unauthorized role" });
    }

    return res.status(200).json({
      message: "Successfully fetched the data",
      data: response.rows,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    await logger(shop_id, user_id, `Get shop reports failed - error: ${error.message}`);

    return res.status(500).json({ message: "Server Error" });
  }
};
