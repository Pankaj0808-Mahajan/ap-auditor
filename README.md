# AP-Auditor 🏭🔍

**AP-Auditor** is an AI-powered industrial audit and quality inspection intelligence platform. It features real-time visual telemetry, interactive 3D digital-twin inspection simulations, automated defect detection, and comprehensive compliance audit logs.

---

## 🏗️ Repository Architecture

This repository is structured to house both client applications and future backend audit engines:

```plaintext
ap-auditor/
├── frontend/             # Industrial visualizer & web UI
│   ├── public/           # Static assets & HTML template
│   ├── src/
│   │   ├── components/   # Reusable UI components & layouts
│   │   ├── pages/        # Dashboard, Audit Log, & Inspection views
│   │   ├── scenes/       # 3D R3F digital twin & conveyor belt models
│   │   ├── App.tsx       # Root routing & layout
│   │   └── index.tsx     # Application entrypoint
│   ├── package.json      # Frontend dependencies & scripts
│   ├── tailwind.config.js# Industrial dark-mode design system
│   └── tsconfig.json     # TypeScript configuration
├── backend/              # (Upcoming) AI inference & audit API services
├── .gitignore            # Universal project gitignore (Frontend + Backend)
└── README.md             # Project documentation
```

---

## ⚡ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **3D Graphics & Simulation**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Animations**: GSAP (`@gsap/react`), Lenis smooth scrolling
- **Styling**: Tailwind CSS with custom industrial telemetry theme
- **Icons**: Lucide React
- **Routing & Networking**: React Router DOM v7, Axios

### Backend *(Planned)*
- Python / FastAPI or Node.js audit microservices
- Computer vision & AI inspection pipeline
- Historical compliance database & webhooks

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Running the Frontend

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

To create an optimized production build of the frontend:
```bash
cd frontend
npm run build
```

---

## 🔒 Environment Configuration

If custom ports, host checks, or API base URLs are required, configure them inside `frontend/.env`:

```env
PORT=3000
HOST=0.0.0.0
# REACT_APP_API_BASE_URL=http://localhost:8000
```

---

## 📄 License

Private / Hackathon Project.
