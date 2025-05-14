import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, BookOpen, Award, Users, TrendingUp as Trending } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import CourseCard from '../components/common/CourseCard';
import CategoryCard from '../components/common/CategoryCard';
import Button from '../components/common/Button';
import { categories } from '../data/coursesData';

const HomePage: React.FC = () => {
  const { courses } = useCourses();
  const [email, setEmail] = useState('');
  
  // Get featured courses (highest rated)
  const featuredCourses = [...courses]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);
  
  // Get popular courses (most enrolled)
  const popularCourses = [...courses]
    .sort((a, b) => b.enrolledCount - a.enrolledCount)
    .slice(0, 4);
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // This would typically connect to a newsletter service
    alert(`Thank you for subscribing with ${email}!`);
    setEmail('');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#0056D2] to-[#1E88E5] py-20">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Learn Without Limits
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Start, switch, or advance your career with courses, certificates and degrees from world-class universities and companies.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/courses">
                <Button variant="secondary" size="lg">
                  Explore Courses
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white/20">
                  Join for Free
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <img
              src="https://images.pexels.com/photos/7516363/pexels-photo-7516363.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="Students learning online"
              className="rounded-lg shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg hidden md:block">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-[#0056D2]">
                  <Users className="w-6 h-6" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Joined by</p>
                  <p className="font-bold text-gray-900">10M+ learners</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="container mx-auto px-4 mt-16">
          <div className="bg-white rounded-lg shadow-lg grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
            <div className="p-6 text-center">
              <p className="text-3xl font-bold text-[#0056D2]">7,000+</p>
              <p className="text-gray-600">Courses</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-3xl font-bold text-[#0056D2]">250+</p>
              <p className="text-gray-600">Specializations</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-3xl font-bold text-[#0056D2]">150+</p>
              <p className="text-gray-600">Universities</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-3xl font-bold text-[#0056D2]">10M+</p>
              <p className="text-gray-600">Learners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Browse Categories</h2>
            <Link to="/categories" className="text-[#0056D2] hover:underline flex items-center">
              View All Categories
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((category) => (
              <CategoryCard key={category} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
              <p className="text-gray-600 mt-2">Handpicked courses by our experts</p>
            </div>
            <Link to="/courses" className="text-[#0056D2] hover:underline flex items-center">
              View All Courses
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Most Popular</h2>
              <p className="text-gray-600 mt-2">Courses loved by thousands of learners</p>
            </div>
            <Link to="/courses" className="text-[#0056D2] hover:underline flex items-center">
              View All Courses
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Learn With Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide world-class learning experiences that will help you achieve your goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#0056D2] mx-auto mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Learning</h3>
              <p className="text-gray-600">
                Learn at your own pace, from anywhere in the world, on your schedule.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#0056D2] mx-auto mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Certificates</h3>
              <p className="text-gray-600">
                Earn industry-recognized credentials to showcase your skills.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#0056D2] mx-auto mb-4">
                <Trending className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Career Advancement</h3>
              <p className="text-gray-600">
                Gain in-demand skills that will help you take the next step in your career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#0056D2] to-[#1E88E5] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to start learning?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of students around the world and take the first step toward your goals.
          </p>
          <form onSubmit={handleSubscribe} className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
              required
            />
            <Button variant="secondary" size="lg" type="submit">
              Subscribe
            </Button>
          </form>
          <p className="text-sm mt-4 text-blue-100">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;