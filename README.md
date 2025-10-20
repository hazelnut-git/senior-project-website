
  # Course Selection Screen

  This is a code bundle for Course Selection Screen. The original project is available at https://www.figma.com/design/hogCv3XNzmHE3Yax4fHt2m/Course-Selection-Screen.

  ## Running the code

  ```markdown
  # Course Selection Screen

  This is a code bundle for Course Selection Screen. The original project is available at https://www.figma.com/design/hogCv3XNzmHE3Yax4fHt2m/Course-Selection-Screen.

  ## Running the code

  1. Install dependencies:

  ```powershell
  npm install
  ```

  2. Start the frontend dev server:

  ```powershell
  npm run dev
  ```

  ## Backend (Node + Supabase)

  A small Express backend is included under `server/`. It proxies requests to your Supabase Postgres database using the anon key from your `.env`.

  Required env vars (already in project `.env`):

  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY

  Start the server:

  ```powershell
  npm run server:start
  ```

  For development with automatic restart (Node 18+):

  ```powershell
  npm run server:dev
  ```

  The backend exposes:

  - GET /api/courses
  - POST /api/courses
  - GET /api/departments
  - GET /api/majors
  - GET /api/tags

  ### CPS planner API

  POST /api/cps/generate_plan

  Request JSON body:

   - major_id: department UUID or department code (e.g. "af2416dc-c1a6-..." or "CSCI")
   - startYear (optional): integer year to start the plan (default: current year)
   - startSeason (optional): string 'Fall'|'Spring'|'Summer' (default: Fall)
   - maxCreditsPerSemester (optional): integer (default: 18)

  Behavior:

   - Reads the `Courses` table and filters courses for the requested major/department.
   - Normalizes prerequisite strings and attempts to map tokens like "CSCI101", "CSCI 101", or "101" to actual course codes.
   - Supports simple OR separators in prerequisites (comma, 'or', '/', '|'). Complex boolean expressions are not supported yet.
   - Generates a semester-by-semester plan honoring prerequisites and the credit cap. Courses that include the keyword 'FINAL' in their prerequisites are appended to the last semester.

  Response:

   - JSON array of semester objects: { number, year, season, courses: [{ code, name, credits }], totalCredits }

  Notes:

   - The generator does not persist the plan automatically. Use the POST /api/cps/plan endpoint to save a plan explicitly.

  If you prefer to run the frontend and backend together, start the frontend with `npm run dev` in another terminal.
  ```
  