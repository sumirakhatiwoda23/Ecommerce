# ShopNest 🛍️

A full-stack e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js), featuring JWT authentication, Cloudinary image uploads, eSewa payment integration, and a complete admin dashboard. The backend is a standalone API (deployed on Render); the React frontend is deployed separately (e.g. on Vercel).

## Features

### Customer-Facing
- Browse products with category filtering, keyword search, and pagination
- Shopping cart powered by Redux Toolkit
- Secure checkout with **eSewa** payment integration (Nepal)
- Email/password registration and login (JWT-based)
- Order history for the logged-in user
- Product reviews — only users who purchased the product can leave a review
- Responsive design across devices

### Admin Dashboard
- Add, edit, and delete products with Cloudinary image uploads
- Manage all orders — update shipping status (Pending / Shipped / Delivered)
- View payment status per order
- View and manage registered users
- Sales analytics: total orders, products, users, and revenue

### Security & Auth
- JWT-based authentication (30-day token expiry)
- Passwords hashed with bcrypt
- Role-based access control (user / admin) via `protect` and `admin` middleware

> **Note:** an email-sending utility (`utils/sendEmail.js`, via Nodemailer/Gmail SMTP) is in the codebase but isn't currently wired into any controller — there's no OTP verification or order-confirmation email flow active yet. `GMAIL_USER`/`GMAIL_PASS` only need to be set if you build that in.

## Tech Stack

**Frontend**
- React 18
- Redux Toolkit
- React Router v6
- Create React App (react-scripts)

**Backend**
- Node.js + Express 5 (ESM / `"type": "module"`)
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- Bcrypt.js for password hashing
- Cloudinary for image storage
- eSewa payment gateway integration (initiate + verify)
- Multer for handling multipart file uploads
- Nodemailer — installed and configured, not yet called from any route (see note above)

## Project Structure

```
Ecommerce/
├── ShopNest_Postman_Collection.json
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── reviewController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── adminMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── analyticsRoutes.js
│   ├── utils/
│   │   ├── sendEmail.js
│   │   └── esewaSignature.js
│   ├── seed.js
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── admin/
        │   ├── AdminDashboard.jsx
        │   ├── AddProduct.jsx
        │   ├── AdminProducts.jsx
        │   ├── EditProduct.jsx
        │   ├── AdminOrders.jsx
        │   └── AdminUsers.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ProductCard.jsx
        │   └── ReviewSection.jsx
        ├── config/
        │   └── api.js
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── Shop.jsx
        │   ├── ProductDetail.jsx
        │   ├── Cart.jsx
        │   ├── Checkout.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── VerifyEmail.jsx
        │   ├── Profile.jsx
        │   ├── OrderSuccess.jsx
        │   ├── VerifyEsewa.js
        │   ├── About.jsx
        │   ├── Disclaimer.jsx
        │   └── ReturnPolicy.jsx
        ├── redux/
        │   ├── store.js
        │   └── cartSlice.js
        ├── styles/
        │   ├── auth.css
        │   ├── cart.css
        │   ├── global.css
        │   ├── navbar.css
        │   └── product.css
        ├── App.jsx
        └── index.js
```

> `pages/VerifyEmail.jsx` exists in the frontend but has no matching backend route right now (see the auth note above) — it's currently unused by the register/login flow.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm
- A MongoDB Atlas cluster (or local MongoDB instance)
- A Cloudinary account (for image uploads)
- eSewa merchant credentials (sandbox credentials work for local testing)

### 1. Clone the repository

```bash
git clone https://github.com/sumirakhatiwoda23/Ecommerce.git
cd Ecommerce
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder with the following variables:

```
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
FRONTEND_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ESEWA_PRODUCT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q

