import { createBrowserRouter } from "react-router-dom";
import App, { HomePage } from "./App";
import { DashboardPage } from "./pages/DashboardPage";
import { LearnPage } from "./pages/LearnPage";
import { PracticePage } from "./pages/PracticePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "learn", element: <LearnPage /> },
      { path: "practice", element: <PracticePage /> },
      { path: "dashboard", element: <DashboardPage /> },
    ],
  },
]);
