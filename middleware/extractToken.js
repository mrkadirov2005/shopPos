import jwt from "jsonwebtoken";
import { JWTKEYS } from "../config/JWT_keys.js";

export const extractJWT = (token) => {
  try {
    const decoded = jwt.verify(token, JWTKEYS.jwt_key);
    return decoded.name; // or whatever you want to extract
  } catch (err) {
    return 400; // or better: throw error or return null
  }
};
