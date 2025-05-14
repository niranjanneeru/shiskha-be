import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, Filter, X } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import CourseCard from '../components/common/CourseCard';
import Button from '../components/common/Button';
import { categories } from '../data/coursesData';
import { Course } from '../types';

const CoursesPage: React.FC = () => {
  const location = useLocation();
  const { filterCourses } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  // Parse URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const queryParam = params.get('q');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (queryParam) {
      setSearchTerm(queryParam);
    }
  }, [location.search]);

  // Filter courses when filters change
  useEffect(() => {
    let filtered = filterCourses(
      selectedCategory === 'All' ? undefined : selectedCategory
    );
    
    if (searchTerm) {
      filtered = filtered.filter(
        course =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.institution.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedLevel !== 'All') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }
    
    setFilteredCourses(filtered);
  }, [filterCourses, selectedCategory, searchTerm, selectedLevel]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedLevel('All');
    setSearchTerm('');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Courses</h1>
            <p className="text-gray-600">Discover courses to take your skills to the next level</p>
          </div>
          
          <Button 
            variant="outline" 
            className="mt-4 md:mt-0 flex items-center md:hidden"
            onClick={toggleFilters}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row">
          {/* Filters Sidebar */}
          <div className={`md:w-1/4 md:pr-6 md:block ${showFilters ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-[#0056D2] hover:underline flex items-center"
                >
                  Clear All
                  <X className="ml-1 w-4 h-4" />
                </button>
              </div>
              
              {/* Search */}
              <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search courses..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0056D2]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="category-all"
                      name="category"
                      className="h-4 w-4 text-[#0056D2] focus:ring-[#0056D2]"
                      checked={selectedCategory === 'All'}
                      onChange={() => setSelectedCategory('All')}
                    />
                    <label htmlFor="category-all" className="ml-2 text-sm text-gray-700">
                      All Categories
                    </label>
                  </div>
                  
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <input
                        type="radio"
                        id={`category-${category}`}
                        name="category"
                        className="h-4 w-4 text-[#0056D2] focus:ring-[#0056D2]"
                        checked={selectedCategory === category}
                        onChange={() => setSelectedCategory(category)}
                      />
                      <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Levels */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Level</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="level-all"
                      name="level"
                      className="h-4 w-4 text-[#0056D2] focus:ring-[#0056D2]"
                      checked={selectedLevel === 'All'}
                      onChange={() => setSelectedLevel('All')}
                    />
                    <label htmlFor="level-all" className="ml-2 text-sm text-gray-700">
                      All Levels
                    </label>
                  </div>
                  
                  {levels.map((level) => (
                    <div key={level} className="flex items-center">
                      <input
                        type="radio"
                        id={`level-${level}`}
                        name="level"
                        className="h-4 w-4 text-[#0056D2] focus:ring-[#0056D2]"
                        checked={selectedLevel === level}
                        onChange={() => setSelectedLevel(level)}
                      />
                      <label htmlFor={`level-${level}`} className="ml-2 text-sm text-gray-700">
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Course Grid */}
          <div className="md:w-3/4">
            {filteredCourses.length > 0 ? (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-gray-600">{filteredCourses.length} courses found</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#0056D2] mx-auto mb-4">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any courses matching your filters. Try adjusting your search criteria.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;