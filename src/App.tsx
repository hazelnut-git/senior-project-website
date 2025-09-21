import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { AcademicPlanGrid } from './components/AcademicPlanGrid';
import { Calendar, GraduationCap, Tags, Zap, Moon, Sun } from 'lucide-react';

// Mock data
const majors = [
  { id: '1', name: 'Computer Science', degree: 'Bachelor of Science', duration: '4 years' },
  { id: '2', name: 'Electrical Engineering', degree: 'Bachelor of Engineering', duration: '4 years' },
  { id: '3', name: 'Business Administration', degree: 'Bachelor of Business Administration', duration: '4 years' },
  { id: '4', name: 'Psychology', degree: 'Bachelor of Arts', duration: '4 years' },
  { id: '5', name: 'Biology', degree: 'Bachelor of Science', duration: '4 years' },
  { id: '6', name: 'Mathematics', degree: 'Bachelor of Science', duration: '4 years' },
  { id: '7', name: 'English Literature', degree: 'Bachelor of Arts', duration: '4 years' },
  { id: '8', name: 'Mechanical Engineering', degree: 'Bachelor of Engineering', duration: '4 years' },
  { id: '9', name: 'Economics', degree: 'Bachelor of Arts', duration: '4 years' },
  { id: '10', name: 'Chemistry', degree: 'Bachelor of Science', duration: '4 years' }
];

const availableTags = [
  'Research-Oriented', 'Industry-Focused', 'Theoretical', 'Hands-On Learning', 'Interdisciplinary',
  'STEM Track', 'Liberal Arts', 'Pre-Professional', 'Creative Projects', 'Data Analysis',
  'Leadership Development', 'Global Perspective', 'Entrepreneurship', 'Social Impact', 'Technology Integration',
  'Laboratory Work', 'Field Experience', 'Internship Preparation', 'Graduate School Prep', 'Career-Ready Skills'
];

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

