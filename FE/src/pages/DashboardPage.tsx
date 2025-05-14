import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, BarChart, Calendar, Star, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import EnrolledCourseCard from '../components/common/EnrolledCourseCard';
import Button from '../components/common/Button';
import placeholder from '../assets/placeholder.png';
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { enrolledCourses, courses } = useCourses();
  
  // Get recommended courses (not enrolled yet and high rated)
  const recommendedCourses = courses
    .filter(course => !enrolledCourses.some(ec => ec.id === course.id))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
  
  // Calculate overall progress
  const overallProgress = enrolledCourses.length > 0
    ? Math.round(
        enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Dashboard Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <img
                src={placeholder}
                alt={"user image"}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
                <p className="text-gray-600">Continue your learning journey</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link to="/courses">
                <Button variant="primary">Browse Courses</Button>
              </Link>
              <Link to="/account">
                <Button variant="outline">Account Settings</Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Progress Overview */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Learning Progress</h2>
              
              {enrolledCourses.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Overall progress</span>
                    <span className="font-medium text-[#0056D2]">{overallProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                    <div
                      className="bg-[#0056D2] h-2.5 rounded-full"
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-[#0056D2] mb-1">{enrolledCourses.length}</div>
                      <div className="text-sm text-gray-600">Active Courses</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {enrolledCourses.filter(course => course.progress >= 50).length}
                      </div>
                      <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-yellow-600 mb-1">
                        {enrolledCourses.filter(course => course.progress === 100).length}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No courses yet</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't enrolled in any courses yet. Browse our catalog to get started.
                  </p>
                  <Link to="/courses">
                    <Button variant="primary">Explore Courses</Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* My Courses */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
                <Link to="/my-courses" className="text-[#0056D2] hover:underline flex items-center">
                  View All
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
              
              {enrolledCourses.length > 0 ? (
                <div className="space-y-6">
                  {enrolledCourses.map(course => (
                    <EnrolledCourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    When you enroll in courses, they'll appear here for easy access.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Recommended Courses */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended for You</h2>
              
              <div className="space-y-4">
                {recommendedCourses.map(course => (
                  <Link key={course.id} to={`/course/${course.id}`} className="block group">
                    <div className="flex items-start">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-20 h-16 object-cover rounded-lg"
                      />
                      <div className="ml-3 flex-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-[#0056D2] transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600">{course.instructor}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">{course.rating}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="mt-4">
                <Link to="/courses">
                  <Button variant="outline" fullWidth>
                    Browse More Courses
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Learning Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Stats</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0056D2]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Current Streak</p>
                    <p className="font-bold text-gray-900">3 days</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Learning Time</p>
                    <p className="font-bold text-gray-900">5.2 hours this week</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Achievements</p>
                    <p className="font-bold text-gray-900">3 badges earned</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <BarChart className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="font-bold text-gray-900">92%</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Link to="/stats">
                  <Button variant="outline" fullWidth>
                    View Detailed Stats
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Deadlines</h2>
              
              {enrolledCourses.length > 0 ? (
                <div className="space-y-4">
                  <div className="border-l-4 border-[#0056D2] pl-3">
                    <p className="font-medium text-gray-900">Assignment Due</p>
                    <p className="text-sm text-gray-600">Machine Learning Fundamentals</p>
                    <p className="text-sm text-red-600 font-medium">Tomorrow, 11:59 PM</p>
                  </div>
                  
                  <div className="border-l-4 border-[#0056D2] pl-3">
                    <p className="font-medium text-gray-900">Quiz</p>
                    <p className="text-sm text-gray-600">Data Structures and Algorithms</p>
                    <p className="text-sm text-gray-600">In 3 days</p>
                  </div>
                  
                  <div className="border-l-4 border-gray-300 pl-3">
                    <p className="font-medium text-gray-900">Course Completion</p>
                    <p className="text-sm text-gray-600">Introduction to React</p>
                    <p className="text-sm text-gray-600">In 2 weeks</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">
                  Deadlines from your enrolled courses will appear here.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;