import dotenv from "dotenv";
import { clearMemoryStore } from "../src/store/memoryStore.js";

dotenv.config({ path: ".env.test" });

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
process.env.USE_IN_MEMORY_DB = "true";

beforeAll(() => {
	clearMemoryStore();
});

afterAll(() => {
	clearMemoryStore();
});