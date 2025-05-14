import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Clock, Users, BookOpen, Award, CheckCircle, Calendar, FileText, Video, Download } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { useLazyGetCourseDetailsQuery, useLazyGetCoursesQuery } from '../store/api/codeApi';

// Sample curriculum data
const curriculumData = [
  {
    id: '1',
    title: 'Introduction to the Course',
    duration: '10 mins',
    type: 'video',
    isPreview: true,
    items: [
      { id: '1-1', title: 'Welcome to the Course', duration: '2 mins', type: 'video' },
      { id: '1-2', title: 'Course Overview', duration: '5 mins', type: 'video' },
      { id: '1-3', title: 'How to Get the Most Out of This Course', duration: '3 mins', type: 'video' },
    ],
  },
  {
    id: '2',
    title: 'Getting Started with the Fundamentals',
    duration: '45 mins',
    type: 'module',
    isPreview: false,
    items: [
      { id: '2-1', title: 'Core Concepts', duration: '15 mins', type: 'video' },
      { id: '2-2', title: 'Basic Principles', duration: '10 mins', type: 'video' },
      { id: '2-3', title: 'Hands-on Exercise', duration: '15 mins', type: 'practice' },
      { id: '2-4', title: 'Quiz: Test Your Knowledge', duration: '5 mins', type: 'quiz' },
    ],
  },
  {
    id: '3',
    title: 'Advanced Techniques',
    duration: '1 hr 20 mins',
    type: 'module',
    isPreview: false,
    items: [
      { id: '3-1', title: 'Advanced Strategy 1', duration: '20 mins', type: 'video' },
      { id: '3-2', title: 'Advanced Strategy 2', duration: '25 mins', type: 'video' },
      { id: '3-3', title: 'Case Study Analysis', duration: '15 mins', type: 'reading' },
      { id: '3-4', title: 'Practical Application', duration: '15 mins', type: 'practice' },
      { id: '3-5', title: 'Quiz: Advanced Concepts', duration: '5 mins', type: 'quiz' },
    ],
  },
  {
    id: '4',
    title: 'Final Project and Conclusion',
    duration: '45 mins',
    type: 'module',
    isPreview: false,
    items: [
      { id: '4-1', title: 'Project Requirements', duration: '10 mins', type: 'reading' },
      { id: '4-2', title: 'Final Project Walkthrough', duration: '20 mins', type: 'video' },
      { id: '4-3', title: 'Course Summary', duration: '10 mins', type: 'video' },
      { id: '4-4', title: 'What\'s Next?', duration: '5 mins', type: 'video' },
    ],
  },
];

// Icon map for curriculum items
const getItemIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'quiz':
      return <FileText className="w-4 h-4" />;
    case 'reading':
      return <BookOpen className="w-4 h-4" />;
    case 'practice':
      return <Download className="w-4 h-4" />;
    default:
      return <Video className="w-4 h-4" />;
  }
};

