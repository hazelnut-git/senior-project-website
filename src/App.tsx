import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { AcademicPlanGrid } from './components/AcademicPlanGrid';
import { Calendar, GraduationCap, Tags, Zap, Moon, Sun } from 'lucide-react';

interface Department {
  id: string;
  department_ID: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
  category: string | null;
}

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
  const [majors, setMajors] = useState<Department[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [academicPlan, setAcademicPlan] = useState<Semester[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Fetch majors and tags from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        // Load Departments from backend API
        const deptsRes = await fetch('/api/departments');
        if (!deptsRes.ok) throw new Error(`Departments fetch failed: ${deptsRes.statusText}`);
        const depts = await deptsRes.json();
        setMajors(depts ?? []);

        // Load Tags from backend API
        const tagsRes = await fetch('/api/tags');
        if (!tagsRes.ok) throw new Error(`Tags fetch failed: ${tagsRes.statusText}`);
        const tagsData = await tagsRes.json();
        setAvailableTags(tagsData ?? []);
      } catch (err) {
        console.error('loadData error:', err);
      }
    }

    loadData();
  }, []);

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const generateAcademicPlan = async () => {
    if (!selectedMajor) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/cps/generate_plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ major_id: selectedMajor })
      });
      if (!res.ok) throw new Error('Failed to generate plan');
      const plan = await res.json();
      setAcademicPlan([])
      setAcademicPlan(plan);
    } catch (err) {
      console.error('Generate plan error:', err);
    } finally {
      setIsGenerating(false);
    }
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
          <div className="absolute top-0 right-0">
            <Button variant="outline" size="icon" onClick={toggleDarkMode} className="w-10 h-10">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
          <div className="text-center space-y-2">
            <h1 className="flex items-center justify-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              Academic Career Planner
            </h1>
            <p className="text-muted-foreground">
              Select your major and interests to generate your academic plan
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          {/* Left Sidebar */}
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
                    <SelectValue placeholder="Choose your major" />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        <div className="flex flex-col items-start">
                          <span>{dept.name}</span>
                          <span className="text-sm text-muted-foreground">{dept.department_ID}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Academic Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="w-5 h-5" />
                  Academic Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedTags.length === 0 ? '' : undefined} onValueChange={handleTagSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add interests" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags
                      .filter(tag => !selectedTags.includes(tag.name))
                      .map((tag) => (
                        <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {selectedTags.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-sm text-muted-foreground">Selected interests:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(tag => (
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
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
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
              <AcademicPlanGrid semesters={academicPlan} majorName={majors.find(m => m.id === selectedMajor)?.name || ''} />
            ) : (
              <Card className="h-full min-h-[600px]">
                <CardContent className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <GraduationCap className="w-16 h-16 text-muted-foreground/50" />
                  <div>
                    <h3 className="text-muted-foreground">No academic plan generated yet</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Select a major and click "Generate Academic Plan" to see your plan
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
