import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { findUserByIdInMemory } from "../store/memoryStore.js";

const useInMemoryStore = process.env.NODE_ENV === "test" || process.env.USE_IN_MEMORY_DB === "true";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = useInMemoryStore
      ? findUserByIdInMemory(decoded.id)
      : await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;