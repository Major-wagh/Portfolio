import React, { useState, useEffect } from "react";
import Preloader from "../src/components/Pre.js";
import Navbar from "./components/Navbar.js";
import Home from "./components/Home/Home.js";
import About from "./components/About/About.js";
import Projects from "./components/Projects/Projects.js";
import Footer from "./components/Footer.js";
import Resume from "./components/Resume/ResumeNew.js";
import Chatbot from "./components/Chat.js";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.js";
import "./style.css";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [load, upadateLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      upadateLoad(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <Preloader load={load} />
      <div className="App" id={load ? "no-scroll" : "scroll"}>
        <Navbar />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project" element={<Projects />} />
          <Route path="/about" element={<About />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="*" element={<Navigate to="/"/>} />
        </Routes>
        <Chatbot/>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
