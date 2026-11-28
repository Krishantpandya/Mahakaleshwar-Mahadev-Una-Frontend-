# Mankaleshwar Mahadev — Frontend

React + Vite + TypeScript admin frontend.

## Requirements
- Node.js 20+
- The Mankaleshwar Mahadev backend running locally or deployed.

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` to the backend origin. The backend must allow the frontend origin in its CORS configuration and enable credentialed requests. Admin login uses the backend's HttpOnly session cookie.

## Available scripts
- `npm run dev` — local development server
- `npm run typecheck` — TypeScript check
- `npm run build` — production build

## Admin photo management
The current interface supports admin login, photo listing, date filters, pagination, and publish/unpublish actions.

The upload dialog currently provides local file validation and preview only. The backend branch does not yet expose a secure upload endpoint or configured object storage, so it deliberately does not submit or persist files. Do not treat the preview as an upload.
