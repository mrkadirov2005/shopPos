import express from "express";
import { connectDB } from "./config/dbcon.js";
import cors from "cors"
import {client} from "./config/dbcon.js"

import superadminRoutes from "./routes/superadminroutes.js";
import adminroutes from "./routes/adminroutes.js";
import productRoutes from "./routes/products.js";
import brandRoutes from "./routes/brandroutes.js";
import categoryRoutes from "./routes/categoryroutes.js";
import PermissionRoutes from "./routes/permission.js";
import authRoutes from "./routes/authroutes.js";
import shopRoutes from "./routes/shoprooutes.js";
import saleRoutes from "./routes/salesroutes.js";
import { validateToken } from "./middleware/validateToken.js";
import statisticsRoutes from "./routes/statisticroutes.js";
import reportRoutes from "./routes/reportroutes.js";
import debtRoutes from "./routes/debtRoutes.js";
import backupRoutes from "./routes/backupRoutes.js";

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const PORT = 3000;
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));



app.get("/tables", async (req, res) => {
  try {
    const response = await client.query(`
      SELECT
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        ordinal_position
      FROM
        information_schema.columns
      WHERE
        table_schema = 'public'
      ORDER BY
        table_name,
        ordinal_position;
    `);

    // Group columns by table_name
    const tables = {};
    for (const row of response.rows) {
      if (!tables[row.table_name]) {
        tables[row.table_name] = [];
      }
      tables[row.table_name].push(row);
    }

    // Build HTML string
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tables and Columns</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; }
          h2 { background: #007acc; color: white; padding: 10px; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #eee; }
        </style>
      </head>
      <body>
        <h1>Database Tables and Their Columns</h1>
    `;

    for (const [tableName, columns] of Object.entries(tables)) {
      html += `<h2>Table: ${tableName}</h2>`;
      html += `
        <table>
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Data Type</th>
              <th>Nullable</th>
              <th>Default</th>
              <th>Max Length</th>
              <th>Precision</th>
              <th>Scale</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
      `;

      for (const col of columns) {
        html += `
          <tr>
            <td>${col.column_name}</td>
            <td>${col.data_type}</td>
            <td>${col.is_nullable}</td>
            <td>${col.column_default ?? ""}</td>
            <td>${col.character_maximum_length ?? ""}</td>
            <td>${col.numeric_precision ?? ""}</td>
            <td>${col.numeric_scale ?? ""}</td>
            <td>${col.ordinal_position}</td>
          </tr>
        `;
      }

      html += `</tbody></table>`;
    }

    html += `
      </body>
      </html>
    `;

    res.status(200).send(html);
  } catch (error) {
    console.error("Error fetching table columns:", error);
    res.status(500).send("Internal server error");
  }
});



app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

// Swagger definition & options
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "My Project API",
    version: "1.0.0",
    description: "API documentation for the project",
  },
  servers: [
    {
      url:  "https://foughten-geoffrey-unupbraidingly.ngrok-free.dev",
    },
  ],
  components: {
    securitySchemes: {
      tokenAuth: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
        description: "Enter your token directly (no 'Bearer ' prefix)",
      },
    },
  },
  security: [
    {
      tokenAuth: [],
    },
  ],
};


const options = {
  swaggerDefinition,
  apis: ["./routes/*.js", "./controllers/*.js"], // files containing annotations
};

const swaggerSpec = swaggerJsdoc(options);
app.use(cors());
// Serve Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Public routes (no token required)
// Swagger override for security on public routes is done inside auth route docs by adding 'security: []'
app.use("/auth", authRoutes);


// Token validation middleware (protect all routes below)
app.use(validateToken);

// Protected routes
app.use("/statistics", statisticsRoutes);
app.use("/superadmin", superadminRoutes);
app.use("/admin", adminroutes);
app.use("/product", productRoutes);
app.use("/brand", brandRoutes);
app.use("/category", categoryRoutes);
app.use("/permission", PermissionRoutes);
app.use("/shop", shopRoutes);
app.use("/sales", saleRoutes);
app.use("/report",reportRoutes);
app.use("/debts",debtRoutes);
app.use("/backup", backupRoutes)


// Start server after DB connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("Failed to connect to DB", err);
  }
};

startServer();