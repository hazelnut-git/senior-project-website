import express from 'express';
import { supabase } from '../db/supabaseClient.mjs';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('Courses').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    const { data, error } = await supabase.from('Courses').insert([payload]).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }
});

export default router;
