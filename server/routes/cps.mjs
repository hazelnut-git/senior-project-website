import express from 'express';
import { supabase } from '../db/supabaseClient.mjs';

const router = express.Router();

// GET /api/cps/semesters - list all semesters
router.get('/semesters', async (req, res) => {
  const { data, error } = await supabase.from('Semesters').select('*');
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// GET /api/cps/courses - list all courses
router.get('/courses', async (req, res) => {
  const { data, error } = await supabase.from('Courses').select('*');
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// GET /api/cps/courses/department/:deptId - list courses for a department
router.get('/courses/department/:deptId', async (req, res) => {
  const deptId = req.params.deptId;
  try {
    const { data, error } = await supabase.from('Courses').select('*');
    if (error) return res.status(500).json({ error: error.message });
    const filtered = (data || []).filter(c => (c.department_ID || c.department_id || '').toString() === deptId || (c.department_ID || c.department_id || '').toString().toUpperCase() === deptId.toString().toUpperCase());
    return res.json(filtered);
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }
});

// GET /api/cps/tags - list all tags
router.get('/tags', async (req, res) => {
  const { data, error } = await supabase.from('Tags').select('*');
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// GET /api/cps/class_sections - list all class sections
router.get('/class_sections', async (req, res) => {
  const { data, error } = await supabase.from('Class_Sections').select('*');
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// GET /api/cps/class_times - list all class times
router.get('/class_times', async (req, res) => {
  const { data, error } = await supabase.from('Class_Times').select('*');
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// (debug endpoint removed)


// POST /api/cps/plan - create or update a CPS plan for a student
router.post('/plan', async (req, res) => {
  const { student_id, semester_id, course_ids } = req.body;
  if (!student_id || !semester_id || !Array.isArray(course_ids)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Remove existing plan for this student/semester
  const { error: delError } = await supabase
    .from('Class_Sections')
    .delete()
    .eq('student_id', student_id)
    .eq('semester_id', semester_id);
  if (delError) return res.status(500).json({ error: delError.message });
  // Insert new plan
  const inserts = course_ids.map(course_id => ({ student_id, semester_id, course_id }));
  const { data, error } = await supabase
    .from('Class_Sections')
    .insert(inserts)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// GET /api/cps/plan?student_id=...&semester_id=... - get CPS plan for a student/semester
router.get('/plan', async (req, res) => {
  const { student_id, semester_id } = req.query;
  if (!student_id || !semester_id) {
    return res.status(400).json({ error: 'Missing required query params' });
  }
  const { data, error } = await supabase
    .from('Class_Sections')
    .select('*')
    .eq('student_id', student_id)
    .eq('semester_id', semester_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});


router.post('/generate_plan', async (req, res) => {
  try {
    // Use provided major_id or default to CSCI department UUID -> department code
    const csciDeptId = 'af2416dc-c1a6-4078-860e-a9108846b3cd';
    const { major_id = csciDeptId, maxCreditsPerSemester = 15 } = req.body;
    if (!major_id) return res.status(400).json({ error: 'Missing major_id' });

  // If major_id looks like a UUID, resolve the department code (e.g., 'CSCI')
  let deptCode = major_id;
  const uuidLike = typeof major_id === 'string' && major_id.length === 36 && major_id.includes('-');
  if (uuidLike) {
    try {
      const { data: deptRow, error: deptErr } = await supabase
        .from('Departments')
        .select('department_ID')
        .eq('id', major_id)
        .single();
      if (deptErr) return res.status(500).json({ error: 'Departments lookup error' });
      deptCode = deptRow?.department_ID || major_id;
    } catch (err) {
      return res.status(500).json({ error: 'Departments lookup exception' });
    }
  }

  // Fetch all courses and filter in JS by department code to avoid column name casing problems
  let allCourses;
  try {
    const resp = await supabase.from('Courses').select('*');
    if (resp.error) return res.status(500).json({ error: 'All courses fetch error' });
    allCourses = resp.data;
  } catch (err) {
    return res.status(500).json({ error: 'All courses exception' });
  }
  // Fetch semesters table (optional) to annotate generated semesters
  let semesterRows = [];
  try {
    const sresp = await supabase.from('Semesters').select('*');
    if (!sresp.error && Array.isArray(sresp.data)) semesterRows = sresp.data;
  } catch (e) {
    // ignore semesters fetching errors; we'll synthesize year/season if needed
    semesterRows = [];
  }
  const majorCoursesRaw = (allCourses || []).filter(c => {
    const d = (c.department_ID || c.department_id || '').toString();
    return d === deptCode || d.toUpperCase() === deptCode.toString().toUpperCase();
  });

  // Normalize courses and prerequisites
  const majorCourses = (majorCoursesRaw || []).map(c => {
    // Some rows use different field names (Prerequisites vs prerequisites)
    const prereqField = c.Prerequisites ?? c.prerequisites ?? null;
    const courseCode = `${(c.department_ID || '').toString().trim()}${(c.course_id || '').toString().trim()}`;
    return {
      _raw: c,
      id: courseCode, // use code as id for prereq matching
      code: courseCode,
      name: c.title || c.name || c.course_name || '',
      credits: Number(c.credits) || 0,
      prerequisites: prereqField,
      department_ID: c.department_ID,
      course_id: c.course_id,
    };
  });

  // Build a master map of available course codes -> normalized code (e.g., 'CSCI101')
  const allCourseCodes = new Map();
  (allCourses || []).forEach(c => {
    const dep = (c.department_ID || c.department_id || '').toString().trim();
    const num = (c.course_id || c.course_number || c.course_id || '').toString().trim();
    if (dep && num) {
      const code = `${dep}${num}`;
      allCourseCodes.set(code.toUpperCase(), code);
      allCourseCodes.set(num, code); // also allow number-only lookup
    }
    if (c.title) allCourseCodes.set((c.title || '').toUpperCase(), c.title);
  });

  // Separate out final-semester courses (Prerequisites contains 'FINAL')
  const finalCourses = [];
  let remainingCourses = majorCourses.filter(c => {
    const prereqStr = (c.prerequisites || '').toString().toUpperCase();
    if (prereqStr.includes('FINAL')) {
      finalCourses.push(c);
      return false;
    }
    return true;
  });

  const plan = [];
  const completed = new Set(); // set of course codes completed (e.g., 'CSCI101')

  // helper to parse prereq string into array of codes
  const parsePrereqs = (pr) => {
    if (!pr) return [];
    if (Array.isArray(pr)) return pr.map(x => (''+x).trim()).filter(Boolean);
    // Split on commas, semicolons, 'or', '/', '|'
    return (''+pr)
      .replace(/\bor\b/ig, ',')
      .replace(/[\/|;]/g, ',')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  };

  // Enforce 8 semesters plan. Each semester must have at least minCreditsPerSemester (half-time)
  // and we attempt to reach preferredCreditsPerSemester (full-time) while not exceeding maxCreditsPerSemester.
  const semestersCount = 8;
  const preferredCreditsPerSemester = Number(req.body.preferredCreditsPerSemester ?? Math.min(maxCreditsPerSemester, 15));
  const minCreditsPerSemester = Number(req.body.minCreditsPerSemester ?? 6);

  // Initialize empty 8-semester plan
  for (let i = 1; i <= semestersCount; i++) plan.push({ number: i, courses: [], totalCredits: 0 });

  // Schedule courses semester by semester (1..8)
  for (let sem = 1; sem <= semestersCount && remainingCourses.length > 0; sem++) {
    let semCredits = 0;
    const semCourses = plan[sem-1].courses;

    // Try to add courses until we hit preferred or can't add more due to prereqs or max
    let innerProgress = true;
    while (innerProgress) {
      innerProgress = false;
      for (let i = 0; i < remainingCourses.length; i++) {
        const course = remainingCourses[i];
        const prereqList = parsePrereqs(course.prerequisites);

        const prereqCodes = prereqList.map(token => {
          const t = token.toString().replace(/\s+/g, '').toUpperCase();
          if (allCourseCodes.has(t)) return allCourseCodes.get(t);
          if (allCourseCodes.has(token)) return allCourseCodes.get(token);
          const pref = (course.department_ID || '').toString() + t;
          if (allCourseCodes.has(pref)) return allCourseCodes.get(pref);
          return token;
        });

        const prereqsMet = prereqCodes.every(code => !code || completed.has(code));

        if (!prereqsMet) continue;

        // if adding this course would exceed maxCredits, skip for now
        if (semCredits + course.credits > maxCreditsPerSemester) continue;

        // Prefer to fill up to preferredCreditsPerSemester but allow up to maxCreditsPerSemester
        if (semCredits < preferredCreditsPerSemester) {
          semCourses.push(course);
          semCredits += course.credits;
          completed.add(course.code);
          remainingCourses.splice(i,1);
          i--;
          innerProgress = true;
        }
      }

      // If no eligible prereq-satisfied course was found but semester still under preferred and there are remaining courses,
      // force-progress by taking the smallest-credit available (to break circular deps)
      if (!innerProgress && semCredits < preferredCreditsPerSemester && remainingCourses.length > 0) {
        // find smallest-credit course that fits within max
        const idx = remainingCourses.findIndex(c => (semCredits + (c.credits||0)) <= maxCreditsPerSemester);
        if (idx !== -1) {
          const c = remainingCourses.splice(idx,1)[0];
          semCourses.push(c);
          semCredits += c.credits || 0;
          completed.add(c.code);
          innerProgress = true;
        }
      }
    }

    plan[sem-1].courses = semCourses;
    plan[sem-1].totalCredits = semCredits;
  }

  // If after 8 semesters there are still remaining courses, try to place them into any semester without exceeding max.
  if (remainingCourses.length > 0) {
    for (let i = 0; i < remainingCourses.length; ) {
      const c = remainingCourses[i];
      let placed = false;
      for (let s = 0; s < semestersCount; s++) {
        if ((plan[s].totalCredits || 0) + (c.credits || 0) <= maxCreditsPerSemester) {
          plan[s].courses.push(c);
          plan[s].totalCredits = (plan[s].totalCredits || 0) + (c.credits || 0);
          completed.add(c.code);
          remainingCourses.splice(i,1);
          placed = true;
          break;
        }
      }
      if (!placed) {
        // cannot place this course within constraints
        return res.status(400).json({ error: 'Could not schedule all courses within 8 semesters. Consider increasing maxCreditsPerSemester or allowing extra semesters.' });
      }
    }
  }

  // Append final-semester courses into semester 8
  if (finalCourses.length > 0) {
    const last = plan[semestersCount - 1];
    // try to fit finals without exceeding max, else try to move other courses forward/backwards
    for (const fc of finalCourses) {
      if ((last.totalCredits || 0) + (fc.credits || 0) <= maxCreditsPerSemester) {
        last.courses.push(fc);
        last.totalCredits = (last.totalCredits || 0) + (fc.credits||0);
      } else {
        // try to find any earlier semester with room
        let placed = false;
        for (let s = 0; s < semestersCount; s++) {
          if ((plan[s].totalCredits || 0) + (fc.credits || 0) <= maxCreditsPerSemester) {
            plan[s].courses.push(fc);
            plan[s].totalCredits = (plan[s].totalCredits || 0) + (fc.credits||0);
            placed = true;
            break;
          }
        }
        if (!placed) {
          // cannot place final without exceeding max — append to last and allow it to exceed max as fallback
          last.courses.push(fc);
          last.totalCredits = (last.totalCredits || 0) + (fc.credits||0);
        }
      }
    }
  }

  // Ensure each semester meets minCreditsPerSemester by moving from later semesters or inserting elective placeholders
  for (let s = 0; s < semestersCount; s++) {
    const sem = plan[s];
    if ((sem.totalCredits || 0) >= minCreditsPerSemester) continue;
    let needed = minCreditsPerSemester - (sem.totalCredits || 0);
    // try to pull credits from later semesters
    for (let t = semestersCount - 1; t > s && needed > 0; t--) {
      const donor = plan[t];
      // find a course in donor that can move earlier (prereqs already satisfied earlier)
      for (let ci = donor.courses.length -1; ci >=0 && needed > 0; ci--) {
        const course = donor.courses[ci];
        // check if moving course to sem s would violate prereqs (i.e., course had prereqs not met before sem s)
        const prereqList = parsePrereqs(course.prerequisites);
        const prereqCodes = prereqList.map(token => {
          const tkn = token.toString().replace(/\s+/g, '').toUpperCase();
          if (allCourseCodes.has(tkn)) return allCourseCodes.get(tkn);
          if (allCourseCodes.has(token)) return allCourseCodes.get(token);
          const pref = (course.department_ID || '').toString() + tkn;
          if (allCourseCodes.has(pref)) return allCourseCodes.get(pref);
          return token;
        });
        // if all prereqs are in semesters <= s-1 (i.e., completed before sem s), it's safe to move
        const prereqsCompletedBeforeS = prereqCodes.every(code => {
          if (!code) return true;
          // find semester index where this code was scheduled
          const idx = plan.findIndex(p => p.courses.some(cc => cc.code === code));
          return idx !== -1 && idx < s;
        });
        if (!prereqsCompletedBeforeS) continue;
        // move it
        donor.courses.splice(ci,1);
        donor.totalCredits = (donor.totalCredits || 0) - (course.credits||0);
        sem.courses.push(course);
        sem.totalCredits = (sem.totalCredits||0) + (course.credits||0);
        needed = minCreditsPerSemester - (sem.totalCredits || 0);
      }
    }
    // If still need credits, insert placeholder electives
    if ((sem.totalCredits || 0) < minCreditsPerSemester) {
      let need = minCreditsPerSemester - (sem.totalCredits||0);
      // create placeholder courses of size 3 or smaller until need satisfied
      while (need > 0) {
        const size = Math.min(3, need);
        const placeholder = { code: `ELECTIVE_PLACEHOLDER_${s+1}_${Math.random().toString(36).slice(2,6)}`, name: 'Planned Elective (placeholder)', credits: size };
        sem.courses.push(placeholder);
        sem.totalCredits = (sem.totalCredits||0) + size;
        need -= size;
      }
    }
  }

  // NOTE: finalCourses already appended into semester 8 earlier in flow; nothing to do here

    // Fetch instructors and class_sections to attach instructor info to planned courses
    let instructors = [];
    let classSections = [];
    try {
      const [instrResp, csResp2] = await Promise.all([
        supabase.from('Instructors').select('*'),
        supabase.from('Class_Sections').select('*'),
      ]);
      if (!instrResp.error && Array.isArray(instrResp.data)) instructors = instrResp.data;
      if (!csResp2.error && Array.isArray(csResp2.data)) classSections = csResp2.data;
    } catch (e) {
      instructors = [];
      classSections = [];
    }

    // Build course -> instructor ids map and instructor lookup once (used to annotate planned courses)
    const courseToInstructorIds = new Map();
    classSections.forEach(cs => {
      const courseRef = (cs.course_id || cs.course_code || '').toString();
      const instrId = cs.instructor_id || cs.instructor || cs.instructor_id;
      if (!courseRef) return;
      const list = courseToInstructorIds.get(courseRef) || [];
      if (instrId) list.push(instrId);
      courseToInstructorIds.set(courseRef, list);
    });

    const instructorById = new Map();
    instructors.forEach(i => {
      instructorById.set(i.id || i.instructor_id || i.instructor || i.name, i);
    });

    const startYear = Number(req.body.startYear ?? new Date().getFullYear());
    const startSeason = (req.body.startSeason || 'Fall').toString();

    const nextSeason = (year, season) => {
      const s = season.toString().toLowerCase();
      if (s.startsWith('fall')) return { year: year + 1, season: 'Spring' };
      if (s.startsWith('spring')) return { year: year, season: 'Summer' };
      if (s.startsWith('summer')) return { year: year, season: 'Fall' };
      // default rotate to Spring next year
      return { year: year + 1, season: 'Spring' };
    };

    // Precompute target year/season for each of 8 semesters
    const targetLabels = [];
    let curY = startYear;
    let curS = startSeason;
    for (let i = 0; i < 8; i++) {
      targetLabels.push({ year: curY, season: curS });
      const nx = nextSeason(curY, curS);
      curY = nx.year; curS = nx.season;
    }

    // If we have semesterRows, sort them by an available sort key (prefer start_date), otherwise by year+season
    const seasonOrder = str => {
      const s = (str || '').toString().toLowerCase();
      if (s.startsWith('spring')) return 1;
      if (s.startsWith('summer')) return 2;
      if (s.startsWith('fall')) return 3;
      return 4;
    };

    const rowsSorted = (semesterRows || []).slice().sort((a,b) => {
      // prefer start_date
      if (a.start_date && b.start_date) return new Date(a.start_date) - new Date(b.start_date);
      const ay = Number(a.year || a.academic_year || a.start_year || 0);
      const by = Number(b.year || b.academic_year || b.start_year || 0);
      if (ay !== by) return ay - by;
      return seasonOrder(a.season || a.term || a.name) - seasonOrder(b.season || b.term || b.name);
    });

    // find the index in rowsSorted that matches startYear/startSeason, or first row after that
    let startIdx = -1;
    for (let i = 0; i < rowsSorted.length; i++) {
      const r = rowsSorted[i];
      const ry = Number(r.year ?? r.academic_year ?? r.start_year ?? NaN);
      const rs = (r.season || r.term || r.name || '').toString();
      if (!isNaN(ry) && ry === startYear && rs.toLowerCase().startsWith(startSeason.toLowerCase())) { startIdx = i; break; }
      // fallback: first row with year >= startYear
      if (!isNaN(ry) && ry >= startYear && startIdx === -1) startIdx = i;
    }
    if (startIdx === -1 && rowsSorted.length > 0) startIdx = 0;

    // pick up to 8 consecutive rows starting from startIdx
    const chosenRows = [];
    if (startIdx !== -1) {
      for (let i = startIdx; i < Math.min(rowsSorted.length, startIdx + 8); i++) chosenRows.push(rowsSorted[i]);
    }

    const formatted = plan.map((s, idx) => {
      const row = chosenRows[idx];
      if (row) {
        const out = {
          number: s.number,
          year: row.year ?? row.academic_year ?? row.start_year ?? null,
          season: row.season ?? row.term ?? row.name ?? null,
          semester_id: row.id ?? row.semester_id ?? null,
          courses: s.courses.map(c => {
            // try several keys in courseToInstructorIds: course code, numeric id, or department+number
            const possibleKeys = [c.code, (c._raw && c._raw.id) || c.code, (c._raw && c._raw.course_id) || ''];
            let instrCandidates = [];
            for (const k of possibleKeys) {
              if (!k) continue;
              const found = courseToInstructorIds.get(k.toString());
              if (Array.isArray(found)) instrCandidates = instrCandidates.concat(found);
            }
            // map to instructor objects and pick highest rated (rating property or score)
            const instrObjs = instrCandidates.map(id => instructorById.get(id)).filter(Boolean);
            let chosen = null;
            if (instrObjs.length > 0) {
              instrObjs.sort((a,b) => (Number(b.rating||b.score||0) - Number(a.rating||a.score||0)));
              const top = instrObjs[0];
              chosen = { name: top.name || top.full_name || top.instructor || null, rating: Number(top.rating || top.score || 0) };
            }
            return { code: c.code, name: c.name, credits: c.credits, instructor: chosen };
          }),
          totalCredits: s.totalCredits
        };
        Object.keys(row).forEach(k => { if (!['id','year','season','academic_year','start_year','term','name'].includes(k)) out[k] = row[k]; });
        return out;
      }
      // fallback: synthesize label from targetLabels
      const label = targetLabels[idx] || { year: null, season: null };
      return { number: s.number, year: label.year, season: label.season, semester_id: null, courses: s.courses.map(c => ({ code: c.code, name: c.name, credits: c.credits })), totalCredits: s.totalCredits };
    });

    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: 'generate_plan exception' });
  }
});
export default router;
