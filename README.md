# Inventory Management System — JWT Authentication Update

This update keeps the existing React + Vite dashboard and Express + MongoDB product API, and adds JWT-based registration/login.

## Requirements
- Node.js (LTS)
- MongoDB running locally, or a MongoDB Atlas connection string

## 1. Configure the backend

Open a terminal in `backend`:

```bash
npm install
```

Copy `.env.example` to a new file named `.env` and set your own values:

```env
MONGO_URI=mongodb://127.0.0.1:27017/inventory_management
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

Use a long, random JWT secret. Never commit `.env` to GitHub or share it publicly.

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

## 2. Start the frontend

Open a second terminal in `frontend`:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## 3. Test authentication

1. Select **Register** and create an account with a valid email and a password of at least 8 characters.
2. After registration, the app logs you in and opens the dashboard.
3. Log out, then log in with the same credentials.
4. Try adding, editing and deleting a product. Product endpoints now require a valid JWT.
5. The token expires after 24 hours; log in again when it expires.

## API endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | JWT required |
| GET | `/api/products` | JWT required |
| POST | `/api/products` | JWT required |
| PUT | `/api/products/:id` | JWT required |
| DELETE | `/api/products/:id` | JWT required |

For protected API calls, send `Authorization: Bearer <token>`.

## Notes
- Existing MongoDB product records are not deleted or migrated.
- The frontend uses Redux Toolkit and RTK Query. A protected third-party barcode lookup integration is included. MongoDB Atlas and deployment still require your own cloud account and configuration.
- For a production application, prefer storing JWTs in secure, HttpOnly, SameSite cookies and add rate limiting, email verification, password reset, and stricter production CORS settings.
- If deploying the frontend separately, set `VITE_API_URL` to the deployed backend URL and set backend `CLIENT_URL` to the deployed frontend origin.

## Redux Toolkit and RTK Query

The frontend now uses Redux Toolkit for the authentication state and RTK Query for authentication and product API requests.

From the `frontend` directory, run:

```bash
npm install
npm run dev
```

The dependencies `@reduxjs/toolkit` and `react-redux` are listed in `frontend/package.json`. `npm install` will update the lockfile for your environment.

### Redux files

- `frontend/src/app/store.js` - configures the Redux store and RTK Query middleware.
- `frontend/src/features/auth/authSlice.js` - stores the JWT and current user.
- `frontend/src/services/authApi.js` - handles register and login requests.
- `frontend/src/services/productApi.js` - handles product list, create, update and delete requests. It attaches the JWT automatically and clears the session if the API returns HTTP 401.

The JWT is currently persisted in localStorage to match the existing authentication flow. For a production deployment, consider moving authentication to secure, HttpOnly cookies with CSRF protection.


## Third-party API integration: Open Food Facts

The Add Product form includes a barcode lookup. Enter an 8–14 digit barcode and choose **Fetch Product Details**. The app requests product name, brand and category from the Open Food Facts API; the returned values populate the form. Review them, enter your own stock quantity and selling price, and save the product to MongoDB.

This lookup is intended for packaged food products listed in Open Food Facts. If a barcode is not found, enter the product details manually. The API is called by the backend (not directly by the browser), and the lookup endpoint requires JWT authentication. No API key is required for this basic public lookup.

### Integration endpoint

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/integrations/barcode/:barcode` | JWT required |

Example: `GET http://localhost:5000/api/integrations/barcode/3017620422003` with `Authorization: Bearer <token>`.

### Redux integration file

- `frontend/src/services/integrationApi.js` - RTK Query endpoint for the protected barcode lookup.
- `backend/routes/integrationRoutes.js` - validates the barcode and securely calls Open Food Facts.

## Environment template

Create `backend/.env` using `backend/.env.example` as a template. Never put real credentials in `.env.example`.
