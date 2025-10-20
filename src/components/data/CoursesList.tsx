import React, { useEffect, useState } from "react";

type Course = {
  id: string;
  name?: string;
  code?: string;
  department_id?: string;
};

export default function CoursesList(): JSX.Element {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  if (loading) return <div>Loading courses…</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Courses</h2>
      <ul className="space-y-1">
        {courses.map((c) => (
          <li key={c.id}>
            <strong>{c.code ?? "—"}</strong> — {c.name ?? "Untitled Course"}
          </li>
        ))}
      </ul>
    </div>
  );
}
