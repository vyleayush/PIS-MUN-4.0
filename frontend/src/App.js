import React, { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { CursorGlow } from "@/components/CursorGlow";
import { Preloader } from "@/components/Preloader";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import Handbook from "@/pages/Handbook";
import Brochure from "@/pages/Brochure";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PageWrapper>
            <Home />
          </PageWrapper>
        }
      />
      <Route
        path="/register"
        element={
          <PageWrapper>
            <Register />
          </PageWrapper>
        }
      />
      <Route
        path="/handbook"
        element={
          <PageWrapper>
            <Handbook />
          </PageWrapper>
        }
      />
      <Route
        path="/brochure"
        element={
          <PageWrapper>
            <Brochure />
          </PageWrapper>
        }
      />
      <Route
        path="/admin/login"
        element={
          <PageWrapper>
            <AdminLogin />
          </PageWrapper>
        }
      />
      <Route
        path="/admin"
        element={
          <PageWrapper>
            <AdminDashboard />
          </PageWrapper>
        }
      />
    </Routes>
  );
}

function App() {
  const [siteReady, setSiteReady] = useState(false);

  return (
    <div className="App dark relative">
      <Preloader onComplete={() => setSiteReady(true)} />
      <CursorGlow />
      <BrowserRouter>
        <ScrollToTop />
        <AnimatedRoutes />
      </BrowserRouter>
      <Toaster position="top-center" theme="dark" richColors />
    </div>
  );
}

export default App;
