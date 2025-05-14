    import React from 'react';
import Lady from "../assets/lady.jpeg";
import logo1 from "../assets/logo1.jpg";
import logo2 from "../assets/logo2.jpg";
import logo3 from "../assets/logo3.jpg";

const HeroSection = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Content */}
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2">
          <h1 className="text-[80px] font-bold mb-6">
            Learn without limits
          </h1>
          <p className="text-lg mb-8 text-gray-700">
            Start, switch, or advance your career with more than 10,000 courses,
            Professional Certificates, and degrees from world-class universities
            and companies.
          </p>
          <div className="space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-md text-xl">
              Join For Free
            </button>
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-gray-50 px-8 py-6 rounded-md text-xl">
              Try Business Solution
            </button>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="md:w-1/3 mt-8 md:mt-0">
          <div className="rounded-full p-8">
            <img 
              src={Lady}
              alt="Student"
              className="rounded-full w-full"
            />
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <div className="mt-20 text-center p-10">
        <h2 className="text-3xl font-semibold mb-12">
          We collaborate with <span className="text-blue-600">350+ leading institutions</span>
        </h2>
        
        <div className="grid grid-cols-6 gap-8 items-center">
          {/* Replace these with actual dummy logos */}
          {[logo1, logo2, logo3, logo1, logo2, logo3].map((logo,index) => (
            <div key={index} className="h-12 rounded flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;