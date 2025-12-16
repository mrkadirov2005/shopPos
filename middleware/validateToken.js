import {client} from "../config/dbcon.js"
import { errorMessages } from "../config/errorMessages.js";
import jwt from "jsonwebtoken";
import {JWTKEYS} from "../config/JWT_keys.js"
export const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: errorMessages.NO_TOKEN });
  }

  const token = authHeader;

  jwt.verify(token, JWTKEYS.jwt_key, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: errorMessages.NO_TOKEN });
    }
    req.user = decoded;
    next();
  });
};
