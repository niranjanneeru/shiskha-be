import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { EnrolledCourse } from '../../types';

interface EnrolledCourseCardProps {
  course: EnrolledCourse;
}

const EnrolledCourseCard: React.FC<EnrolledCourseCardProps> = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 h-40 md:h-auto">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-4 md:w-2/3">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <img 
              src="https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=600" 
              alt={course.institution}
              className="w-5 h-5 rounded-full mr-2"
            />
            <span>{course.institution}</span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-[#0056D2]">{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#0056D2] h-2 rounded-full"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Started on {new Date(course.startDate).toLocaleDateString()}
            </div>
            <Link
              to={`/course/${course.id}`}
              className="flex items-center text-[#0056D2] hover:underline font-medium"
            >
              Continue Learning
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrolledCourseCard;