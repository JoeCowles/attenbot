'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BookOpen, PlayCircle, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { Skeleton } from "@/components/ui/skeleton"

// Helper function to get YouTube video ID
const getYouTubeVideoId = (url : string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function WeeklyReport() {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [weekData, setWeekData] = useState<any>(null)
  const [cachedWeeks, setCachedWeeks] = useState<{[key: number]: any}>({})
  const [isLoading, setIsLoading] = useState(true)

  const fetchWeekData = useCallback(async (weekOffset: number) => {
    if (cachedWeeks[weekOffset]) {
      setWeekData(cachedWeeks[weekOffset])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const studentId = urlParams.get('studentId');
      if (!studentId) {
        throw new Error('Student ID is missing from the URL');
      }

      // Calculate date range
      const today = new Date();
      const fromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + (weekOffset * 7));
      const toDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() + 6);

      // Set time to start of day for fromDate and end of day for toDate
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);

      const fromDateString = fromDate.toISOString();
      const toDateString = toDate.toISOString();

      const response = await fetch(`/api/videos/get-classified?dateFrom=${fromDateString}&dateTo=${toDateString}&studentId=${studentId}`)
      
      if (response.status === 500) {
        console.log('No data for this date range');
        setWeekData({}) // Set empty object for no data
      } else if (!response.ok) {
        throw new Error('Failed to fetch data')
      } else {
        const data = await response.json()
        console.log('Fetched data:', data);
        setWeekData(data)
        setCachedWeeks(prev => ({ ...prev, [weekOffset]: data }))
      }
    } catch (error) {
      console.error('Error fetching week data:', error)
      setWeekData({}) // Set empty object on error
    } finally {
      setIsLoading(false)
    }
  }, [cachedWeeks])

  useEffect(() => {
    fetchWeekData(currentWeekIndex)
  }, [currentWeekIndex, fetchWeekData])

  useEffect(() => {
    console.log('weekData updated:', weekData);
  }, [weekData]);

  const chartData = useMemo(() => {
    console.log('weekData in chartData useMemo:', weekData); // Debug log
    if (!weekData) return []
    return Object.entries(weekData).map(([date, videos]: [string, any]) => {
      console.log('Processing date:', date); // Debug log
      return {
        date, 
        entertainment: Array.isArray(videos) ? videos.filter(v => v.category === 'entertainment').length : 0,
        educational: Array.isArray(videos) ? videos.filter(v => v.category === 'educational').length : 0,
        unknown: Array.isArray(videos) ? videos.filter(v => v.category === 'unknown').length : 0,
        total: Array.isArray(videos) ? videos.length : 0
      }
    })
  }, [weekData])

  const handleDateSelect = useCallback((dateString: string) => {
    console.log('Selecting date:', dateString);
    setSelectedDate(dateString);
  }, []);

  const selectedDayVideos = useMemo(() => {
    console.log('Recalculating selectedDayVideos');
    console.log('Selected date:', selectedDate);
    console.log('Week data:', weekData);
    if (!weekData || !selectedDate) return []
    return weekData[selectedDate] || []
  }, [weekData, selectedDate])

  useEffect(() => {
    if (weekData) {
      const dates = Object.keys(weekData);
      console.log('Available dates:', dates);
      if (dates.length > 0 && !selectedDate) {
        handleDateSelect(dates[0]);
      }
    }
  }, [weekData, selectedDate, handleDateSelect]);

  useEffect(() => {
    console.log('Selected date changed:', selectedDate);
  }, [selectedDate]);

  const changeWeek = (direction: number) => {
    setCurrentWeekIndex(prev => prev + direction)
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'educational':
        return <BookOpen className="w-4 h-4" />;
      case 'entertainment':
        return <PlayCircle className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getWeekLabel = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + (currentWeekIndex * 7));
    return `Week of ${weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  }, [currentWeekIndex]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Weekly Video Report</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Daily Video Watching Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Button onClick={() => changeWeek(-1)} size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous Week
            </Button>
            <span className="font-semibold">{getWeekLabel}</span>
            <Button onClick={() => changeWeek(1)} size="sm">
              Next Week <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          {isLoading ? (
            <Skeleton className="w-full h-[300px]" />
          ) : (
            <ChartContainer
              config={{
                entertainment: {
                  label: "Entertainment",
                  color: "hsl(var(--chart-1))",
                },
                educational: {
                  label: "Educational",
                  color: "hsl(var(--chart-2))",
                },
                unknown: {
                  label: "Unknown",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Number of Videos', angle: -90, position: 'insideLeft' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="entertainment" stackId="a" fill="var(--color-entertainment)" />
                  <Bar dataKey="educational" stackId="a" fill="var(--color-educational)" />
                  <Bar dataKey="unknown" stackId="a" fill="var(--color-unknown)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedDayVideos.length > 0 ? (
            selectedDayVideos.map((video: any, index: number) => {
              const videoId = getYouTubeVideoId(video.link)
              const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : '/placeholder.svg'

              return (
                <Card key={index} className="flex flex-col h-48">
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getCategoryIcon(video.category)}
                      <span className="truncate">{video.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 flex flex-1">
                    <div className="w-1/3 relative mr-3">
                      <a href={video.link} target="_blank" rel="noopener noreferrer">
                        <Image
                          src={thumbnailUrl}
                          alt={video.title}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-md"
                        />
                      </a>
                    </div>
                    <div className="w-2/3 flex flex-col justify-between text-xs">
                      <div>
                        <p><strong>Channel:</strong> {video.channel}</p>
                        <p><strong>Category:</strong> {video.category}</p>
                        <p><strong>Watched:</strong> {new Date(video.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <p>No videos for this date.</p>
          )}
        </div>
      )}
    </div>  
  )
}
