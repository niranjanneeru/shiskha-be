import { Course, Category } from '../types';

// Sample course data
export const coursesData: Course[] = [
  {
    id: '1',
    title: 'Machine Learning Fundamentals',
    description: 'Learn the core concepts of machine learning and how to apply them to real-world problems. This course covers supervised and unsupervised learning, neural networks, and practical implementations.',
    instructor: 'Andrew Ng',
    institution: 'Stanford University',
    thumbnail: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: '8 weeks',
    level: 'Intermediate',
    category: 'Data Science',
    rating: 4.8,
    enrolledCount: 245000,
    price: 49,
  },
  {
    id: '2',
    title: 'Introduction to React',
    description: 'Master React.js from the ground up. Learn components, state management, hooks, and build your own applications with the most popular front-end library.',
    instructor: 'Sarah Smith',
    institution: 'Meta',
    thumbnail: 'https://images.pexels.com/photos/1181373/pexels-photo-1181373.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: '6 weeks',
    level: 'Beginner',
    category: 'Computer Science',
    rating: 4.7,
    enrolledCount: 178350,
    price: 39,
  },
  {
    id: '3',
    title: 'Business Strategy and Innovation',
    description: 'Develop the skills to create innovative business strategies. Learn from real-world case studies and understand how to identify opportunities in the market.',
    instructor: 'Michael Porter',
    institution: 'Harvard Business School',
    thumbnail: 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: '5 weeks',
    level: 'Advanced',
    category: 'Business',
    rating: 4.6,
    enrolledCount: 123000,
    price: 59,
  },
  {
    id: '4',
    title: 'Digital Marketing Essentials',
    description: 'Learn how to create effective digital marketing campaigns across multiple platforms. Master SEO, social media marketing, email campaigns, and analytics.',
    instructor: 'Elena Rodriguez',
    institution: 'Google',
    thumbnail: 'https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: '4 weeks',
    level: 'Beginner',
    category: 'Business',
    rating: 4.5,
    enrolledCount: 156000,
    price: 29,
  },
  {
    id: '5',
    title: 'Introduction to Psychology',
    description: 'Explore the fascinating world of human behavior and mental processes. This course covers the major theories and research methods in psychology.',
    instructor: 'Robert Johnson',
    institution: 'Yale University',
    thumbnail: 'https://images.pexels.com/photos/355948/pexels-photo-355948.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: '7 weeks',
    level: 'Beginner',
    category: 'Social Sciences',
    rating: 4.9,
    enrolledCount: 189000,
    price: 'Free',
  },
  {
    id: '6',
    title: 'Data Structures and Algorithms',
    description: 'Master essential computer science concepts with a focus on practical implementations. Learn arrays, linked lists, trees, graphs, and algorithm analysis.',
    instructor: 'Priya Sharma',
    institution: 'MIT',
    thumbnail: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: '10 weeks',
    level: 'Intermediate',
    category: 'Computer Science',
    rating: 4.7,
    enrolledCount: 134000,
    price: 49,
  },
  {
    id: '7',
    title: 'Graphic Design Principles',
    description: 'Learn the fundamentals of visual design, typography, color theory, and composition. Create compelling designs for print and digital media.',
    instructor: 'David Wong',
    institution: 'Rhode Island School of Design',
    thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: '6 weeks',
    level: 'Beginner',
    category: 'Arts and Humanities',
    rating: 4.6,
    enrolledCount: 98000,
    price: 39,
  },
  {
    id: '8',
    title: 'Public Health and Epidemiology',
    description: 'Understand the principles of public health and disease prevention. Study disease patterns, health policy, and strategies for improving population health.',
    instructor: 'Maria Gonzalez',
    institution: 'Johns Hopkins University',
    thumbnail: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: '8 weeks',
    level: 'Intermediate',
    category: 'Health',
    rating: 4.8,
    enrolledCount: 76000,
    price: 49,
  },
];

export const categories: Category[] = [
  'Data Science',
  'Business',
  'Computer Science',
  'Health',
  'Arts and Humanities',
  'Social Sciences',
  'Personal Development',
  'Information Technology',
];