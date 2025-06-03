import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

type RoleProtectedRouteProps = {
  children: JSX.Element;
  allowedRoles: string[]; // List of roles allowed to access this route
};

export default function RoleProtectedRoute({
  children,
  allowedRoles,
}: RoleProtectedRouteProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = await getToken();
      try {
        const response = await fetch(
          "http://localhost:8080/api/employees/logged-user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserRole(data.position); // Set the user's role
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserDetails();
  }, []);

  if (!userRole) {
    return <p>Loading...</p>; // Show a loading state while fetching the role
  }

  // If the user role is not allowed, redirect to the dashboard or another page
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard/requests" />;
  }

  // Render the protected component if the user has the required role
  return children;
}
