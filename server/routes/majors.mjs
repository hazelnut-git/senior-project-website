import express from 'express';
import { supabase } from '../db/supabaseClient.mjs';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('Majors').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }
});

export default router;
