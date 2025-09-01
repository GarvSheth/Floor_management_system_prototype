// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="9" y1="21" x2="9" y2="9"></line>
  </svg>
);

const API_BASE = "http://localhost:3000";

const LoginPage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check existing session
  useEffect(() => {
    fetch(`${API_BASE}/me`, {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Load Google Identity Services
  useEffect(() => {
    const handleCredentialResponse = async (response) => {
      try {
        const r = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // allow cookie set
          body: JSON.stringify({ id_token: response.credential }),
        });

        if (!r.ok) throw new Error("Login failed");
        const data = await r.json();
        setUser(data.user);
        navigate("/floor");
      } catch (err) {
        console.error("Login error:", err);
        alert("Login failed: " + err.message);
      }
    };

    const renderGsiButton = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID, // must be prefixed with REACT_APP_
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large", width: "100%" }
      );
    };

    // Inject GIS script
    const scriptId = "google-client-script";
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.id = scriptId;
      s.async = true;
      s.defer = true;
      s.onload = renderGsiButton;
      document.body.appendChild(s);
    } else {
      renderGsiButton();
    }

    return () => {
      const el = document.getElementById("googleSignInDiv");
      if (el) el.innerHTML = "";
    };
  }, [navigate]);

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-semibold text-gray-600 animate-pulse">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all">
        <div className="mx-auto mb-6 h-16 w-16 text-indigo-600">
          <BuildingIcon />
        </div>

        {!user ? (
          <>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Floor Management System</h1>
            <p className="text-gray-500 mb-8">Please sign in with Google to continue.</p>

            <div id="googleSignInDiv" className="mx-auto w-full mb-4"></div>

            <p className="text-sm text-gray-400">If the button doesn't show, check the console.</p>
          </>
        ) : (
          <>
            <img src={user.picture || "/placeholder.png"} alt={user.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-indigo-200 shadow-sm" />
            <h2 className="text-2xl font-bold text-gray-800">Welcome, {user.name}!</h2>
            <p className="text-gray-500 mb-6">{user.email}</p>

            <div className="mt-8 space-y-4">
              <Link to="/floor" className="block w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md">
                Go to Dashboard
              </Link>
              <button onClick={handleLogout} className="block w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-300">
                Log Out
              </button>
            </div>
          </>
        )}
      </div>

      <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Floor Management Systems. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LoginPage;
