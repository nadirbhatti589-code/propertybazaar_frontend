# PropertyBazaar Frontend (React + Vite + Tailwind)

React frontend jo humare Express/MongoDB backend se connect hota hai.

## Pages banaye gaye hain:

- **Home** — property grid, search/filter bar (city, price, bedrooms, buy/rent, type)
- **Property Detail** — full listing view, inquiry form, favorite button
- **Login / Signup** — email+password authentication
- **Post Property** — form to submit a new listing (goes to `pending_approval` until admin approves)
- **My Listings** — properties you've posted, with status and delete option
- **Favorites** — your saved properties

## Setup

1. **Node.js installed hona chahiye** (v18+)

2. **Dependencies install karo:**
   ```
   npm install
   ```

3. **Backend URL set karo:**
   - `.env` file mein `VITE_API_URL` check karo — local development ke liye already
     `http://localhost:5000/api` set hai (agar backend isi port pe chal raha hai)
   - Backend server pehle se chal raha hona chahiye (`npm run dev` us folder mein)

4. **Dev server chalao:**
   ```
   npm run dev
   ```
   Browser mein `http://localhost:5173` khul jayega.

## Important notes

- **Image upload:** "Post Property" form abhi sirf text fields leta hai — image upload
  (Cloudinary ke through) is form mein wire nahi kiya gaya. Agla step mein add kar sakte hain
  jab Cloudinary keys backend mein set ho jayein.
- **Admin panel:** Ye alag UI nahi hai abhi — admin actions (approve/reject listings, verify
  agents) filhal Postman/Thunder Client se test kiye ja rahe hain. Agla phase mein iske liye
  bhi ek proper `/admin` route/UI bana sakte hain.
- **Google Sign-In button:** Backend mein route ready hai (`/api/auth/google`) lekin frontend
  mein "Continue with Google" button abhi add nahi kiya — ye bhi agle step mein aayega.

## Deploy karna (Vercel)

1. Is folder ko GitHub repo mein push karo (`.env` push nahi hoga, `.gitignore` mein hai)
2. [vercel.com](https://vercel.com) pe jao, "Add New Project" > GitHub repo import karo
3. Environment variable add karo: `VITE_API_URL` = apne live backend ka URL (jab backend bhi deploy ho jaye — Render/Railway pe)
4. Deploy dabao

## Agla step

Bata dena jab ye frontend test kar lo, phir hum:
- Image upload wire karenge (property form mein)
- Admin panel UI banayenge
- Agent verification form banayenge
- EMI/ROI calculators add karenge
