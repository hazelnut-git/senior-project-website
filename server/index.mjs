import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import coursesRouter from './routes/courses.mjs';
import departmentsRouter from './routes/departments.mjs';
import majorsRouter from './routes/majors.mjs';
import tagsRouter from './routes/tags.mjs';
import metaRouter from './routes/meta.mjs';
import cpsRouter from './routes/cps.mjs';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/courses', coursesRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/majors', majorsRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/meta', metaRouter);
app.use('/api/cps', cpsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
