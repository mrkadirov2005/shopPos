// implement the sales logic here
import {client} from "../config/dbcon.js"
import { v4 as uuidv4 } from 'uuid';
import { errorMessages } from "../config/errorMessages.js";
export const getSales = async(req, res) => {

    try {
        const result = await client.query("SELECT * FROM sales");
        return res.json(result.rows);
    } catch (err) {
        console.error("Query error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }

}

export const createNewSale = async (req, res) => {
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  if (!req.body) {
    console.log("Missing request body");
    return res.status(400).send({ message: errorMessages.MISSING_FIELDS });
  }

  const { sale, products, shop_id } = req.body;

  try {
    if (!sale || !products) {
      console.log("Missing sale or products in request body");
      return res.status(400).send({ message: errorMessages.MISSING_FIELDS });
    }

    if (!Array.isArray(products) || products.length === 0) {
      console.log("Products is not a non-empty array");
      return res.status(400).send({ message: "Products must be a non-empty array" });
    }

    const sales_id = String(uuidv4());
    console.log("Generated sales_id:", sales_id);

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
      branch = null,
      shop_id: saleShopId = null
    } = sale;

    console.log("Sale details:", {
      admin_number,
      admin_name,
      total_price,
      total_net_price,
      profit,
      sale_time,
      sale_day,
      sales_month,
      sales_year,
      branch,
      saleShopId
    });

    const targetShopId = saleShopId || shop_id || null;
    console.log("Determined targetShopId:", targetShopId);

    // FIRST LOOP - Check availability for all products
    for (const [index, product] of products.entries()) {
      const { productid, sell_quantity, product_name } = product;

      console.log(`Checking product[${index}] availability:`, product);

      if (!productid) {
        console.log(`Product ID missing in product at index ${index}`);
        return res.status(400).send({ message: "Product ID is missing in product" });
      }

      const check = await client.query(
        `SELECT availability FROM product WHERE id=$1`,
        [productid]
      );

      if (check.rowCount === 0) {
        console.log(`Product with id ${productid} not found`);
        return res.status(400).send({
          message: `Product with id ${productid} not found`
        });
      }

      const available = Number(check.rows[0].availability);
      console.log(`Product availability for id ${productid}: ${available}`);

      if (available < sell_quantity) {
        console.log(`Not enough stock for product '${product_name}'. Available: ${available}, Requested: ${sell_quantity}`);
        return res.status(400).send({
          message: `Not enough stock for product '${product_name}'. Available: ${available}, Requested: ${sell_quantity}`
        });
      }
    }

    // INSERT SALE
    console.log("Inserting into sales table with values:", [
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
      branch,
      targetShopId
    ]);

    await client.query(
      `INSERT INTO sales 
        (sale_id, admin_number, admin_name, total_price, total_net_price, profit, sale_time, sale_day, sales_month, sales_year, branch, shop_id) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
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
        branch,
        targetShopId
      ]
    );

    // SECOND LOOP — INSERT SOLDPRODUCT + SUBTRACT STOCK
    for (const [index, product] of products.entries()) {
      const {
        product_name,
        amount,
        net_price,
        sell_price,
        productid,
        shop_id: prodShopId,
        sell_quantity
      } = product;

      const productShopId = prodShopId || targetShopId;

      console.log(`Inserting soldproduct[${index}] with values:`, [
        product_name,
        amount,
        net_price,
        sell_price,
        productid,
        sales_id,
        productShopId
      ]);

      await client.query(
        `INSERT INTO soldproduct 
         (product_name, amount, net_price, sell_price, productid, salesid, shop_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          product_name,
          amount,
          net_price,
          sell_price,
          productid,
          sales_id,
          productShopId
        ]
      );

      console.log(`Subtracting stock for productid ${productid}, quantity ${sell_quantity}`);
      await client.query(
        `UPDATE product 
         SET availability = availability - $1 
         WHERE id = $2`,
        [sell_quantity, productid]
      );
    }

    console.log("Sale created successfully with sales_id:", sales_id);
    return res.status(201).send({
      message: "Sale created successfully",
      sales_id
    });

  } catch (error) {
    console.error("Error creating sale:", error);
    return res.status(500).send({
      message: errorMessages.INTERNAL_SERVER_ERROR,
      error: error.message
    });
  }
};


export const getSaleById = async (req, res) => {
  const sale_id = req.headers["sale_id"]

  try {
    // Fix column name to sales_id
    const saleResult = await client.query(
      "SELECT * FROM sales WHERE sale_id = $1",
      [sale_id]
    );

    if (saleResult.rows.length === 0) {
      return res.status(404).send({ message: "Sale not found" });
    }

    // Adjust table name if needed: soldproduct or sale_products
    const productsResult = await client.query(
      "SELECT * FROM soldproduct WHERE salesid = $1",
      [sale_id]
    );

    return res.status(200).send({
      sale: saleResult.rows[0],
      products: productsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching sale by ID:", error);
    return res.status(500).send({ message: errorMessages.INTERNAL_SERVER_ERROR });
  }
};


export const getAllSales = async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM sales");
        return res.status(200).send({ sales: result.rows });
    }
    catch (error) {
        console.error("Error fetching all sales:", error);
        return res.status(500).send({ message: errorMessages.INTERNAL_SERVER_ERROR });
    }
}