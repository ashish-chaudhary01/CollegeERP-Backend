# Backend of my College ERP Website(CERP)

- attendence for admin

## Render deployment

Use this repository as a Render Web Service:

- Root directory: leave blank; this repository is already the backend root
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

Required Render environment variables:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
FRONTEND_URL=https://your-frontend.vercel.app
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

The GitHub Actions workflow at `.github/workflows/keep-render-awake.yml` pings the deployed backend every 14 minutes. Add this GitHub Actions repository secret:

```text
BACKEND_URL=https://your-backend.onrender.com
```
