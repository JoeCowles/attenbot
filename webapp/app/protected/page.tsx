"use client"

import { useState } from "react"
import { Bell, Home, PlusCircle, Settings, Users, X } from "lucide-react"
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

// Mock data for student accounts with filters
const studentAccounts = [
  { id: 1, name: "Alice", age: 10, avatar: "/placeholder.svg?height=40&width=40", filters: ["violence", "profanity"] },
  { id: 2, name: "Bob", age: 8, avatar: "/placeholder.svg?height=40&width=40", filters: ["violence"] },
  { id: 3, name: "Charlie", age: 12, avatar: "/placeholder.svg?height=40&width=40", filters: ["profanity", "adult content"] },
]

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedStudent, setSelectedStudent] = useState(studentAccounts[0])

  const addFilter = (filter: string) => {
    if (filter && !selectedStudent.filters.includes(filter)) {
      setSelectedStudent({
        ...selectedStudent,
        filters: [...selectedStudent.filters, filter],
      })
    }
  }

  const removeFilter = (filter: string) => {
    setSelectedStudent({
      ...selectedStudent,
      filters: selectedStudent.filters.filter((f) => f !== filter),
    })
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
            {studentAccounts.map((student) => (
              <Button
                key={student.id}
                variant={selectedStudent.id === student.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedStudent(student)}
              >
                <Avatar className="mr-2 h-6 w-6">
                  <AvatarImage src={student.avatar} alt={student.name} />
                  <AvatarFallback>{student.name[0]}</AvatarFallback>
                </Avatar>
                {student.name}
              </Button>
            ))}
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Weekly Watch Time</CardTitle>
                    <CardDescription>{selectedStudent.name}'s YouTube watch time for the past week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        minutes: {
                          label: "Minutes",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="minutes" fill="var(--color-minutes)" />
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
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-filter">Add new filter</Label>
                        <div className="flex space-x-2">
                          <Input id="new-filter" placeholder="Enter keyword or category" />
                          <Button onClick={() => addFilter((document.getElementById("new-filter") as HTMLInputElement).value)}>
                            Add
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Active filters</Label>
                        <ScrollArea className="h-[100px] w-full rounded-md border p-4">
                          <div className="flex flex-wrap gap-2">
                            {selectedStudent.filters.map((filter) => (
                              <Button key={filter} variant="secondary" size="sm" onClick={() => removeFilter(filter)}>
                                {filter}
                                <X className="ml-2 h-3 w-3" />
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                      <div key={student.id} className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback>{student.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">Age: {student.age}</p>
                        </div>
                        <div className="ml-auto flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedStudent(student)}>
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
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