// Type definitions for the Coursera clone

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  institution: string;
  thumbnail: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  rating: number;
  enrolledCount: number;
  price: number | 'Free';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface EnrolledCourse extends Course {
  progress: number;
  startDate: string;
}

export type Category = 
  | 'Data Science'
  | 'Business'
  | 'Computer Science'
  | 'Health'
  | 'Arts and Humanities'
  | 'Social Sciences'
  | 'Personal Development'
  | 'Information Technology';