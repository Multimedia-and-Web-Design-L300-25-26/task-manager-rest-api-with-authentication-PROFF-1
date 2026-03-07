import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
	res.render("index", { pageTitle: "Task Manager" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use((req, res) => {
	if (req.originalUrl.startsWith("/api/")) {
		return res.status(404).json({ message: "Route not found" });
	}

	return res.status(404).render("404", { pageTitle: "Page Not Found" });
});

export default app;