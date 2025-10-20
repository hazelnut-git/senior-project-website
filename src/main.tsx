
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(<App />);

  async function fetchCourses() {
  const res = await fetch("http://localhost:5000/api/courses");
  const data = await res.json();
  console.log(data);
}
fetchCourses();
  