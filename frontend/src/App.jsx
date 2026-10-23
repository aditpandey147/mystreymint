// App.jsx
import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { AIProfitProvider } from "./context/AIProfitContext";
import PrivateRoute from "./components/features/PrivateRoute";
import FeatureRoute from "./components/features/FeatureRoute"; // 👈 NEW
import HomeNavbar from "./components/HomeNavbar";
import Footer from "./components/Footer";

// Auth
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Subscription from "./pages/auth/Subscription";

// Pages
import Dashboard from "./pages/Dashboard";
import CreateProduct from "./pages/CreateProduct";
import MyMysteries from "./pages/MyMysteries";
import MysteryDetail from "./pages/MysteryDetail";
import Templates from "./pages/Templates";
import TrendingMystery from "./pages/TrendingMystery";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";

// Agency
import Agency from "./pages/agency/Agency";

import VisualLibraryPage from "./components/dfy/VisualLibraryPage";
import VideoLibraryPage from "./components/dfy/VideoLibraryPage";

// OTOs
import CharacterStudio from "./pages/otos/CharacterStudio";
import Reseller from "./pages/otos/Reseller";
import AIRanker from "./pages/ranker/AIRanker";
import AIRankerChat from "./pages/ranker/AIRankerChat";
import ClueEvidenceStudio from "./pages/otos/ClueEvidenceStudio";
import PuzzleStudio from "./pages/otos/PuzzleStudio";
import EscapeRoomAI from "./pages/otos/EscapeRoomAI";
import MysterySalesKit from "./pages/otos/MysterySalesKit";
import MysteryPartyPlanner from "./pages/otos/MysteryPartyPlanner";
import UnlimitedTemplates from "./pages/otos/UnlimitedTemplates";
import DFYMysteryPacks from "./pages/otos/DFYMysteryPacks";

// Support
import Training from "./pages/support/Training";
import Support from "./pages/support/Support";
import Settings from "./pages/Settings";

// 👇 NEW
import UpgradeRequired from "./pages/features/UpgradeRequired";

// ================================================================
// Layout — unchanged
// ================================================================
const Layout = ({ children }) => {
  const location = useLocation();

  const dashboardPages = [
    "/dashboard",
    "/create-mystery",
    "/trending",
    "/my-mysteries",
    "/templates",
    "/character-studio",
    "/unlimited",
    "/clue-studio",
    "/puzzle-studio",
    "/escape-room-ai",
    "/sales-kit",
    "/party-planner",
    "/dfy-packs",
    "/admin/dashboard",
    "/training",
    "/support",
    "/ai-ranker",
    "/settings",
    "/subscription",
    "/reseller",
    "/agency",
    "/upgrade-required", // 👈 NEW — dashboard-style (has Sidebar)
  ];

  const isDashboardPage =
    dashboardPages.includes(location.pathname) ||
    location.pathname.startsWith("/ai-profit-machine/chat/") ||
    location.pathname.startsWith("/ai-ranker/chat/") ||
    location.pathname.startsWith("/products/") ||
    location.pathname.startsWith("/templates/") ||
    location.pathname.startsWith("/mystery/") ||
    location.pathname.startsWith("/create-mystery");

  const authPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPage =
    authPages.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password/");

  return (
    <>
      {!isDashboardPage && !isAuthPage && <HomeNavbar />}
      <div className={!isDashboardPage && !isAuthPage ? "pt-14" : ""}>
        {children}
      </div>
      {!isDashboardPage && !isAuthPage && <Footer />}
    </>
  );
};

// ================================================================
// App
// ================================================================
function App() {
  return (
    <AuthProvider>
      <AIProfitProvider>
        <Toaster position="top-right" />
        <Layout>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* ==================== Auth Routes ==================== */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/support" element={<Support />} />

            {/* ==================== Admin ==================== */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* ==================== Free Routes (auth only) ==================== */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/trending"
              element={
                <PrivateRoute>
                  <TrendingMystery />
                </PrivateRoute>
              }
            />

            <Route
              path="/create-mystery"
              element={
                <PrivateRoute>
                  <CreateProduct />
                </PrivateRoute>
              }
            />

            <Route
              path="/my-mysteries"
              element={
                <PrivateRoute>
                  <MyMysteries />
                </PrivateRoute>
              }
            />

            <Route
              path="/mystery/:id"
              element={
                <PrivateRoute>
                  <MysteryDetail />
                </PrivateRoute>
              }
            />

            <Route
              path="/templates"
              element={
                <PrivateRoute>
                  <Templates />
                </PrivateRoute>
              }
            />
            <Route
              path="/unlimited"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="unlimited">
                    <UnlimitedTemplates />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/character-studio"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="characterStudio">
                    <CharacterStudio />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/clue-studio"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="clueStudio">
                    <ClueEvidenceStudio />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/puzzle-studio"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="puzzleStudio">
                    <PuzzleStudio />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/escape-room-ai"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="escapeRoom">
                    <EscapeRoomAI />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/sales-kit"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="salesKit">
                    <MysterySalesKit />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/party-planner"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="partyPlanner">
                    <MysteryPartyPlanner />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/dfy-packs"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="dfy">
                    <DFYMysteryPacks />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/agency"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="agency">
                    <Agency />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/reseller"
              element={
                <PrivateRoute>
                  <FeatureRoute feature="reseller">
                    <Reseller />
                  </FeatureRoute>
                </PrivateRoute>
              }
            />

            {/* ==================== Other Protected ==================== */}
            <Route
              path="/subscription"
              element={
                <PrivateRoute>
                  <Subscription />
                </PrivateRoute>
              }
            />

            <Route
              path="/training"
              element={
                <PrivateRoute>
                  <Training />
                </PrivateRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />

            {/* ==================== Upgrade Required Fallback ==================== */}
            <Route
              path="/upgrade-required"
              element={
                <PrivateRoute>
                  <UpgradeRequired />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </AIProfitProvider>
    </AuthProvider>
  );
}

export default App;
