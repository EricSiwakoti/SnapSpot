# 📸 SnapSpot

> **Share favorite places with photos & locations. Discover hidden gems recommended by the community.**

SnapSpot is a full-stack MERN application that allows users to share locations they love, complete with images and precise map coordinates. Built with **React**, **Node.js**, **TypeScript**, and **MongoDB**, it features secure authentication, image upload via Cloudinary, and interactive maps using OpenLayers.

---

## ✨ Features

- **🌍 Interactive Maps:** View place locations on an interactive map using OpenLayers.
- **📷 Image Uploads:** Secure image hosting via Cloudinary with automatic transformations.
- **🔐 Authentication:** JWT-based authentication with password hashing (bcryptjs).
- **🔍 Advanced Search:** Search for places by title/address or find users by name.
- **✅ CRUD Operations:** Create, Read, Update, and Delete places (authorized users only).
- **📱 Responsive Design:** Mobile-friendly UI built with React and Vite.
- **🛡️ Security:** Helmet, CORS, Rate Limiting, and Input Validation.
- **📍 Geocoding:** Automatic conversion of addresses to coordinates using OpenCage API.

---

## 🛠️ Tech Stack

| Category           | Technologies                                        |
| :----------------- | :-------------------------------------------------- |
| **Frontend**       | React, Vite, React Router, OpenLayers, Context API  |
| **Backend**        | Node.js, Express, **TypeScript**                    |
| **Database**       | MongoDB, Mongoose                                   |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs                     |
| **File Storage**   | Cloudinary, Multer                                  |
| **APIs**           | OpenCage Geocoding API                              |
| **Security**       | Helmet, CORS, Express Rate Limit, Express Validator |

---

## 🚀 Getting Started

Follow these instructions to set up a local copy of the project.

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (Local or Atlas URI)
- **Cloudinary Account** (for image storage)
- **OpenCage API Key** (for geocoding)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/snapspot.git
cd snapspot
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` root with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_KEY=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
OPEN_CAGE_API_KEY=your_opencage_api_key
```

**Run the Backend:**

```bash
# Development mode (with ts-node)
npm run dev

# Production build
npm run build
npm start
```

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd Frontend
npm install
```

Create a `.env` file in the `Frontend` root:

```env
VITE_API_BASE=http://localhost:5000/api
```

**Run the Frontend:**

```bash
npm run dev
```

---

## 📂 Project Structure

```
├── Backend/
│   ├── src/
│   │   ├── controllers/      # Logic for handling requests
│   │   ├── middleware/       # Auth & File Upload middleware
│   │   ├── models/           # Mongoose schemas (User, Place)
│   │   ├── routes/           # API endpoint definitions
│   │   ├── util/             # Helper functions (Geocoding)
│   │   └── app.ts            # Entry point
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── places/           # Place-related components & pages
│   │   ├── user/             # User authentication & lists
│   │   ├── shared/           # Reusable UI components & hooks
│   │   └── App.jsx           # Main React component
│   └── package.json
└── README.md
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint            | Description         |
| :----- | :------------------ | :------------------ |
| `POST` | `/api/users/signup` | Register a new user |
| `POST` | `/api/users/login`  | Login user          |
| `GET`  | `/api/users`        | Get all users       |

### Places

| Method   | Endpoint                | Description                            | Auth Required |
| :------- | :---------------------- | :------------------------------------- | :------------ |
| `GET`    | `/api/places`           | Get all places (supports search query) | ❌            |
| `GET`    | `/api/places/:pid`      | Get place by ID                        | ❌            |
| `GET`    | `/api/places/user/:uid` | Get places by user ID                  | ❌            |
| `POST`   | `/api/places`           | Create a new place                     | ✅            |
| `PATCH`  | `/api/places/:pid`      | Update a place                         | ✅            |
| `DELETE` | `/api/places/:pid`      | Delete a place                         | ✅            |

### Search

| Method | Endpoint      | Description                    |
| :----- | :------------ | :----------------------------- |
| `GET`  | `/api/search` | Global search (places & users) |

---

## 🖼️ Usage Guide

1.  **Sign Up:** Navigate to `/auth` to create an account. You can upload a profile picture during signup.
2.  **Explore:** View all shared places on the home page. Use the search bar to find specific locations or users.
3.  **Share:** Click **"Add Place"** to share a new location. Provide a title, description, address (auto-geocoded), and an image.
4.  **Manage:** Go to **"My Places"** to edit or delete places you have created.
5.  **Map:** Click **"View on Map"** on any place card to see its precise location.

---

## 🔒 Security Features

- **Password Hashing:** Passwords are hashed using `bcryptjs` before storage.
- **JWT Protection:** Protected routes require a valid Bearer token.
- **Input Validation:** Backend validates all incoming data using `express-validator`.
- **Rate Limiting:** API requests are limited to prevent abuse.
- **HTTP Headers:** Secured using `helmet`.

---

## 📄 License

This project is licensed under the ISC License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
