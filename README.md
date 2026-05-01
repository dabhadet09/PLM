# Predictive Maintenance Lite — Setup Guide

## Prerequisites (install once)

| Tool | Download |
|------|----------|
| .NET 10 SDK | https://dotnet.microsoft.com/download |
| Node.js (v18+) | https://nodejs.org |
| Git | https://git-scm.com |

---

## Step 1 — Clone the repo

```bash
git clone https://github.com/dabhadet09/PLM.git
cd PLM
```

---

## Step 2 — Run the Backend API

```bash
cd PlmApi

# Restore NuGet packages
dotnet restore

# Apply database migrations (creates app.db SQLite file automatically)
dotnet ef database update

# Start the API
dotnet run
```

> API runs at: **http://localhost:5160**
> No SQL Server or LocalDB needed — uses SQLite (file-based, zero config).

---

## Step 3 — Run the Frontend UI

Open a **new terminal window**:

```bash
cd plm-ui

# Install all packages including Bootstrap (done automatically)
npm install

# Start the dev server
npm run dev
```

> App runs at: **http://localhost:5173**

---

## Step 4 — Run the IoT Simulator (optional)

Open another terminal **after** the API is running and at least one asset + sensor exists:

```bash
cd PlmSimulator
dotnet run
```

---

## First-Time Setup in the App

1. Open **http://localhost:5173/register**
2. Register an **Admin** account (first Admin only — system enforces one Admin)
3. Register **Engineer** accounts as needed
4. Log in and add Assets, Sensors, and Thresholds from the Dashboard

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `dotnet ef` not found | Run: `dotnet tool install --global dotnet-ef` |
| Port 5160 already in use | Change port in `PlmApi/Properties/launchSettings.json` |
| `npm` not found | Install Node.js from nodejs.org |
| Blank screen on login | Make sure the API is running on port 5160 |
