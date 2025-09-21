import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface Course {
  code: string;
  name: string;
  credits: number;
  type?: 'Core' | 'Elective' | 'Major' | 'Minor';
}

interface Semester {
  number: number;
  year: string;
  season: string;
  courses: Course[];
  totalCredits: number;
}

interface AcademicPlanGridProps {
  semesters: Semester[];
  majorName: string;
}

export function AcademicPlanGrid({ semesters, majorName }: AcademicPlanGridProps) {
  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'Core': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-800';
      case 'Major': return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-200 dark:border-teal-800';
      case 'Elective': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800';
      case 'Minor': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800';
      default: return 'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-900/30 dark:text-stone-200 dark:border-stone-800';
    }
  };

  const totalCredits = semesters.reduce((sum, semester) => sum + semester.totalCredits, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            Academic Plan: {majorName}
          </CardTitle>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <span>8 Semesters</span>
            <span>•</span>
            <span>{totalCredits} Total Credits</span>
          </div>
        </CardHeader>
      </Card>

      {/* Course Type Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <Badge className={`border ${getTypeColor('Core')}`}>Core Requirements</Badge>
            <Badge className={`border ${getTypeColor('Major')}`}>Major Courses</Badge>
            <Badge className={`border ${getTypeColor('Elective')}`}>Electives</Badge>
            <Badge className={`border ${getTypeColor('Minor')}`}>Minor/Specialization</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Semesters Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {semesters.map((semester) => (
          <Card key={semester.number} className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>{semester.season} {semester.year}</span>
                <Badge variant="outline">{semester.totalCredits} credits</Badge>
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Semester {semester.number}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {semester.courses.map((course, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{course.code}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {course.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-xs font-medium">{course.credits}cr</span>
                    {course.type && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs border ${getTypeColor(course.type)}`}
                      >
                        {course.type}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {semester.courses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-sm">No courses scheduled</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}