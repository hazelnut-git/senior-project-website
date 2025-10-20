// src/server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import coursesRouter from "./routes/courses.js";
import departmentsRouter from "./routes/departments.js";
import majorsRouter from "./routes/majors.js";
import tagsRouter from "./routes/tags.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// mount routes
app.use("/api/courses", coursesRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/majors", majorsRouter);
app.use("/api/tags", tagsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
