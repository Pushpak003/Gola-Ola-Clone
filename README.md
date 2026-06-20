<div align="center">

# 🚕 Gola — Ola Clone

**A full-stack, real-time ride-hailing web application inspired by Ola.**  
Book rides, track drivers live on the map, and manage your journey — all in one sleek interface.

[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-black?logo=socket.io)](https://socket.io/)
[![Mapbox](https://img.shields.io/badge/Maps-Mapbox-4264FB?logo=mapbox)](https://www.mapbox.com/)
[![Twilio](https://img.shields.io/badge/SMS-Twilio-F22F46?logo=twilio)](https://www.twilio.com/)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Fare Calculation](#-fare-calculation)
- [Project Structure](#-project-structure)

---

## 🌟 Overview

Gola is a production-ready ride-hailing clone built as a full-stack web application. It replicates the core Ola experience — users book rides, captains (drivers) accept them, and both sides track the journey in real time on an interactive Mapbox map.

The project is split into two independent apps:

- **`/backend`** — REST API + WebSocket server built with Express.js, Prisma ORM, and PostgreSQL
- **`/frontend`** — React 19 SPA with Tailwind CSS, Mapbox GL, and Socket.io client

---

## ✨ Features

### 👤 User
- **OTP-based phone authentication** via Twilio SMS (no passwords)
- **Live location search** powered by Mapbox Geocoding API with 80 km proximity filter
- **Fare estimation** across 5 vehicle types before booking
- **Real-time ride tracking** — see your captain's location update live on the map
- **OTP-verified ride start** — captain needs your OTP to begin the trip
- **Ride history** — view all past trips with captain details
- **Auto-cancel** — ride is cancelled automatically if no captain accepts within 60 seconds

### 🚗 Captain (Driver)
- **OTP-based phone authentication** with vehicle profile setup
- **Go online/offline** toggle from the dashboard
- **Incoming ride notifications** via WebSockets — accept or decline in real time
- **Live ride management** — start ride with user OTP, complete ride, view earnings
- **Ride history** — full log of completed trips
- **Real-time location broadcasting** to the user during active rides

### ⚙️ System
- **JWT-based auth** with separate tokens for users and captains
- **Geospatial driver matching** — Haversine formula finds captains within 5 km radius
- **WebSocket presence tracking** — in-memory maps for online users & drivers
- **BullMQ + Redis** integration for background job processing
- **Role-based route guards** on the frontend

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | HTTP server and REST API |
| **PostgreSQL** | Primary relational database |
| **Prisma ORM** | Type-safe database client and migrations |
| **Socket.io** | Real-time bidirectional communication |
| **JWT + bcrypt** | Authentication and password hashing |
| **Twilio** | SMS OTP delivery |
| **Mapbox Directions API** | Route distance & duration calculation |
| **Mapbox Geocoding API** | Location search & autocomplete |
| **geolib + Haversine** | Nearby driver matching |
| **BullMQ + ioredis** | Background job queue |
| **Razorpay** | Payment gateway integration |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Build tool and dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **react-map-gl + Mapbox GL** | Interactive maps and route rendering |
| **Socket.io-client** | Real-time updates |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        FRONTEND                         │
│  React 19 + Vite + Tailwind + Mapbox GL + Socket.io     │
│                                                         │
│  User Flow           Captain Flow                       │
│  Landing → Login     Login → CompleteProfile            │
│  Home → VehicleSelect → SearchingRide → LiveRide        │
│  Dashboard → IncomingRide → CaptainLiveRide             │
└──────────────────────┬──────────────────────────────────┘
                       │  HTTP REST + WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                        BACKEND                          │
│  Express 5  ·  Socket.io Server  ·  JWT Auth            │
│                                                         │
│  /api/auth      OTP send & verify                       │
│  /api/captain   Profile, go-online, history             │
│  /api/map       Place search, distance/duration         │
│  /api/ride      Fare, create, accept, start, complete   │
│                                                         │
│  Socket Events:                                         │
│  captain-online / user-online / captain-location        │
│  new-ride / ride-confirmed / ride-started               │
│  ride-completed / captain-location-update               │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│  PostgreSQL (via Prisma)  ·  Redis (via BullMQ)          │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄 Database Schema

The database has four main models:

**User** — phone-based accounts, linked to rides  
**Captain** — driver accounts with vehicle type, number, and live coordinates  
**Ride** — full ride record: pickup/destination (text + lat/lng), distance, duration, fare, OTP, status  
**OTP** — short-lived OTP codes for phone verification  

**Ride Status Flow:**
```
SEARCHING → ACCEPTED → STARTED → COMPLETED
                              ↘ CANCELLED (auto after 60s if no captain)
```

**Supported Vehicle Types:** `BIKE` · `AUTO` · `MINI` · `SEDAN` · `SUV`

---

## 📡 API Reference

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/send-otp` | Send OTP to phone number via Twilio |
| `POST` | `/verify-otp` | Verify OTP, return JWT token + user |

### Captain (`/api/captain`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/complete-profile` | — | Register captain with vehicle details |
| `POST` | `/login` | — | Captain OTP login |
| `GET` | `/current-ride` | Captain JWT | Get active ride |
| `GET` | `/history` | Captain JWT | Get completed ride history |

### Map (`/api/map`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/search?query=&lat=&lng=` | User JWT | Search places (80 km radius) |
| `GET` | `/distance?pickupLng=&pickupLat=&destinationLng=&destinationLat=` | User JWT | Get route distance & duration |

### Ride (`/api/ride`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/fare` | User JWT | Get fare estimate for all vehicle types |
| `POST` | `/create` | User JWT | Create ride, notify nearby captains |
| `POST` | `/accept` | Captain JWT | Accept a ride request |
| `POST` | `/start` | Captain JWT | Start ride with user OTP |
| `POST` | `/complete` | Captain JWT | Mark ride as completed |
| `GET` | `/current` | User JWT | Get user's active ride |
| `GET` | `/history` | User JWT | Get user's ride history |

### WebSocket Events
| Event | Direction | Payload |
|---|---|---|
| `user-online` | Client → Server | `{ token }` |
| `captain-online` | Client → Server | `{ token, lat, lng }` |
| `captain-location` | Captain → Server | `{ rideId, lat, lng }` |
| `new-ride` | Server → Captain | Ride object |
| `ride-confirmed` | Server → User | Updated ride object |
| `ride-started` | Server → User | Updated ride object |
| `ride-completed` | Server → User | Updated ride object |
| `captain-location-update` | Server → User | `{ rideId, lat, lng }` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (local or cloud, e.g. Supabase / Neon)
- Redis (local or Upstash)
- Mapbox account (free tier works)
- Twilio account (for SMS OTPs)

### 1. Clone the repository

```bash
git clone https://github.com/Pushpak003/Gola-Ola-Clone.git
cd Gola-Ola-Clone
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in `/backend` (see [Environment Variables](#-environment-variables) below), then run the database migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

Start the dev server:

```bash
npm run dev
# Server running on http://localhost:5000
```

### 3. Setup the Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_MAPBOX_TOKEN=your_mapbox_public_token
```

Start the dev server:

```bash
npm run dev
# App running on http://localhost:5173
```

---

## 🔑 Environment Variables

### `/backend/.env`

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gola_db

# Auth
JWT_SECRET=your_super_secret_jwt_key

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# Mapbox
MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoixxxxxx

# Redis
REDIS_URL=redis://localhost:6379

# Razorpay (optional)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Server
PORT=5000
```

---

## 💰 Fare Calculation

Fares are calculated as a **base fare + per-km rate**:

| Vehicle | Base Fare | Per KM | Example (10 km) |
|---|---|---|---|
| 🏍 Bike | ₹40 | ₹8/km | ₹120 |
| 🛺 Auto | ₹60 | ₹10/km | ₹160 |
| 🚗 Mini | ₹80 | ₹15/km | ₹230 |
| 🚙 Sedan | ₹120 | ₹20/km | ₹320 |
| 🚐 SUV | ₹180 | ₹28/km | ₹460 |

Distance is fetched live from Mapbox Directions API.

---

## 📁 Project Structure

```
Gola-Ola-Clone/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # DB models: User, Captain, Ride, OTP
│   │   └── migrations/            # SQL migration history
│   └── src/
│       ├── app.js                 # Express app setup & routes mounting
│       ├── server.js              # HTTP server + Socket.io init
│       ├── config/
│       │   └── db.js              # Prisma client singleton
│       ├── controllers/           # Request handlers
│       │   ├── auth.controller.js
│       │   ├── captain.controller.js
│       │   ├── map.controller.js
│       │   └── ride.controller.js
│       ├── services/              # Business logic
│       │   ├── auth.service.js    # OTP send/verify
│       │   ├── captain.service.js
│       │   ├── map.service.js     # Mapbox API calls
│       │   ├── ride.service.js    # Core ride lifecycle
│       │   └── sms.service.js     # Twilio wrapper
│       ├── middlewares/
│       │   ├── userAuth.middleware.js
│       │   └── captainAuth.middleware.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── captain.routes.js
│       │   ├── map.routes.js
│       │   └── ride.routes.js
│       ├── sockets/
│       │   ├── socket.js          # Socket.io event handlers
│       │   ├── onlineUsers.js     # In-memory user presence map
│       │   └── onlineDrivers.js   # In-memory driver presence map
│       └── utils/
│           ├── calculateFare.js   # Fare formula per vehicle type
│           ├── generateOTP.js     # 6-digit OTP generator
│           ├── generateRideOTP.js # 4-digit ride-start OTP
│           ├── generateToken.js   # JWT signing
│           └── getNearbyDrivers.js # Haversine-based radius search
│
└── frontend/
    └── src/
        ├── App.jsx
        ├── api/
        │   └── axios.js           # Axios instance with base URL
        ├── routes/
        │   └── AppRoutes.jsx      # All routes + UserRoute/CaptainRoute guards
        ├── pages/
        │   └── Landing.jsx        # Entry landing page
        ├── user/
        │   ├── Login.jsx          # OTP login for users
        │   ├── Home.jsx           # Location search + book ride
        │   ├── vehicleSelection.jsx
        │   ├── SearchingRide.jsx  # Waiting for captain
        │   ├── LiveRide.jsx       # Map + real-time captain tracking
        │   └── History.jsx        # Past rides
        ├── captain/
        │   ├── CaptainLogin.jsx
        │   ├── CompleteProfile.jsx # Vehicle registration
        │   ├── Dashboard.jsx      # Online/offline toggle
        │   ├── IncomingRide.jsx   # Accept/decline new ride
        │   ├── Captainliveride.jsx # Active ride management
        │   └── Captainhistory.jsx
        └── sockets/
            └── socket.js          # Socket.io client setup
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
Built with ❤️ by <a href="https://github.com/Pushpak003">Pushpak</a>
</div>