const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCourseById, enrollInCourse, enrolledCourses } = useCourses();
  const [getCourseDetails, { data: courseDetails }] = useLazyGetCourseDetailsQuery();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'about' | 'curriculum' | 'instructor'>('about');
  const [expandedSections, setExpandedSections] = useState<string[]>(['1']);

  useEffect(() => {
    getCourseDetails(id || '');
  }, [getCourseDetails, id]);
  
  const course = getCourseById(id || '');
  const isEnrolled = enrolledCourses.some(c => c.id === id);
  
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
        <p className="text-black-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
        <Link to="/courses">
          <Button>Back to Courses</Button>
        </Link>
      </div>
    );
  }

  const toggleSection = (sectionId: string) => {
    if (expandedSections.includes(sectionId)) {
      setExpandedSections(expandedSections.filter(id => id !== sectionId));
    } else {
      setExpandedSections([...expandedSections, sectionId]);
    }
  };
  
  const handleEnroll = () => {
    if (!isAuthenticated) {
      // Redirect to login first
      window.location.href = `/login?redirect=/course/${id}`;
      return;
    }
    
    enrollInCourse(id || '');
  };

  const totalLessons = curriculumData.reduce(
    (total, section) => total + section.items.length,
    0
  );

  const totalDuration = curriculumData.reduce(
    (total, section) => {
      let sectionMinutes = 0;
      section.items.forEach(item => {
        const time = item.duration.match(/(\d+)/g);
        if (time && time[0]) {
          sectionMinutes += parseInt(time[0], 10);
        }
      });
      return total + sectionMinutes;
    },
    0
  );

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Course Details */}
            <div className="lg:w-2/3">
              <div className="mb-4">
                <span className="bg-blue-100 text-[#0056D2] text-sm font-medium px-3 py-1 rounded-full">
                  {courseDetails?.specialisation?.name}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">{courseDetails?.name}</h1>
              <p className="text-black-100 text-lg mb-6">{courseDetails?.data?.about}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center text-black">
                  <Star className="w-5 h-5 text-yellow-300 fill-current" />
                  <span className="ml-1 font-medium">{courseDetails?.rating}</span>
                  <span className="ml-1 text-black-100">({courseDetails?.data?.number_of_reviews}k students)</span>
                </div>
                <div className="flex items-center text-black">
                  <Clock className="w-5 h-5" />
                  <span className="ml-1">{courseDetails?.data?.number_of_hours} hours</span>
                </div>
                <div className="flex items-center text-black">
                  <BookOpen className="w-5 h-5" />
                  <span className="ml-1">{courseDetails?.data?.number_of_modules} lessons</span>
                </div>
                <div className="flex items-center text-black">
                  <Award className="w-5 h-5" />
                  <span className="ml-1">{courseDetails?.data?.level}</span>
                </div>
              </div>
              
              {courseDetails?.data?.instructors?.slice(0, 1).map(instructor => (<div className="flex items-center">
                <img 
                  src={instructor?.profile_pic}
                  alt={instructor?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <p className="text-black font-medium">{instructor?.name}</p>
                  <p className="text-black-100 text-sm">{instructor?.university}</p>
                </div>
              </div>
            ))}
            </div>
            
            {/* Course Card */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center">
                      <Play className="w-6 h-6 text-[#0056D2] ml-1" fill="currentColor" />
                    </div>
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-3xl font-bold text-black-900 mb-1">
                      {course.price === 'Free' ? 'Free' : `$${course.price}`}
                    </p>
                    {course.price !== 'Free' && (
                      <p className="text-sm text-black-600">Full lifetime access</p>
                    )}
                  </div>
                  
                  {isEnrolled ? (
                    <Link to={`/course/${id}/learn`}>
                      <Button variant="secondary" fullWidth className="mb-4">
                        Go to Course
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="primary" fullWidth className="mb-4" onClick={handleEnroll}>
                      {course.price === 'Free' ? 'Enroll for Free' : 'Enroll Now'}
                    </Button>
                  )}
                  
                  <Button variant="outline" fullWidth>
                    Try for Free
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex -mb-px">
                <button
                  className={`pb-4 px-1 mr-8 font-medium ${
                    activeTab === 'about'
                      ? 'text-[#0056D2] border-b-2 border-[#0056D2]'
                      : 'text-black-500 hover:text-black-700'
                  }`}
                  onClick={() => setActiveTab('about')}
                >
                  About
                </button>
                <button
                  className={`pb-4 px-1 mr-8 font-medium ${
                    activeTab === 'curriculum'
                      ? 'text-[#0056D2] border-b-2 border-[#0056D2]'
                      : 'text-black-500 hover:text-black-700'
                  }`}
                  onClick={() => setActiveTab('curriculum')}
                >
                  Curriculum
                </button>
                <button
                  className={`pb-4 px-1 mr-8 font-medium ${
                    activeTab === 'instructor'
                      ? 'text-[#0056D2] border-b-2 border-[#0056D2]'
                      : 'text-black-500 hover:text-black-700'
                  }`}
                  onClick={() => setActiveTab('instructor')}
                >
                  Instructor
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            {activeTab === 'about' && (
              <div>
                <h2 className="text-2xl font-bold text-black-900 mb-4">About this course</h2>
                <p className="text-black-700 mb-6">{course.description}</p>
                
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-black-900 mb-3">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-[#0056D2] mt-0.5" />
                      <span className="ml-2 text-black-700">Understand core principles and concepts</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-[#0056D2] mt-0.5" />
                      <span className="ml-2 text-black-700">Apply techniques to real-world problems</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-[#0056D2] mt-0.5" />
                      <span className="ml-2 text-black-700">Develop critical thinking skills</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-[#0056D2] mt-0.5" />
                      <span className="ml-2 text-black-700">Build your professional portfolio</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-[#0056D2] mt-0.5" />
                      <span className="ml-2 text-black-700">Master advanced strategies</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-[#0056D2] mt-0.5" />
                      <span className="ml-2 text-black-700">Gain industry-relevant expertise</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-black-900 mb-3">Requirements</h3>
                  <ul className="list-disc pl-5 space-y-2 text-black-700">
                    <li>Basic understanding of the subject matter</li>
                    <li>No prior advanced knowledge required</li>
                    <li>A computer with internet access</li>
                    <li>Willingness to learn and practice</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-black-900 mb-3">This course is for</h3>
                  <ul className="list-disc pl-5 space-y-2 text-black-700">
                    <li>Beginners looking to learn the fundamentals</li>
                    <li>Intermediate learners who want to solidify their knowledge</li>
                    <li>Professionals seeking to update their skills</li>
                    <li>Anyone interested in gaining practical expertise in this field</li>
                  </ul>
                </div>
              </div>
            )}
            
            {activeTab === 'curriculum' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-black-900">Course Curriculum</h2>
                  <div className="text-sm text-black-600">
                    {totalLessons} lessons ({formatDuration(totalDuration)})
                  </div>
                </div>
                
                <div className="space-y-4">
                  {curriculumData.map((section) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className="flex items-center">
                          <BookOpen className="w-5 h-5 text-black-600 mr-2" />
                          <h3 className="font-medium text-black-900">{section.title}</h3>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-black-600 mr-3">
                            {section.items.length} lessons • {section.duration}
                          </span>
                          <svg
                            className={`w-5 h-5 text-black-600 transform transition-transform ${
                              expandedSections.includes(section.id) ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {expandedSections.includes(section.id) && (
                        <div className="p-4 border-t border-gray-200 divide-y divide-gray-200">
                          {section.items.map((item) => (
                            <div
                              key={item.id}
                              className="py-3 flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                {getItemIcon(item.type)}
                                <span className="ml-2 text-black-800">{item.title}</span>
                                {item.id === '1-1' && section.isPreview && (
                                  <span className="ml-2 text-xs bg-blue-100 text-[#0056D2] px-2 py-0.5 rounded-full">
                                    Preview
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-black-600">{item.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'instructor' && (
              <div>
                <h2 className="text-2xl font-bold text-black-900 mb-6">Instructor</h2>
                <div className="flex items-start">
                  <img
                    src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600"
                    alt={course.instructor}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="ml-6">
                    <h3 className="text-xl font-bold text-black-900 mb-1">{course.instructor}</h3>
                    <p className="text-black-600 mb-3">Instructor at {course.institution}</p>
                    
                    <div className="flex items-center mb-4">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-black-800">4.8 Instructor Rating</span>
                    </div>
                    
                    <div className="flex space-x-4 mb-6">
                      <div className="text-center">
                        <div className="text-xl font-bold text-black-900">143</div>
                        <div className="text-sm text-black-600">Reviews</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-black-900">23,567</div>
                        <div className="text-sm text-black-600">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-black-900">8</div>
                        <div className="text-sm text-black-600">Courses</div>
                      </div>
                    </div>
                    
                    <p className="text-black-700">
                      An expert in the field with over 10 years of experience. Specializes in making complex topics accessible to learners of all levels. Passionate about education and helping students achieve their goals.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;