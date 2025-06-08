"use client"
import React, { useState } from "react";
import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  Shield,
  Brain,
  PlayCircle,
  ChevronRight,
  Calendar,
  Clock
} from "lucide-react";

const videos = {
  Beginner: [
    {
      videolink: "https://www.youtube.com/watch?v=p3OUFMpT7B0",
      title: "How to Invest For Beginners (2023 Step-by-Step Guide)",
      description:
        "A comprehensive guide for beginners on how to start investing in 2023, covering various investment strategies and tips.",
      duration: "45 min",
      modules: 1,
      progress: 0,
    },
    {
      videolink: "https://www.youtube.com/watch?v=ZCFkWDdmXG8",
      title: "Understanding the Stock Market for Beginners",
      description:
        "An easy-to-understand explanation of how the stock market works, tailored for those new to investing.",
      duration: "30 min",
      modules: 1,
      progress: 0,
    },
  ],
  Intermediate: [
    {
      videolink: "https://www.youtube.com/watch?v=gFQNPmLKj1k",
      title: "5 Ways to Save Money Fast - Financial Hacks",
      description:
        "Learn five effective strategies to save money quickly and improve your financial situation with practical tips.",
      duration: "25 min",
      modules: 1,
      progress: 0,
    },
    {
      videolink: "https://www.youtube.com/watch?v=M3r2XDceM6A",
      title: "Investment Strategies and Portfolio Management",
      description:
        "Learn about different investment strategies and how to manage your portfolio effectively.",
      duration: "35 min",
      modules: 1,
      progress: 0,
    },
  ],
  Advanced: [
    {
      videolink: "https://www.youtube.com/watch?v=WEDIj9JBTC8",
      title: "Advanced Stock Trading Strategies",
      description:
        "Discover advanced trading strategies and techniques for experienced investors.",
      duration: "40 min",
      modules: 1,
      progress: 0,
    },
  ],
};

const courses = [
  {
    level: "Beginner",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-600",
    courses: [
      {
        title: "Introduction to Investing",
        description: "Learn the basics of investing and financial markets",
        duration: "2 hours",
        modules: 5,
        progress: 80,
      },
      {
        title: "Understanding Stocks",
        description: "Master the fundamentals of stock market investing",
        duration: "3 hours",
        modules: 8,
        progress: 60,
      },
    ],
  },
  {
    level: "Intermediate",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-600",
    courses: [
      {
        title: "Technical Analysis",
        description: "Learn to analyze market trends and patterns",
        duration: "4 hours",
        modules: 10,
        progress: 30,
      },
      {
        title: "Portfolio Management",
        description: "Master the art of building and managing investments",
        duration: "3 hours",
        modules: 6,
        progress: 0,
      },
    ],
  },
  {
    level: "Advanced",
    icon: Brain,
    color: "bg-amber-100 text-amber-600",
    courses: [
      {
        title: "AI in Trading",
        description: "Explore how AI is revolutionizing trading",
        duration: "5 hours",
        modules: 12,
        progress: 0,
      },
      {
        title: "Risk Management",
        description: "Advanced strategies for managing investment risks",
        duration: "4 hours",
        modules: 8,
        progress: 0,
      },
    ],
  },
];

const Learn = () => {
  const [selectedLevel, setSelectedLevel] = useState("Beginner");
  const [selectedVideo, setSelectedVideo] = useState(null);

  const getVideoId = (url) => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const getCurrentLevel = () => {
    return courses.find((c) => c.level === selectedLevel);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Learning Center
            </h1>
            <p className="mt-2 text-gray-600">
              Expand your knowledge with our curated learning materials
            </p>
          </div>
          <button className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-md">
            <GraduationCap className="h-5 w-5 mr-2" />
            Track Progress
          </button>
        </div>

        {/* Video Player */}
        {selectedVideo && (
          <div className="mb-12 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={`https://www.youtube.com/embed/${getVideoId(
                  selectedVideo
                )}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow"
              ></iframe>
            </div>
            <button
              onClick={() => setSelectedVideo(null)}
              className="mt-6 inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition"
            >
              Close Video
            </button>
          </div>
        )}

        {/* Level Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {courses.map(({ level, icon: Icon, color }) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`flex items-center p-6 rounded-xl ${
                selectedLevel === level
                  ? "bg-white border-2 border-blue-500 shadow-lg"
                  : "bg-white border border-gray-100 shadow hover:shadow-md"
              } transition-all duration-200`}
            >
              <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="ml-4 text-left">
                <h3 className={`font-semibold ${
                  selectedLevel === level ? "text-blue-600" : "text-gray-900"
                }`}>
                  {level}
                </h3>
                <p className="text-sm text-gray-500">
                  {level === "Beginner" 
                    ? "Start your journey" 
                    : level === "Intermediate" 
                      ? "Deepen your knowledge" 
                      : "Master advanced concepts"}
                </p>
              </div>
              {selectedLevel === level && (
                <div className="ml-auto">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Course and Video Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Regular Courses */}
          {getCurrentLevel()?.courses.map((course, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    <Shield className="h-4 w-4" />
                    <span>{course.modules} modules</span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`${
                        course.progress > 0 ? "bg-blue-600" : "bg-gray-300"
                      } h-2.5 rounded-full transition-all duration-300`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.duration}</span>
                  </div>
                  <button className={`px-4 py-2 rounded-lg font-medium ${
                    course.progress > 0 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  } transition shadow`}>
                    {course.progress > 0 ? "Continue" : "Start Course"}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Video Courses */}
          {videos[selectedLevel]?.map((video, index) => (
            <div
              key={`video-${index}`}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => setSelectedVideo(video.videolink)}
                    className="flex-shrink-0 bg-red-100 text-red-600 rounded-lg p-3"
                  >
                    <PlayCircle className="h-6 w-6" />
                  </button>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {video.title}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {video.description}
                    </p>

                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{video.duration}</span>
                      </div>
                      <button
                        onClick={() => setSelectedVideo(video.videolink)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow transition"
                      >
                        Watch Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Path */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Your Learning Path
          </h2>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
            <div className="relative">
              {[
                { 
                  title: "Complete Beginner Courses", 
                  status: "In Progress",
                  description: "Master the fundamentals of investing and markets"
                },
                { 
                  title: "Start Technical Analysis", 
                  status: "Upcoming",
                  description: "Learn to analyze market trends and make data-driven decisions"
                },
                { 
                  title: "Master Portfolio Management", 
                  status: "Upcoming",
                  description: "Build and manage a diversified investment portfolio"
                },
                { 
                  title: "Explore Advanced Topics", 
                  status: "Upcoming",
                  description: "Dive into AI-powered trading and sophisticated risk management"
                },
              ].map((step, index) => (
                <div key={index} className="flex items-start mb-12 last:mb-0">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    index === 0 
                      ? "bg-blue-100 text-blue-600" 
                      : "bg-gray-100 text-gray-500"
                  } font-semibold text-lg`}>
                    {index + 1}
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-gray-600">{step.description}</p>
                    <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      step.status === "In Progress" 
                        ? "bg-blue-100 text-blue-600" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {step.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;