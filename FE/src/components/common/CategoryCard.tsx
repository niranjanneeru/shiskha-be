import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types';

// Map categories to appropriate icons/images
const getCategoryImage = (category: Category): string => {
  const categoryImages: Record<Category, string> = {
    'Data Science': 'https://images.pexels.com/photos/1181377/pexels-photo-1181377.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Business': 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Computer Science': 'https://images.pexels.com/photos/943096/pexels-photo-943096.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Health': 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Arts and Humanities': 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Social Sciences': 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Personal Development': 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=600',
    'Information Technology': 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=600',
  };
  
  return categoryImages[category];
};

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link 
      to={`/courses?category=${encodeURIComponent(category)}`}
      className="relative overflow-hidden rounded-lg group cursor-pointer transform transition-transform duration-300 hover:scale-[1.02]"
    >
      <div className="aspect-w-16 aspect-h-9 relative h-40">
        <img
          src={getCategoryImage(category)}
          alt={category}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h3 className="text-white text-lg font-bold">{category}</h3>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;