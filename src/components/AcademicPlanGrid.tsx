import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0);

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
  const currentSemester = semesters[currentSemesterIndex];
  
  const goToPreviousSemester = () => {
    setCurrentSemesterIndex(Math.max(0, currentSemesterIndex - 1));
  };
  
  const goToNextSemester = () => {
    setCurrentSemesterIndex(Math.min(semesters.length - 1, currentSemesterIndex + 1));
  };

  if (!currentSemester) {
    return null;
  }

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

        {/* Navigation Controls */}
        <CardContent className="">
          <div className="flex items-center justify-between gap-4">
            {/* Previous Button */}
            <Button
              variant="outline"
              onClick={goToPreviousSemester}
              disabled={currentSemesterIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {/* Semester Selector */}
            <div className="flex items-center gap-4">
              <Select 
                value={currentSemesterIndex.toString()} 
                onValueChange={(value) => setCurrentSemesterIndex(parseInt(value))}
              >
                <SelectTrigger className="w-60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      Semester {semester.number}: {semester.season} {semester.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Progress Indicator */}
              <div className="text-sm text-muted-foreground">
                {currentSemesterIndex + 1} of {semesters.length}
              </div>
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              onClick={goToNextSemester}
              disabled={currentSemesterIndex === semesters.length - 1}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>


      {/* Current Semester Display */}
        <CardContent className="space-y-3">
          {currentSemester.courses.map((course, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium">{course.code}</div>
                <div className="text-sm text-muted-foreground">
                  {course.name}
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="text-sm font-medium">{course.credits} credits</span>
                {course.type && (
                  <Badge 
                    variant="secondary" 
                    className={`border ${getTypeColor(course.type)}`}
                  >
                    {course.type}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          {currentSemester.courses.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="text-lg">No courses scheduled</div>
              <div className="text-sm mt-2">This semester appears to be empty</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}