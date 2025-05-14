import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import DashboardPage from './pages/DashboardPage';
import SignupPage from './pages/SignupPage';
import CategoriesPage from './pages/CategoriesPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import CourseLearnPage from './pages/CourseLearnPage';
import { ChatBot } from './components/ChatBot';
import { Provider } from 'react-redux';
import { store } from './store/store';
import NewLogin from './pages/NewLogin';
import LoginPage from './components/login';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  return (
    <Provider store={store}>
      <AuthProvider>
        <CourseProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Header openLogin={() => setIsLoginOpen(true)} />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/course/:id" element={<CourseDetailsPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  {/* <Route path="/login" element={<LoginPage />} /> */}
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/course/:id/learn" element={<CourseLearnPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                  <Route path="/newlogin" element={<NewLogin />} />
                </Routes>
              </main>
              <Footer />
              <ChatBot />
              {isLoginOpen && <LoginPage onClose={() => setIsLoginOpen(false)} />}
            </div>
          </Router>
        </CourseProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;