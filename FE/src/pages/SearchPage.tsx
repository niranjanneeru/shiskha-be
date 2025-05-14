import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import CourseCard from '../components/common/CourseCard';
import Button from '../components/common/Button';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const { filterCourses } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchTerm(query);
    }
  }, [location.search]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Update URL with search term
      const newUrl = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 500);
    }
  };
  
  const searchResults = filterCourses(undefined, searchTerm);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Courses</h1>
          
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for courses, topics, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0056D2] focus:border-transparent text-lg"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <SearchIcon className="h-6 w-6 text-gray-400" />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                isLoading={isSearching}
              >
                Search
              </Button>
            </div>
          </form>
        </div>
        
        {searchTerm && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isSearching ? 'Searching...' : `Search results for "${searchTerm}"`}
            </h2>
            <p className="text-gray-600">
              {searchResults.length} {searchResults.length === 1 ? 'course' : 'courses'} found
            </p>
          </div>
        )}
        
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any courses matching "{searchTerm}".
              Try adjusting your search terms or browse our categories.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
              <Button variant="primary" as="link" href="/categories">
                Browse Categories
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchPage;