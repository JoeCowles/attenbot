"use client"

import { useState, useEffect, useCallback, KeyboardEvent } from "react"
import { Bell, Home, PlusCircle, Settings, Users, X, ChevronLeft, ChevronRight } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Student, StudentsResponse, StudentResponse, AddStudentRequest, UpdateStudentFiltersRequest, DeleteStudentRequest, Video } from '@/types/types'

// Mock data for the activity chart
const activityData = [
  { name: "Mon", minutes: 45 },
  { name: "Tue", minutes: 30 },
  { name: "Wed", minutes: 60 },
  { name: "Thu", minutes: 15 },
  { name: "Fri", minutes: 45 },
  { name: "Sat", minutes: 120 },
  { name: "Sun", minutes: 90 },
]

const FilterSection = ({ filters, addFilter }: { filters: string[], addFilter: (filter: string) => void }) => {
  const [newFilter, setNewFilter] = useState('');

  const samplePrompts = [
    "I don't want my child watching Mr Beast",
    "I don't want my child watching graphic content",
    "Please filter out videos with excessive swearing",
    "Block videos promoting unhealthy eating habits"
  ];

  const handleAddFilter = () => {
    if (newFilter.trim()) {
      addFilter(newFilter.trim());
      setNewFilter('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddFilter();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          type="text"
          value={newFilter}
          onChange={(e) => setNewFilter(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a filter..."
        />
        <Button onClick={handleAddFilter}>Add Filter</Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filters.map((filter, index) => (
          <div key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
            {filter}
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Suggested Filters:</h3>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt, index) => (
            <Button 
              key={index}
              variant="outline"
              className="border border-dotted"
              onClick={() => addFilter(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [studentAccounts, setStudentAccounts] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [videoData, setVideoData] = useState<Video[]>([])
  const [chartData, setChartData] = useState<{ name: string; count: number }[]>([])

  const fetchStudents = useCallback(async () => {
    if (!isLoading) return; // Prevent multiple simultaneous requests

    try {
      const response = await fetch('/api/students');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const students: Student[] = await response.json();
      console.log('Fetched students:', students);
      console.log(students.length)
      if (students.length > 0) {
        setStudentAccounts(students);
        setSelectedStudent(students[0]);
      } else {
        console.warn('No students received');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // You might want to set an error state here to display to the user
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const fetchVideoData = useCallback(async () => {
    if (!selectedStudent) return;

    try {
      const response = await fetch(`/api/videos?student_id=${selectedStudent.student_id}&weekOffset=${weekOffset}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Video[] = await response.json();
      setVideoData(data);

      // Process data for chart
      const counts = data.reduce((acc, video) => {
        const date = new Date(video.timestamp).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const chartData = Object.entries(counts).map(([name, count]) => ({ name, count: Number(count) }));
      setChartData(chartData);
    } catch (error) {
      console.error('Error fetching video data:', error);
    }
  }, [selectedStudent, weekOffset]);

  useEffect(() => {
    fetchVideoData();
  }, [fetchVideoData]);

  const addFilter = async (filter: string) => {
    if (filter && selectedStudent) {
      const currentFilters = selectedStudent.filters ?? [];
      if (!currentFilters.includes(filter)) {
        // Immediately update the UI
        const updatedFilters = [...currentFilters, filter];
        const updatedStudent = {
          ...selectedStudent,
          filters: updatedFilters,
        };
        setSelectedStudent(updatedStudent);
        setStudentAccounts(prevAccounts =>
          prevAccounts.map(student =>
            student.student_id === updatedStudent.student_id ? updatedStudent : student
          )
        );

        // Make the API call without waiting for the response
        const request: UpdateStudentFiltersRequest = {
          student_id: selectedStudent.student_id,
          filters: updatedFilters,
        };
        try {
          fetch('/api/students', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
          }).then(response => {
            if (!response.ok) {
              console.error('Error updating filters on server');
              // You might want to show an error message to the user here
            }
          });
        } catch (error) {
          console.error('Error adding filter:', error);
          // You might want to show an error message to the user here
        }
      }
    }
  };

  const removeFilter = async (filter: string) => {
    if (selectedStudent) {
      const updatedFilters = selectedStudent.filters.filter((f) => f !== filter)
      const response = await fetch('/api/students', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: selectedStudent.student_id,
          filters: updatedFilters,
        }),
      })
      const updatedStudent = await response.json()
      setSelectedStudent(updatedStudent)
      setStudentAccounts(studentAccounts.map(student => 
        student.student_id === updatedStudent.student_id ? updatedStudent : student
      ))
    }
  }

  const addNewStudent = async (name: string) => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);  
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newStudent = await response.json();
      setStudentAccounts([...studentAccounts, newStudent]);
    } catch (error) {
      console.error('Error adding new student:', error);
      // You might want to show an error message to the user here
    }
  };

  const deleteStudent = async (student_id: string) => {
    await fetch('/api/students', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ student_id }),
    })
    setStudentAccounts(studentAccounts.filter(student => student.student_id !== student_id))
    if (selectedStudent && selectedStudent.student_id === student_id) {
      setSelectedStudent(studentAccounts[0] || null)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-primary">Parent Dashboard</h1>
        </div>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <nav className="space-y-2 p-2">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("overview")}
            >
              <Home className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={activeTab === "accounts" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("accounts")}
            >
              <Users className="mr-2 h-4 w-4" />
              Student Accounts
            </Button>
            <Separator className="my-4" />
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Students</h2>
            {isLoading ? (
              <p>Loading students...</p>
            ) : (
              studentAccounts.map((student) => (
                <Button
                  key={student.student_id}
                  variant={selectedStudent?.student_id === student.student_id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedStudent(student)}
                >
                  <Avatar className="mr-2 h-6 w-6">
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${student.name}`} alt={student.name} />
                    <AvatarFallback>{student.name[0]}</AvatarFallback>
                  </Avatar>
                  {student.name}
                </Button>
              ))
            )}
          </nav>
        </ScrollArea>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              {selectedStudent && (
                <>
                  {/* New section for student info */}
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${selectedStudent.name}`} alt={selectedStudent.name} />
                      <AvatarFallback>{selectedStudent.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                      <p className="text-gray-500">Student Overview</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="col-span-2">
                      <CardHeader>
                        <CardTitle>Weekly Video Watch Count</CardTitle>
                        <CardDescription>{selectedStudent.name}'s YouTube videos watched in the past week</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <Button onClick={() => setWeekOffset(prev => prev + 1)}><ChevronLeft /></Button>
                          <span>Week of {new Date(Date.now() - weekOffset * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                          <Button onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))} disabled={weekOffset === 0}><ChevronRight /></Button>
                        </div>
                        <ChartContainer
                          config={{
                            count: {
                              label: "Videos Watched",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                          className="h-[300px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="count" fill="var(--color-count)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Content Filters</CardTitle>
                        <CardDescription>Manage filters for {selectedStudent.name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FilterSection 
                          filters={selectedStudent.filters ?? []} 
                          addFilter={addFilter}
                        />
                      </CardContent>
                    </Card>
                    <Card className="col-span-2">
                      <CardHeader>
                        <CardTitle>Recently Watched Videos</CardTitle>
                        <CardDescription>Videos watched in the selected week</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[300px]">
                          {videoData.map((video) => (
                            <div key={video.id} className="flex items-center space-x-4 mb-4">
                              <img src={video.image} alt={video.title} className="w-16 h-16 object-cover rounded" />
                              <div>
                                <p className="font-medium">{video.title}</p>
                                <p className="text-sm text-gray-500">{new Date(video.timestamp).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
            <TabsContent value="accounts">
              <Card>
                <CardHeader>
                  <CardTitle>Student Accounts</CardTitle>
                  <CardDescription>Manage your children's accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentAccounts.map((student) => (
                      <div key={student.student_id} className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${student.name}`} alt={student.name} />
                          <AvatarFallback>{student.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                        </div>
                        <div className="ml-auto flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedStudent(student)}>
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteStudent(student.student_id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => {
                    const name = prompt("Enter the name of the new student")
                    if (name) {
                      addNewStudent(name)
                    }
                  }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Student
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}