# JWT Authentication App (Express + React)

This project implements registration, login and a JWT-protected route.

## Features
- `POST /register`: accepts username and password; stores users in an in-memory array.
- `POST /login`: verifies credentials and returns a signed JWT.
- `GET /protected`: requires `Authorization: Bearer <token>`.
- Passwords are hashed with bcrypt before being stored in the array.
- React registration/login forms store the JWT in localStorage.
- The dashboard calls the protected endpoint using the saved JWT.
- Logout removes the token.

> Note: The assignment specifically asks for an array. The array is in memory, so registered users are lost when the backend restarts. Use a database for production applications.

## Run the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set a long random `JWT_SECRET`.

```bash
npm install
npm run dev
```

Backend: `http://localhost:4000`

## Run the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## API examples

Register:

```http
POST /register
Content-Type: application/json

{"username":"ozair","password":"pass1234"}
```

Login:

```http
POST /login
Content-Type: application/json

{"username":"ozair","password":"pass1234"}
```

Protected:

```http
GET /protected
Authorization: Bearer YOUR_JWT
```

## Security notes
- Keep `.env` private and never commit real secrets.
- Use HTTPS in production.
- The in-memory array is for this assignment only; it is not persistent or suitable for multiple server instances.
