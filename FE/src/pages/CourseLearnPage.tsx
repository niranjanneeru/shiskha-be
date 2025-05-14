import React, { useState, useRef } from "react";
import YouTube from "react-youtube";
import { ChevronRight, Menu, SmartDisplay } from "@mui/icons-material";
import "./CoursePage.css";

const getYouTubeVideoId = (url) => {
  // Handle different YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
};

const CoursePage = () => {
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [activeTab, setActiveTab] = useState("transcript");
  const [showQuiz, setShowQuiz] = useState(false);
  const playerRef = useRef(null);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sectionOpen, setSectionOpen] = useState({});

  // Example quiz data
  const quiz = {
    timePoint: 30, // Show quiz after 30 seconds
    question: "What did Gabriela say first?",
    options: [
      "Hello, I'm Gabriela",
      "Nice to meet you",
      "How are you?",
      "Good morning",
    ],
    correctAnswer: 0,
  };

  // Add new state for transcript data
  const [transcriptData] = useState([
    { time: 0, text: "Model situation 1: Gabriela Meets a New Colleague. You will see different interactions at the workplace, each focused on introductions." },
    { time: 15, text: "Please pay attention to the expressions used in the different scenarios." },
    { time: 30, text: "Watch Camila and Gabriela introducing themselves for the first time at Global Voice Publicity." },
    { time: 45, text: "It is Camila's first day of work. Good morning, are you Camila? Yes, I am, I'm the new journalist." },
    // Add more transcript entries as needed
  ]);

  const handleVideoStateChange = (event) => {
    // Check video time and show quiz at specific point
    const interval = setInterval(() => {
      const currentTime = event.target.getCurrentTime();
      if (currentTime >= quiz.timePoint && !showQuiz) {
        setShowQuiz(true);
        event.target.pauseVideo();
        clearInterval(interval);
      }
    }, 1000);
  };

  const handleQuizSubmit = (selectedOption) => {
    // Handle quiz submission
    setShowQuiz(false);
    playerRef.current?.target?.playVideo();
  };

  // Add function to handle timestamp click
  const handleTimestampClick = (time) => {
    if (playerRef.current) {
      // Access the player directly through the getInternalPlayer() method
      const player = playerRef.current.getInternalPlayer();
      if (player) {
        player.seekTo(time);
        player.playVideo();
      }
    }
  };

  const videos = [
    {
      title: "Model Situation 1: Gabriela meets a new colleague",
      items: [
        {
          id: getYouTubeVideoId("https://youtu.be/_uQrJ0TkZlc"),
          title: "Video: Model Situation 1: Gabriela meets a new colleague",
          duration: "2 min",
        },
      ],
    },
    {
      title: "Lesson 1: Introducing yourself and others",
      items: [
        {
          id: getYouTubeVideoId("https://youtu.be/_uQrJ0TkZlc"),
          title: "Video: Lesson 1: Introducing yourself and others",
          duration: "9 min",
        },
      ],
    },
    {
      title: "Simulated Interaction 1: Introduce yourself",
      items: [
        {
          id: getYouTubeVideoId("https://youtu.be/_uQrJ0TkZlc"),
          title: "Video: Simulated Interaction 1: Introduce yourself",
          duration: "2 min",
        },
      ],
    },
    // Add other sections similarly
  ];

  const tabs = [
    { id: "transcript", label: "Transcript" },
    { id: "notes", label: "Notes" },
    { id: "downloads", label: "Downloads" },
    { id: "discuss", label: "Discuss" },
  ];

  return (
    <div className="course-container">

      <div className="content-wrapper">
        {/* Sidebar */}
        <aside
          className={`sidebar transition-all duration-300 ${
            isSidebarOpen ? "sidebar-open" : "sidebar"
          }`}
        >
          <div
            className="flex items-center gap-2 p-4 cursor-pointer"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="w-4 h-4 text-blue-500" />
            {isSidebarOpen && (
              <span className="text-sm text-blue-500 font-semibold whitespace-nowrap">
                Hide menu
              </span>
            )}
          </div>

          {isSidebarOpen && (
            <>
              {videos.map((section, sectionIndex) => (
                <div key={sectionIndex} className="section mb-4 w-full">
                  <h3
                    className="text-sm font-semibold px-4 py-2 text-black"
                    onClick={() =>
                      setSectionOpen((prev) => ({
                        ...prev,
                        [sectionIndex]: !prev[sectionIndex],
                      }))
                    }
                  >
                    {section.title}
                  </h3>
                  {sectionOpen[sectionIndex] &&
                    section.items.map((video, videoIndex) => (
                      <div
                        key={videoIndex}
                        className={`flex items-start gap-3 px-4 py-2 cursor-pointer transition-colors ${
                        selectedVideo === videoIndex
                          ? "bg-[#EDF5FF] border-l-4 border-blue-600 pl-3"
                          : "hover:bg-[#F8F9FB]"
                      }`}
                      onClick={() => setSelectedVideo(videoIndex)}
                    >
                      <span className="text-green-600 mt-1"><SmartDisplay /></span>
                      <div className="flex flex-col">
                      <span className="text-black"><span className="text-sm font-semibold text-black">Video:</span>
                        <span className="text-sm">{video.title}</span></span>
                        <span className="text-xs text-gray-500 font-semibold">
                          {video.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <span className="text-blue-500 text-sm">
              English for Common Interactions in the Workplace: Basic Level
            </span>
            <ChevronRight className="w-4 h-4 mx-4" />
            <span className="text-blue-500 text-sm">Module 2</span>
            <ChevronRight className="w-4 h-4 mx-4" />
            <span className="text-blue-500 text-sm">
              Model Situation 1: Gabriela meets a new colleague
            </span>
          </div>
          <div className="video-container rounded-lg overflow-hidden relative">
            {showQuiz && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4">
                  <h3 className="text-xl font-bold mb-4">{quiz.question}</h3>
                  <div className="space-y-2">
                    {quiz.options.map((option, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-3 rounded border hover:bg-blue-50 transition-colors"
                        onClick={() => handleQuizSubmit(index)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <YouTube
              ref={playerRef}
              videoId={videos[selectedVideo].items[0].id}
              opts={{
                width: "100%",
                height: "700px",
                playerVars: {
                  autoplay: 0,
                },
              }}
              onStateChange={handleVideoStateChange}
            />
          </div>

          <div className="video-details">
            <h2 className="text-2xl font-semibold text-black mb-2">
              {videos[selectedVideo].items[0].title}
            </h2>

            {/* Tabs */}
            <div className="tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab font-semibold ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === "transcript" && (
                <div className="transcript">
                  <div className="transcript-header flex justify-between items-center p-4 border-b">
                    <span className="text-sm text-gray-600">Transcript language: English</span>
                    <button className="text-blue-600 text-sm hover:underline">
                      Download transcript
                    </button>
                  </div>
                  <div className="transcript-content m-auto">
                    {transcriptData.map((entry, index) => (
                      <div 
                        key={index} 
                        className="transcript-entry flex gap-4 mb-4 hover:bg-gray-50 p-2 rounded overflow-scroll"
                      >
                        <button
                          onClick={() => handleTimestampClick(entry.time)}
                          className="transcript-timestamp text-blue-600 hover:underline whitespace-nowrap"
                        >
                          {Math.floor(entry.time / 60)}:{String(entry.time % 60).padStart(2, '0')}
                        </button>
                        <p className="transcript-text text-gray-700">{entry.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Add other tab contents */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoursePage;
