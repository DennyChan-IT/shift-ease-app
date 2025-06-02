import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("Create Organization");
  const [totalOrganizations, setTotalOrganizations] = useState(0);
  const { getToken } = useAuth();

  const handleClick = (tab: string) => {
    setActiveTab(tab);
  };

  // Fetch organization count on component mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      const token = await getToken();

      try {
        const response = await fetch(
          "http://localhost:8080/api/organizations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setTotalOrganizations(data.length);
        } else {
          console.error("Failed to fetch organizations.");
        }
      } catch (error) {
        console.error("Error fetching organization count:", error);
      }
    };

    fetchOrganizations();
  }, []);

  // Function to increment organization count
  const incrementTotalOrganizations = () => {
    setTotalOrganizations((prevCount) => prevCount + 1);
  };

  return (
    <div className="w-full bg-gray-100 p-6">
      <div className="flex justify-around p-6 space-x-4">
        <div className="bg-white shadow-md rounded-lg p-4 text-center w-1/3">
          <p className="text-gray-600">Total Organizations</p>
          <h3 className="text-2xl font-bold">{totalOrganizations}</h3>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 text-center w-1/3">
          <p className="text-gray-600">Total Employees</p>
          <h3 className="text-2xl font-bold">24</h3>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 text-center w-1/3">
          <p className="text-gray-600">Pending Requests</p>
          <h3 className="text-2xl font-bold">3</h3>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex">
        <div className="w-72 mr-5">
          <div className="font-semibold">Dashboard</div>
          <ul className="pr-5 h-[50vh] border-r border-r-gray-300">
            <li>
              <NavLink
                to="/dashboard/create-organization"
                className={
                  activeTab === "Create Organization"
                    ? "text-blue-600 font-bold"
                    : "text-gray-600"
                }
                onClick={() => handleClick("Create Organization")}
              >
                Create Organization
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/requests"
                className={`${
                  activeTab === "Requests"
                    ? "text-blue-600 font-bold"
                    : "text-gray-600"
                }`}
                onClick={() => handleClick("Requests")}
              >
                Requests
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Pass increment function to CreateOrganization */}
        <Outlet context={{ incrementTotalOrganizations }} />
      </div>
    </div>
  );
}
