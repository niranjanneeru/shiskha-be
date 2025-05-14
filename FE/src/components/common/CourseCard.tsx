import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Clock } from 'lucide-react';
import { Course } from '../../types';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <Link
      to={`/course/${course.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-0 right-0 bg-[#0056D2] text-white px-2 py-1 text-sm font-medium">
          {course.level}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <img 
            src="https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=600" 
            alt={course.institution}
            className="w-5 h-5 rounded-full mr-2"
          />
          <span>{course.institution}</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 font-medium">{course.rating}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4" />
            <span className="ml-1">{(course.enrolledCount / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="ml-1">{course.duration}</span>
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm font-medium">Instructor: <span className="text-[#0056D2]">{course.instructor}</span></div>
          <div className="font-bold text-lg">
            {course.price === 'Free' ? (
              <span className="text-green-600">Free</span>
            ) : (
              <span className="text-[#0056D2]">${course.price}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;