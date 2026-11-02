import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Cursor from "./components/Cursor";
import ScrollProgress from "./components/ScrollProgress";
import Robot3DBackground from "./components/Robot3DBackground";

import Portfolio from "./pages/Portfolio";

import Home from "./pages/Home";
import About from "./pages/About";
import Education from "./pages/Education";
import Skills from "./pages/Skills";
import Projects from "./pages/Projects";
import Resume from "./pages/Resume";
import Contact from "./pages/Contact";

import "./components/GlassPanel.css";
import "./App.css";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        {/* =========================================
            NAVIGATION
        ========================================= */}

        <Navbar />

        {/* =========================================
            3D ROBOT BACKGROUND
        ========================================= */}

        <Robot3DBackground />

        {/* =========================================
            GLOBAL CURSOR
        ========================================= */}

        <Cursor />

        {/* =========================================
            SCROLL PROGRESS
        ========================================= */}

        <ScrollProgress />

        {/* =========================================
            PAGE CONTENT
        ========================================= */}

        <main className="main-content">
          <Routes>
            {/* =========================================
                SCROLLING PORTFOLIO
            ========================================= */}

            <Route path="/" element={<Portfolio />} />

            {/* =========================================
                INDIVIDUAL PAGES
            ========================================= */}

            <Route path="/home" element={<Home />} />

            <Route path="/about" element={<About />} />

            <Route path="/education" element={<Education />} />

            <Route path="/skills" element={<Skills />} />

            <Route path="/projects" element={<Projects />} />

            <Route path="/resume" element={<Resume />} />

            <Route path="/contact" element={<Contact />} />

            <Route path="/admin" element={<AdminLogin />} />

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
