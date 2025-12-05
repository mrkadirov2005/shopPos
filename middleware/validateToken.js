import {client} from "../config/dbcon.js"
import { errorMessages } from "../config/errorMessages.js";
import jwt from "jsonwebtoken";
import {JWTKEYS} from "../config/JWT_keys.js"
export const validateToken = (req, res, next) => {
  console.log("Headers:", req.headers);
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.log("No auth header");
    return res.status(401).json({ message: errorMessages.NO_TOKEN });
  }

  const token = authHeader;
  console.log("Token:", token);

  jwt.verify(token, JWTKEYS.jwt_key, (err, decoded) => {
    if (err) {
      console.log("JWT verify error:", err);
      return res.status(401).json({ message: errorMessages.NO_TOKEN });
    }
    req.user = decoded;
    console.log("Token verified, user:", decoded);
    next();
  });
};
