import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Course, EnrolledCourse } from '../types';
import { coursesData } from '../data/coursesData';
import { enrolledCourses as initialEnrolledCourses } from '../data/userData';

interface CourseContextType {
  courses: Course[];
  enrolledCourses: EnrolledCourse[];
  enrollInCourse: (courseId: string) => void;
  unenrollFromCourse: (courseId: string) => void;
  filterCourses: (category?: string, searchTerm?: string) => Course[];
  getCourseById: (id: string) => Course | undefined;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [courses] = useState<Course[]>(coursesData);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>(initialEnrolledCourses);

  const enrollInCourse = (courseId: string) => {
    // Check if already enrolled
    if (enrolledCourses.some(course => course.id === courseId)) {
      return;
    }

    // Find the course
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // Create a new enrolled course with progress tracking
    const newEnrolledCourse: EnrolledCourse = {
      ...course,
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
    };

    setEnrolledCourses([...enrolledCourses, newEnrolledCourse]);
  };

  const unenrollFromCourse = (courseId: string) => {
    setEnrolledCourses(enrolledCourses.filter(course => course.id !== courseId));
  };

  const filterCourses = (category?: string, searchTerm?: string): Course[] => {
    let filtered = courses;

    if (category && category !== 'All') {
      filtered = filtered.filter(course => course.category === category);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        course =>
          course.title.toLowerCase().includes(term) ||
          course.description.toLowerCase().includes(term) ||
          course.instructor.toLowerCase().includes(term) ||
          course.institution.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const getCourseById = (id: string): Course | undefined => {
    return courses.find(course => course.id === id);
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        enrolledCourses,
        enrollInCourse,
        unenrollFromCourse,
        filterCourses,
        getCourseById,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = (): CourseContextType => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};