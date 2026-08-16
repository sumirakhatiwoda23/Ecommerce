# ShopNest 🛍️

A full-stack e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js), featuring email-verified authentication, Cloudinary image uploads, eSewa payment integration, and a complete admin dashboard.

## Features

### Customer-Facing
- Browse products by category with a shop page and detailed product view
- Shopping cart powered by Redux Toolkit
- Secure checkout with **eSewa** payment integration (Nepal)
- Email/password registration with **OTP email verification**
- Order confirmation emails and order history
- Product reviews — only verified purchasers can leave a review
- Responsive design across devices

### Admin Dashboard
- Add, edit, and delete products with Cloudinary image uploads
- Manage all orders — update shipping status (Pending / Shipped / Delivered)
- View payment status per order
- View and manage registered users
- Sales analytics: total orders, products, users, and revenue
- Email notifications on new orders

### Security & Auth
- JWT-based authentication
- Passwords hashed with bcrypt
- Email verification required before login (OTP-based, expires after 10 minutes)
- Role-based access control (user / admin)

## Tech Stack

**Frontend**
- React 18
- Redux Toolkit
- React Router v6
- Create React App (react-scripts)

**Backend**
- Node.js + Express 5
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- Bcrypt.js for password hashing
- Nodemailer (Gmail SMTP) for transactional emails
- Cloudinary for image storage
- eSewa payment gateway integration
- Multer for file upload handling

## Project Structure

```
Ecommerce/
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
        │   └── ReviewSection.jsx
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
        │   ├── VerifyEsewa.jsx
        │   ├── About.jsx
        │   ├── Disclaimer.jsx
        │   └── ReturnPolicy.jsx
        ├── redux/
        │   ├── store.js
        │   └── cartSlice.js
        ├── styles/
        │   ├── auth.css
        │   └── product.css
        ├── App.jsx
        └── index.js
```

> **Note:** this tree reflects the pages and components referenced across the project's routes and imports. A few files (`Home.jsx`, `Shop.jsx`, `Cart.jsx`, `Profile.jsx`, the `admin/` pages, `Navbar.jsx`, `Footer.jsx`, `redux/store.js`) are included based on what `App.jsx` imports and standard Create React App conventions, but weren't individually reviewed line-by-line — double check these match your actual filenames before relying on this as documentation.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm
- A MongoDB Atlas cluster (or local MongoDB instance)
- A Gmail account with an App Password (for sending emails)
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

GMAIL_USER=your_gmail_address
GMAIL_PASS=your_gmail_app_password
ADMIN_EMAIL=email_to_receive_order_notifications

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ESEWA_PRODUCT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
```

> **Note:** `ESEWA_PRODUCT_CODE=EPAYTEST` and the secret key above are eSewa's public sandbox credentials, safe to use for local development and testing only. Replace with real merchant credentials before going to production.

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

> The frontend is configured with a proxy (`"proxy": "http://localhost:5000"` in `package.json`) so API calls during development are automatically forwarded to the backend — no need to hardcode the backend URL.

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

This project is set up to be deployed as a **single combined service**: the Express backend serves the built React frontend directly in production.

1. Build the frontend: `cd frontend && npm run build`
2. Set `NODE_ENV=production` on your hosting platform
3. Ensure all environment variables from the `.env` list above are set on the host
4. Whitelist your host's IP (or `0.0.0.0/0` for simplicity) in MongoDB Atlas Network Access
5. Start the backend with `npm start` — it will serve both the API (`/api/*`) and the React app from one URL

Recommended hosts: Render, Railway, or Fly.io (any platform that supports long-running Node.js processes).

## API Overview

| Route | Description |
|---|---|
| `POST /api/auth/register` | Register a new user (sends OTP) |
| `POST /api/auth/verify-otp` | Verify email with OTP |
| `POST /api/auth/resend-otp` | Resend a new OTP |
| `POST /api/auth/login` | Login (blocked until email verified) |
| `GET /api/products` | List all products |
| `GET /api/products/:id` | Get a single product |
| `POST /api/products` | Create a product (admin only) |
| `PUT /api/products/:id` | Update a product (admin only) |
| `DELETE /api/products/:id` | Delete a product (admin only) |
| `POST /api/orders` | Place an order |
| `GET /api/orders/myorders` | Get logged-in user's orders |
| `GET /api/orders` | Get all orders (admin only) |
| `PUT /api/orders/:id/status` | Update order status (admin only) |
| `POST /api/payment/esewa-initiate` | Start an eSewa payment |
| `POST /api/payment/esewa-verify` | Verify an eSewa payment |
| `GET /api/reviews/:productId` | Get reviews for a product |
| `POST /api/reviews` | Submit a review (must have purchased the product) |
| `GET /api/analytics` | Get dashboard stats (admin only) |

## License

ISC

## Author

Sumira Khatiwoda
