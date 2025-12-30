import {client} from "./../config/dbcon.js";
import { logger } from "../middleware/Logger.js";
import { extractJWT } from "../middleware/extractToken.js";

export const MainFinance = async (req, res) => {
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    try {
        const response = await client.query("SELECT * FROM sales");

        if (response.rowCount === 0) {
            await logger(shop_id, user_id, "Main finance statistics - no data found");
            return res.status(200).json({
                message: "No data found",
                data: []
            });
        }

        const sendable_data = {
            sale: 0,
            net_sale: 0,
            profit: 0,
            today: { sale: 0, net_sale: 0, profit: 0 }
        };

        // Loop properly
        for (let product of response.rows) {
            sendable_data.sale += Number(product.total_price);
            sendable_data.net_sale += Number(product.total_net_price);
            sendable_data.profit += Number(product.profit);
        }

        // Get today's data
        const today = new Date();
        const day = today.getDate();       // FIXED: getDate(), not getDay()
        const month = today.getMonth() + 1; // FIXED: JS month is 0–11, DB likely 1–12

        const todayRes = await client.query(
            "SELECT * FROM sales WHERE sale_day = $1 AND sales_month = $2",
            [day, month]
        );
        // Calculate today totals
        for (let product of todayRes.rows) {
            sendable_data.today.sale += Number(product.total_price);
            sendable_data.today.net_sale += Number(product.total_net_price);
            sendable_data.today.profit += Number(product.profit);
        }

        await logger(shop_id, user_id, "Fetched main finance statistics");

        return res.status(200).json({
            message: "Fetched successfully",
            data: sendable_data
        });

    } catch (err) {
        console.error(err);
        await logger(shop_id, user_id, `Main finance statistics failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server error" });
    }
};

export const highStockProducts = async (req, res) => {
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    try {
        const response = await client.query(
            "SELECT * FROM product ORDER BY (total - availability) desc LIMIT $1",
            [5]
        );

        if (response.rowCount === 0) {
            await logger(shop_id, user_id, "High stock products - no products found");
            return res.status(200).json({
                message: "No products found",
                data: []
            });
        }

        await logger(shop_id, user_id, "Fetched high stock products");

        return res.status(200).json({
            message: "Successfully fetched",
            data: response.rows
        });

    } catch (err) {
        console.error(err);
        await logger(shop_id, user_id, `High stock products failed - error: ${err.message}`);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}



export const lowStockProducts = async (req, res) => {
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    try {
        const response = await client.query(
            "SELECT * FROM product ORDER BY (total - availability) asc LIMIT $1",
            [5]
        );

        if (response.rowCount === 0) {
            await logger(shop_id, user_id, "Low stock products - no products found");
            return res.status(200).json({
                message: "No products found",
                data: []
            });
        }

        await logger(shop_id, user_id, "Fetched low stock products");

        return res.status(200).json({
            message: "Successfully fetched",
            data: response.rows
        });

    } catch (err) {
        console.error(err);
        await logger(shop_id, user_id, `Low stock products failed - error: ${err.message}`);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
}


export const getDayStatistics = async (req, res) => {
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    try {
    const day=req.headers["day"]
    const month=req.headers["month"]
    const year=req.headers["year"]



        if (day == null || month == null || year == null) {
            await logger(shop_id, user_id, "Get day statistics failed - missing day, month, or year");
            return res.status(400).json({
                message: "day, month, year are required"
            });
        }

        // Query specific day
        const response = await client.query(
            `SELECT * FROM sales 
             WHERE sale_day = $1 AND sales_month = $2 AND sales_year = $3`,
            [day, month, year]
        );

        const data = {
            sale: 0,
            net_sale: 0,
            profit: 0,
            count: response.rowCount,  // number of sales that day
            list: response.rows        // optional, remove if you don't want
        };

        for (let sale of response.rows) {
            data.sale += Number(sale.total_price);
            data.net_sale += Number(sale.total_net_price);
            data.profit += Number(sale.profit);
        }

        await logger(shop_id, user_id, `Fetched day statistics for ${year}-${month}-${day}`);

        return res.status(200).json({
            message: "Statistics fetched successfully",
            data
        });

    } catch (err) {
        console.error(err);
        await logger(shop_id, user_id, `Get day statistics failed - error: ${err.message}`);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};

export const getWeekStatistics = async (req, res) => {
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    try {
        const results = [];

        // Today
        const today = new Date();

        // Loop for last 7 days (including today)
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);

            const day = d.getDate();
            const month = d.getMonth() + 1; // JS months are 0–11
            const year = d.getFullYear();

            // Query DB for each day
            const response = await client.query(
                `SELECT total_price, total_net_price, profit 
                 FROM sales 
                 WHERE sale_day = $1 AND sales_month = $2 AND sales_year = $3`,
                [day, month, year]
            );

            let total_sale = 0;
            let net_sale = 0;
            let profit = 0;

            for (const sale of response.rows) {
                total_sale += Number(sale.total_price);
                net_sale += Number(sale.total_net_price);
                profit += Number(sale.profit);
            }

            results.push({
                day,
                month,
                year,
                total_sale,
                net_sale,
                profit
            });
        }

        await logger(shop_id, user_id, "Fetched week statistics (last 7 days)");

        return res.status(200).json({
            message: "Fetched last 7 days statistics successfully",
            data: results
        });

    } catch (err) {
        console.error(err);
        await logger(shop_id, user_id, `Get week statistics failed - error: ${err.message}`);
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};
