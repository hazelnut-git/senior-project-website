import express from 'express';
import { supabase } from '../db/supabaseClient.mjs';

const router = express.Router();

// GET /api/meta/tables - list all tables
router.get('/tables', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('pg_tables');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }
});

// GET /api/meta/columns/:table - list columns for a table
router.get('/columns/:table', async (req, res) => {
  try {
    const table = req.params.table;
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', table);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }
});

export default router;
