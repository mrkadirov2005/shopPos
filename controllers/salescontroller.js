import { client } from "../config/dbcon.js";
import { v4 as uuidv4 } from "uuid";
import { errorMessages } from "../config/errorMessages.js";
import { logger } from "../middleware/Logger.js";      // import your logger
import { extractJWT } from "../middleware/extractToken.js"; // to get user/shop from token

export const getSales = async (req, res) => {
  const target_id = extractJWT(req.headers["authorization"]);
  const user_id = req.headers["uuid"] || null;
  
  try {
    const result = await client.query("SELECT * FROM sales");
    await logger(target_id, user_id, "Fetched all sales");
    return res.json(result.rows);
  } catch (err) {
    console.error("Query error:", err);
    await logger(target_id, user_id, "Failed to fetch sales: " + err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createNewSale = async (req, res) => {
  const { sale, products, shop_id, payment_method } = req.body;
  const bodyBranch = req.body.branch;

  const target_id = extractJWT(req.headers["authorization"]);
  const user_id = req.headers["uuid"] || null;

  if (!req.body) {
    await logger(target_id, user_id, "Create sale failed - missing request body");
    return res.status(400).send({ message: errorMessages.MISSING_FIELDS });
  }

  try {
    if (!sale || !products || !payment_method) {
      await logger(target_id, user_id, "Create sale failed - missing sale, products or payment method");
      return res.status(400).send({ message: errorMessages.MISSING_FIELDS });
    }

    if (!Array.isArray(products) || products.length === 0) {
      await logger(target_id, user_id, "Create sale failed - products not a non-empty array");
      return res.status(400).send({ message: "Products must be a non-empty array" });
    }

    const sales_id = String(uuidv4());

    const {
      admin_number,
      admin_name,
      total_price,
      total_net_price,
      profit,
      sale_time = null,
      sale_day = null,
      sales_month = null,
      sales_year = null,
      branch: saleBranch,
      shop_id: saleShopId = null,
    } = sale;

    const finalBranch = saleBranch || bodyBranch || null;
    const targetShopId = saleShopId || shop_id || null;

    await client.query("BEGIN");

    // ---- Check & update stock atomically ----
    for (const [index, product] of products.entries()) {
      const {
        productid,
        product_name,
        sell_quantity,
        amount,
      } = product;

      const quantity = sell_quantity ?? amount;

      if (!productid || !quantity) {
        await client.query("ROLLBACK");
        return res.status(400).send({
          message: `Invalid product data at index ${index}`,
        });
      }

      const update = await client.query(
        `
        UPDATE product
        SET availability = availability - $1
        WHERE id = $2 AND availability >= $1
        RETURNING availability
        `,
        [quantity, productid]
      );

      if (update.rowCount === 0) {
        await client.query("ROLLBACK");
        await logger(
          targetShopId,
          user_id,
          `Insufficient stock for product '${product_name}'`
        );
        return res.status(400).send({
          message: `Not enough stock for product '${product_name}'`,
        });
      }
    }

    // ---- Insert sale ----
    await client.query(
      `
      INSERT INTO sales
      (sale_id, admin_number, admin_name, total_price, total_net_price, profit,
       sale_time, sale_day, sales_month, sales_year, branch, shop_id, payment_method)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      `,
      [
        sales_id,
        admin_number,
        admin_name,
        total_price,
        total_net_price,
        profit,
        sale_time,
        sale_day,
        sales_month,
        sales_year,
        finalBranch,
        targetShopId,
        payment_method,
      ]
    );

    // ---- Insert sold products ----
    for (const product of products) {
      const {
        product_name,
        net_price,
        sell_price,
        productid,
        shop_id: prodShopId,
        sell_quantity,
        amount,
      } = product;

      const quantity = sell_quantity ?? amount;
      const productShopId = prodShopId || targetShopId;

      await client.query(
        `
        INSERT INTO soldproduct
        (product_name, amount, net_price, sell_price, productid, salesid, shop_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        `,
        [
          product_name,
          quantity,
          net_price,
          sell_price,
          productid,
          sales_id,
          productShopId,
        ]
      );
    }

    await client.query("COMMIT");

    await logger(
      targetShopId,
      user_id,
      `Sale created successfully with sales_id: ${sales_id}`
    );

    return res.status(201).send({
      message: "Sale created successfully",
      sales_id,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error creating sale:", error);
    await logger(shop_id, user_id, "Error creating sale: " + error.message);

    return res.status(500).send({
      message: errorMessages.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};



export const getSaleById = async (req, res) => {
  const sale_id = req.headers["sale_id"];
  const target_id = extractJWT(req.headers["authorization"]);
  const user_id = req.headers["uuid"] || null;

  try {
    const saleResult = await client.query("SELECT * FROM sales WHERE sale_id = $1", [sale_id]);

    if (saleResult.rows.length === 0) {
      await logger(target_id, user_id, `Sale not found: ${sale_id}`);
      return res.status(404).send({ message: "Sale not found" });
    }

    const productsResult = await client.query("SELECT * FROM soldproduct WHERE salesid = $1", [sale_id]);

    await logger(target_id, user_id, `Fetched sale by ID: ${sale_id}`);

    return res.status(200).send({
      sale: saleResult.rows[0],
      products: productsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching sale by ID:", error);
    await logger(target_id, user_id, "Error fetching sale by ID: " + error.message);
    return res.status(500).send({ message: errorMessages.INTERNAL_SERVER_ERROR });
  }
};

export const getAllSales = async (req, res) => {
  const target_id = extractJWT(req.headers["authorization"]);
  const {shop_id}=req.body;
  if(!shop_id){
    return res.status(400).json({message:"Error occured",data:[]})
  }

  try {
    const result = await client.query("SELECT * FROM sales where shop_id=$1",[shop_id]);
    await logger(target_id, target_id, "Fetched all sales");
    return res.status(200).send({message:"Fetched successfully", data: result.rows });
  } catch (error) {
    console.error("Error fetching all sales:", error);
    await logger(target_id, target_id, "Error fetching all sales: " + error.message);
    return res.status(500).send({ message: errorMessages.INTERNAL_SERVER_ERROR });
  }
};


export const getAdminSales = async (req, res) => {
  try {
    const { shop_id, admin_name } = req.body;

    // 1️⃣ Validate input
    if (!shop_id || !admin_name) {
      return res.status(400).json({
        success: false,
        message: "shop_id and admin_name are required",
      });
    }

    // 2️⃣ Query database
    const query = `
      SELECT *
      FROM sales
      WHERE admin_name = $1
        AND shop_id = $2
    `;

    const values = [admin_name, shop_id];
    const result = await client.query(query, values);

    // 3️⃣ No data found
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No sales found for this admin in this shop",
        data: [],
      });
    }

    // 4️⃣ Success
    return res.status(200).json({
      success: true,
      message: "Sales fetched successfully",
      count: result.rowCount,
      data: result.rows,
    });

  } catch (error) {
    console.error("getAdminSales error:", error);

    // 5️⃣ Server error
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
