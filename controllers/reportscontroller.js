import {client} from "../config/dbcon.js"
import { errorMessages } from "../config/errorMessages.js";

export const getShopReports = async (req, res) => {
  const { shop_id } = req.headers;
  const{ role,uuid,name}=req.body;

  // Validate role
  if (!role) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  try {
    let response;

    if (role === "superuser") {
      // Superuser can get all reports
      response = await client.query("SELECT * FROM reports where shop_id=$1 or target_id=$2",[shop_id,uuid]);
    } else if (role === "admin") {
      // Admin must provide shop_id
      if (!name || !uuid) {
        return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
      }

      response = await client.query("SELECT * FROM reports WHERE target_id = $1 or target_id=$2", [name,uuid]);
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    return res.status(200).json({
      message: "Successfully fetched the data",
      data: response.rows,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    // Optionally: await logger(null, shop_id, "Error fetching reports");

    return res.status(500).json({ message: "Server Error" });
  }
};
