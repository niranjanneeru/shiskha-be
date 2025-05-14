import { User, EnrolledCourse } from '../types';
import { coursesData } from './coursesData';

// Sample user data
export const userData: User = {
  id: '1',
  name: 'John Smith',
  email: 'john.smith@example.com',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600',
};

// Sample enrolled courses
export const enrolledCourses: EnrolledCourse[] = [
  {
    ...coursesData[0],
    progress: 65,
    startDate: '2023-09-15',
  },
  {
    ...coursesData[5],
    progress: 30,
    startDate: '2023-10-05',
  },
];