# HydroAI Frontend

Modern React + Next.js frontend for Physics-Informed Groundwater Monitoring system.

## Features

- **Landing Page** - Hero section with modern design
- **Dashboard** - Real-time groundwater level forecasting
- **Policy Simulator** - Counterfactual analysis
- **Site Optimizer** - Geospatial optimization
- **Responsive Design** - Mobile-friendly UI

## Tech Stack

- **Framework**: Next.js 14
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Maps**: React Leaflet
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Build

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
app/
├── page.tsx              # Landing page
├── layout.tsx            # Root layout
├── globals.css           # Global styles
├── dashboard/
│   └── page.tsx         # Dashboard
├── forecast/
│   └── page.tsx         # Forecast details
├── simulator/
│   └── page.tsx         # Policy simulator
├── optimizer/
│   └── page.tsx         # Site optimizer
└── components/          # Reusable components
    ├── Header.tsx
    ├── Navigation.tsx
    ├── Charts.tsx
    └── ...
```

## API Integration

The frontend communicates with the FastAPI backend at `http://localhost:8000`:

- `GET /api/health` - Health check
- `POST /api/predict_spatiotemporal` - Get predictions
- `POST /api/counterfactual` - Run simulations
- `POST /api/recharge_sites` - Optimize sites
- `GET /api/data` - Retrieve data

## Testing

```bash
npm test
```

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Or any Node.js hosting platform.