# Optional — only needed if you wire utils/sendEmail.js into a route yourself
GMAIL_USER=your_gmail_address
GMAIL_PASS=your_gmail_app_password
```

> **Note:** `ESEWA_PRODUCT_CODE=EPAYTEST` and the secret key above are eSewa's public sandbox credentials, safe to use for local development and testing only. Replace with real merchant credentials before going to production.
>
> The repo's `backend/.env.example` also lists `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` — `razorpay` is an installed dependency but isn't used by any current controller (payments go through eSewa only), so those two are safe to skip.

Seed the database with a sample admin account and products:

```bash
npm run seed
```

This creates:
- Admin login: `admin@shopnest.com` / `password123`
- 4 sample products

Start the backend in development mode (auto-restarts on file changes):

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

The app will open automatically at `http://localhost:3000`.

> The frontend is configured with a proxy (`"proxy": "http://localhost:5000"` in `package.json`) so API calls during development are automatically forwarded to the backend — no need to hardcode the backend URL. In production, set `REACT_APP_API_URL` to your deployed backend URL (see `frontend/.env.example`); `src/config/api.js` reads this and falls back to relative URLs when it's unset.

## Available Scripts

**Backend** (`/backend`)
| Command | Description |
|---|---|
| `npm start` | Runs the server with plain Node (no auto-restart) |
| `npm run dev` | Runs the server with nodemon (auto-restarts on changes) |
| `npm run seed` | Wipes and reseeds the database with sample admin/products |

**Frontend** (`/frontend`)
| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Starts the React development server |
| `npm run build` | Builds the app for production |

## Deployment

This project deploys the frontend and backend as **two separate services** — the Express server is API-only (`server.js` doesn't serve any static frontend build).

**Backend → Render (or Railway/Fly.io — any host that supports long-running Node processes)**
1. Set the root/start directory to `backend`
2. Build command: `npm install`
3. Start command: `npm start`
4. Set `NODE_ENV=production` and all the backend env vars from the list above
5. Whitelist your host's IP (or `0.0.0.0/0` for simplicity) in MongoDB Atlas Network Access

**Frontend → Vercel**
1. Set the root directory to `frontend`
2. Build command: `npm run build`, output directory: `build`
3. Set `REACT_APP_API_URL` to your deployed Render backend URL
4. `vercel.json` rewrites all routes to `index.html`, so React Router's client-side routes work on refresh/direct link

Once both are deployed, make sure `FRONTEND_URL` on the backend matches the live Vercel URL (used for CORS and eSewa's success/failure redirect URLs).

## API Overview

| Route | Description |
|---|---|
| `POST /api/auth/register` | Register a new user, returns a JWT |
| `POST /api/auth/login` | Login with email/password, returns a JWT |
| `GET /api/auth/users` | List all users (admin only) |
| `GET /api/products` | List products — supports `?category=`, `?keyword=`, `?page=`, `?limit=`; also returns the distinct category list |
| `GET /api/products/:id` | Get a single product |
| `POST /api/products` | Create a product, image upload via `image` field (admin only) |
| `PUT /api/products/:id` | Update a product, optional new image (admin only) |
| `DELETE /api/products/:id` | Delete a product (admin only) |
| `POST /api/orders` | Place an order (logged-in user) |
| `GET /api/orders/myorders` | Get the logged-in user's orders |
| `GET /api/orders` | Get all orders (admin only) |
| `PUT /api/orders/:id/status` | Update order status (admin only) |
| `POST /api/payment/esewa-initiate` | Start an eSewa payment (logged-in user) |
| `POST /api/payment/esewa-verify` | Verify an eSewa payment |
| `GET /api/reviews/:productId` | Get reviews for a product |
| `POST /api/reviews` | Submit a review — only if the user purchased the product (logged-in user) |
| `GET /api/analytics` | Get dashboard stats: totals + revenue (admin only) |

A Postman collection covering these routes is included at [`ShopNest_Postman_Collection.json`](./ShopNest_Postman_Collection.json).

## License

ISC

## Author

Sumira Khatiwoda
