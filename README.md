# Stock Dashboard

The frontend is a React app powered by Vite. It requests daily stock data from
the ASP.NET Core API.

## Run locally

Start the API in one terminal from the repository root:

```powershell
dotnet run --project .\StockDashboard.Api\StockDashboard.Api.csproj --urls http://localhost:5001
```

In another terminal, start the React frontend:

```powershell
cd .\frontend
npm install
npm run dev
```

Open the frontend URL printed by Vite (usually `http://localhost:5173`). Do not
open the API URL (`http://localhost:5001`) as the website; it serves API data,
not the React page. Vite proxies `/api` requests to the API at port `5001`.

Create a production build with:

```powershell
npm run build
```