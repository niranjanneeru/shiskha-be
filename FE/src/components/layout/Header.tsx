import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import shiksha from '../../assets/shiksha.png';
import placeholder from '../../assets/placeholder.png';
const Header: React.FC = ({openLogin}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const logout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <img src={shiksha} alt="logo" className="w-44" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/courses" className="text-gray-700 hover:text-[#0056D2] transition-colors">
              Explore
            </Link>
            {/* <Link to="/categories" className="text-gray-700 hover:text-[#0056D2] transition-colors">
              Categories
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-[#0056D2] transition-colors">
              About
            </Link> */}
          </nav>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center mx-4 flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for courses..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0056D2] focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <button
              type="submit"
              className="ml-2 bg-[#0056D2] text-white rounded-full px-4 py-2 hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center relative">
                <div 
                  className="flex items-center mr-4 cursor-pointer"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                  <img
                    src={placeholder}
                    alt={"user image"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-10 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
                    <Link to="/purchases" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">My Purchases</Link>
                    <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Settings</Link>
                    <hr className="my-1" />
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div
                  onClick={openLogin}
                  className="text-[#0056D2] hover:text-blue-700 transition-colors"
                >
                  Log In
                </div>
                <Link
                  to="/signup"
                  className="bg-[#0056D2] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-[#0056D2] transition-colors"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for courses..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0056D2] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <button
                type="submit"
                className="mt-2 w-full bg-[#0056D2] text-white rounded-full px-4 py-2 hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </form>

            <nav className="flex flex-col space-y-3">
              <Link
                to="/courses"
                className="text-gray-700 hover:text-[#0056D2] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                to="/categories"
                className="text-gray-700 hover:text-[#0056D2] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-[#0056D2] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
            </nav>

            <div className="mt-4 pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/dashboard"
                    className="flex items-center py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-2" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center text-red-600 py-2"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/login"
                    className="bg-white text-[#0056D2] border border-[#0056D2] px-4 py-2 rounded-md text-center hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-[#0056D2] text-white px-4 py-2 rounded-md text-center hover:bg-blue-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;