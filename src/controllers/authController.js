import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  createUserInMemory,
  findUserByEmailInMemory
} from "../store/memoryStore.js";

const useInMemoryStore = process.env.NODE_ENV === "test" || process.env.USE_IN_MEMORY_DB === "true";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = useInMemoryStore
      ? findUserByEmailInMemory(normalizedEmail)
      : await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = useInMemoryStore
      ? createUserInMemory({ name, email: normalizedEmail, password: hashedPassword })
      : await User.create({ name, email: normalizedEmail, password: hashedPassword });

    if (useInMemoryStore) {
      const { password: _password, ...safeUser } = user;
      return res.status(201).json(safeUser);
    }

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.toLowerCase();
    const user = useInMemoryStore
      ? findUserByEmailInMemory(normalizedEmail)
      : await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login" });
  }
};
