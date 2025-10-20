// src/server/routes/courses.js
import express from "express";
import { supabase } from "../db/supabaseClient.js";

const router = express.Router();

// GET /api/courses
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("Courses").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/courses
router.post("/", async (req, res) => {
  const { name, code, department_id } = req.body;
  const { data, error } = await supabase
    .from("Courses")
    .insert([{ name, code, department_id }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

export default router;