export default function App() {
  const [selectedMajor, setSelectedMajor] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [academicPlan, setAcademicPlan] = useState<Semester[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Handle dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const generateAcademicPlan = () => {
    if (!selectedMajor) return;
    
    setIsGenerating(true);
    
    // Simulate academic plan generation
    setTimeout(() => {
      const selectedMajorData = majors.find(m => m.id === selectedMajor);
      if (!selectedMajorData) return;

      // Generate 8-semester plan based on major
      const samplePlan: Semester[] = [
        {
          number: 1,
          year: 'Freshman',
          season: 'Fall',
          courses: [
            { code: 'ENG101', name: 'English Composition I', credits: 3, type: 'Core' },
            { code: 'MATH111', name: 'College Algebra', credits: 4, type: 'Core' },
            { code: 'HIST101', name: 'World History', credits: 3, type: 'Core' },
            { code: 'CS101', name: 'Introduction to Computing', credits: 3, type: 'Major' },
            { code: 'PE101', name: 'Physical Education', credits: 1, type: 'Core' }
          ],
          totalCredits: 14
        },
        {
          number: 2,
          year: 'Freshman',
          season: 'Spring',
          courses: [
            { code: 'ENG102', name: 'English Composition II', credits: 3, type: 'Core' },
            { code: 'MATH112', name: 'Calculus I', credits: 4, type: 'Core' },
            { code: 'PHYS101', name: 'General Physics I', credits: 4, type: 'Core' },
            { code: 'CS102', name: 'Programming Fundamentals', credits: 4, type: 'Major' }
          ],
          totalCredits: 15
        },
        {
          number: 3,
          year: 'Sophomore',
          season: 'Fall',
          courses: [
            { code: 'MATH213', name: 'Calculus II', credits: 4, type: 'Core' },
            { code: 'PHYS102', name: 'General Physics II', credits: 4, type: 'Core' },
            { code: 'CS201', name: 'Data Structures', credits: 4, type: 'Major' },
            { code: 'STAT201', name: 'Statistics', credits: 3, type: 'Major' },
            { code: 'PHIL101', name: 'Ethics', credits: 3, type: 'Core' }
          ],
          totalCredits: 18
        },
        {
          number: 4,
          year: 'Sophomore',
          season: 'Spring',
          courses: [
            { code: 'CS202', name: 'Algorithms', credits: 4, type: 'Major' },
            { code: 'CS203', name: 'Computer Systems', credits: 4, type: 'Major' },
            { code: 'MATH301', name: 'Discrete Mathematics', credits: 3, type: 'Major' },
            { code: 'ECON101', name: 'Microeconomics', credits: 3, type: 'Elective' },
            { code: 'ART101', name: 'Art Appreciation', credits: 2, type: 'Core' }
          ],
          totalCredits: 16
        },
        {
          number: 5,
          year: 'Junior',
          season: 'Fall',
          courses: [
            { code: 'CS301', name: 'Database Systems', credits: 4, type: 'Major' },
            { code: 'CS302', name: 'Software Engineering', credits: 4, type: 'Major' },
            { code: 'CS303', name: 'Operating Systems', credits: 4, type: 'Major' },
            { code: 'PSYC101', name: 'General Psychology', credits: 3, type: 'Elective' }
          ],
          totalCredits: 15
        },
        {
          number: 6,
          year: 'Junior',
          season: 'Spring',
          courses: [
            { code: 'CS304', name: 'Computer Networks', credits: 4, type: 'Major' },
            { code: 'CS305', name: 'Web Development', credits: 3, type: 'Major' },
            { code: 'CS306', name: 'Mobile App Development', credits: 3, type: 'Elective' },
            { code: 'BUS201', name: 'Business Communications', credits: 3, type: 'Minor' },
            { code: 'SCI201', name: 'Environmental Science', credits: 3, type: 'Elective' }
          ],
          totalCredits: 16
        },
        {
          number: 7,
          year: 'Senior',
          season: 'Fall',
          courses: [
            { code: 'CS401', name: 'Machine Learning', credits: 4, type: 'Major' },
            { code: 'CS402', name: 'Cybersecurity', credits: 3, type: 'Major' },
            { code: 'CS490', name: 'Senior Capstone I', credits: 3, type: 'Major' },
            { code: 'BUS301', name: 'Project Management', credits: 3, type: 'Minor' },
            { code: 'COMM201', name: 'Public Speaking', credits: 2, type: 'Core' }
          ],
          totalCredits: 15
        },
        {
          number: 8,
          year: 'Senior',
          season: 'Spring',
          courses: [
            { code: 'CS403', name: 'Artificial Intelligence', credits: 4, type: 'Major' },
            { code: 'CS404', name: 'Cloud Computing', credits: 3, type: 'Elective' },
            { code: 'CS491', name: 'Senior Capstone II', credits: 3, type: 'Major' },
            { code: 'BUS401', name: 'Entrepreneurship', credits: 3, type: 'Minor' },
            { code: 'PHIL301', name: 'Technology Ethics', credits: 3, type: 'Elective' }
          ],
          totalCredits: 16
        }
      ];

      setAcademicPlan(samplePlan);
      setIsGenerating(false);
    }, 2000);
  };

  const resetSelection = () => {
    setSelectedMajor('');
    setSelectedTags([]);
    setAcademicPlan([]);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative">
          {/* Dark Mode Toggle - Top Right */}
          <div className="absolute top-0 right-0">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              className="w-10 h-10"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Header Content */}
          <div className="text-center space-y-2">
            <h1 className="flex items-center justify-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              Academic Career Planner
            </h1>
            <p className="text-muted-foreground">
              Select your major and interests to generate your complete 8-semester academic plan
            </p>
          </div>
        </div>

        {/* Main Content - Left Controls, Right Timetable */}
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          {/* Left Sidebar - Controls */}
          <div className="space-y-6">
            {/* Major Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Select Major
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedMajor} onValueChange={setSelectedMajor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your major field of study" />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map((major) => (
                      <SelectItem key={major.id} value={major.id}>
                        <div className="flex flex-col items-start">
                          <span>{major.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {major.degree} • {major.duration}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedMajor && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm">
                      <strong>Selected:</strong>{' '}
                      {majors.find(m => m.id === selectedMajor)?.name}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Academic Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="w-5 h-5" />
                  Academic Interests & Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select onValueChange={handleTagSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add interests to customize your academic path" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags
                      .filter(tag => !selectedTags.includes(tag))
                      .map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                
                {selectedTags.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-sm text-muted-foreground">Selected interests:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleTagSelect(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-2 text-xs text-muted-foreground">
                  Select up to 5 interests • Click to remove
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={generateAcademicPlan}
                disabled={!selectedMajor || isGenerating}
                className="w-full py-3"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Academic Plan
                  </>
                )}
              </Button>
              
              {(selectedMajor || selectedTags.length > 0 || academicPlan.length > 0) && (
                <Button variant="outline" onClick={resetSelection} className="w-full">
                  Reset Selection
                </Button>
              )}
            </div>
          </div>

          {/* Right Side - Academic Plan */}
          <div className="min-h-0">
            {academicPlan.length > 0 ? (
              <AcademicPlanGrid 
                semesters={academicPlan} 
                majorName={majors.find(m => m.id === selectedMajor)?.name || ''} 
              />
            ) : (
              <Card className="h-full min-h-[600px]">
                <CardContent className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <GraduationCap className="w-16 h-16 text-muted-foreground/50" />
                  <div>
                    <h3 className="text-muted-foreground">No academic plan generated yet</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Select a major and click "Generate Academic Plan" to see your 8-semester plan
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}