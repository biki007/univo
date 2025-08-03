'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/Navigation'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '@/components/ui'
import {
  AcademicCapIcon,
  BookOpenIcon,
  VideoCameraIcon,
  UserGroupIcon,
  ClockIcon,
  PlayIcon,
  DocumentTextIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: string
  students_enrolled: number
  progress?: number
  status: 'active' | 'completed' | 'upcoming'
  category: string
  thumbnail?: string
  lessons: number
  next_session?: string
}

interface Assignment {
  id: string
  title: string
  course: string
  due_date: string
  status: 'pending' | 'submitted' | 'graded'
  grade?: number
}

// Mock data for demonstration
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Advanced React Development',
    description: 'Learn advanced React patterns, hooks, and performance optimization techniques.',
    instructor: 'Dr. Sarah Johnson',
    duration: '8 weeks',
    students_enrolled: 45,
    progress: 65,
    status: 'active',
    category: 'Programming',
    lessons: 24,
    next_session: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    title: 'Digital Marketing Fundamentals',
    description: 'Comprehensive guide to modern digital marketing strategies and tools.',
    instructor: 'Prof. Michael Chen',
    duration: '6 weeks',
    students_enrolled: 32,
    progress: 100,
    status: 'completed',
    category: 'Marketing',
    lessons: 18
  },
  {
    id: '3',
    title: 'Data Science with Python',
    description: 'Introduction to data analysis, visualization, and machine learning with Python.',
    instructor: 'Dr. Emily Rodriguez',
    duration: '10 weeks',
    students_enrolled: 28,
    status: 'upcoming',
    category: 'Data Science',
    lessons: 30,
    next_session: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    title: 'UX/UI Design Principles',
    description: 'Learn the fundamentals of user experience and interface design.',
    instructor: 'Alex Thompson',
    duration: '5 weeks',
    students_enrolled: 38,
    progress: 25,
    status: 'active',
    category: 'Design',
    lessons: 15,
    next_session: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'React Component Optimization',
    course: 'Advanced React Development',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending'
  },
  {
    id: '2',
    title: 'Marketing Campaign Analysis',
    course: 'Digital Marketing Fundamentals',
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'graded',
    grade: 92
  },
  {
    id: '3',
    title: 'User Research Report',
    course: 'UX/UI Design Principles',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'submitted'
  }
]

export default function EducationPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'courses' | 'assignments'>('courses')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Check if user has education role access
  useEffect(() => {
    if (profile && !['admin', 'moderator'].includes(profile.role)) {
      // For demo purposes, allow all users to access education
      // In production, you might want to restrict this
    }
  }, [profile, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'completed': return 'primary'
      case 'upcoming': return 'warning'
      case 'pending': return 'warning'
      case 'submitted': return 'info'
      case 'graded': return 'success'
      default: return 'secondary'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const categories = Array.from(new Set(courses.map(course => course.category)))
  const activeCourses = courses.filter(c => c.status === 'active').length
  const completedCourses = courses.filter(c => c.status === 'completed').length
  const pendingAssignments = assignments.filter(a => a.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Education</h1>
            <p className="mt-2 text-gray-600">
              Access your courses, assignments, and learning materials
            </p>
          </div>
          {profile?.role === 'admin' && (
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpenIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{activeCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <AcademicCapIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <DocumentTextIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(courses.filter(c => c.progress).reduce((acc, c) => acc + (c.progress || 0), 0) / courses.filter(c => c.progress).length) || 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex p-1 mb-6 space-x-1 bg-gray-100 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'courses'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'assignments'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Assignments
          </button>
        </div>

        {activeTab === 'courses' && (
          <>
            {/* Filters and Search */}
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="transition-shadow hover:shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="mb-1 text-lg">{course.title}</CardTitle>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(course.status)} className="ml-2">
                        {course.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <AcademicCapIcon className="w-4 h-4 mr-2" />
                        <span>{course.instructor}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <span>{course.duration} • {course.lessons} lessons</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <UserGroupIcon className="w-4 h-4 mr-2" />
                        <span>{course.students_enrolled} students</span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">{course.category}</span>
                      </div>
                    </div>

                    {course.progress !== undefined && (
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {course.next_session && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Next session:</span> {formatDate(course.next_session)}
                      </div>
                    )}

                    <div className="flex pt-2 space-x-2">
                      {course.status === 'active' && (
                        <Button size="sm" className="flex-1">
                          <PlayIcon className="w-4 h-4 mr-2" />
                          Continue
                        </Button>
                      )}
                      
                      {course.status === 'upcoming' && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <BookOpenIcon className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      )}
                      
                      {course.status === 'completed' && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <DocumentTextIcon className="w-4 h-4 mr-2" />
                          Certificate
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-gray-900">
                        {assignment.title}
                      </h3>
                      <p className="mb-2 text-sm text-gray-600">
                        Course: {assignment.course}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Due: {formatDate(assignment.due_date)}</span>
                        {assignment.grade && (
                          <span className="font-medium text-green-600">
                            Grade: {assignment.grade}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge variant={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                      
                      {assignment.status === 'pending' && (
                        <Button size="sm">
                          <DocumentTextIcon className="w-4 h-4 mr-2" />
                          Submit
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty States */}
        {activeTab === 'courses' && filteredCourses.length === 0 && (
          <div className="py-12 text-center">
            <BookOpenIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No courses found</h3>
            <p className="mb-4 text-gray-600">
              {searchTerm || filterCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No courses are available at the moment'
              }
            </p>
          </div>
        )}

        {activeTab === 'assignments' && assignments.length === 0 && (
          <div className="py-12 text-center">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No assignments</h3>
            <p className="text-gray-600">
              You don&apos;t have any assignments at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}