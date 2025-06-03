import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoutes from "./protected-router";
import RoleSelection from "../pages/RoleSelection";
import AdminSignIn from "../pages/AdminSignIn";
import AdminSignUp from "../pages/AdminSignUp";
import { Sidebar } from "../layouts/sidebar";
import { Dashboard } from "../pages/Dashboard";
import { CreateOrganization } from "../components/CreateOrganization";
import Organizations from "../pages/Organizations";
import OrganizationDetails from "../pages/OrganizationDetails";

export const router = createBrowserRouter([
  {
    path: "/sign-in",
    element: <RoleSelection />, // Default route to RoleSelection
  },
  {
    path: "/admin-signin",
    element: <AdminSignIn />,
  },
  {
    path: "/admin-signup",
    element: <AdminSignUp />,
  },
  {
    element: <ProtectedRoutes />, // Wrap protected routes here
    children: [
      {
        element: <Sidebar />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
            children: [
              { path: "", element: <Navigate to="create-organization" replace /> }, // Redirect to /dashboard/create-organization
              {
                path: "/dashboard/create-organization",
                element: <CreateOrganization />,
              },
            ],
          },
          {
            path: "/organizations",
            element: <Organizations />,
          },
          {
            path: "/organizations/:id",
            element: <OrganizationDetails />,
          },          
        ],
      },
    ],
  },
]);
