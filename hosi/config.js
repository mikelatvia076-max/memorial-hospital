// =====================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// FRONTEND CONFIG  (load this BEFORE any other script)
// =====================================
//
// When you open the site on your own computer it talks to your local
// server. When it is deployed (Vercel etc.) it talks to the ONLINE
// backend. Put your deployed backend address below - it must start
// with https:// and have no slash at the end.

// Leave this EMPTY when the website and the backend are on the same
// Render link (the normal case now). Only fill it (https://...) if you
// host the website somewhere else, like Vercel.
const LIVE_BACKEND_URL = "";

const API_URL =
    (location.hostname === "localhost" || location.hostname === "127.0.0.1")
        ? "http://localhost:5000"
        : (LIVE_BACKEND_URL || location.origin);