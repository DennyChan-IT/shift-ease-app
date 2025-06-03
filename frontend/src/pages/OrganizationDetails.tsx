import { useAuth } from "@clerk/clerk-react";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { OrganizationType } from "../types/Organization";

export default function OrganizationDetails() {
  const { id } = useParams<{ id: string }>();
  const [organization, setOrganization] = useState<OrganizationType | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchOrganizationDetails = async () => {
      const token = await getToken();

      try {
        const response = await fetch(`http://localhost:8080/api/organizations/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setOrganization(data);
        } else {
          console.error("Failed to fetch organization details");
        }
      } catch (error) {
        console.error("Error fetching organization details:", error);
      }
    };

    fetchOrganizationDetails();
  }, [id]);

  if (!organization) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full p-6 bg-gray-100">
      {/* Back to Organizations Button */}
      <Link
        to="/organizations"
        className="text-blue-500 flex items-center mb-4 hover:underline"
      >
        ← Back to Organizations
      </Link>

      {/* Organization Details Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">{organization.name}</h2>
          <p className="text-gray-600">📍 {organization.location}</p>
        </div>
        {/* Add New Employee Button */}
        <button className="bg-black text-white py-2 px-4 rounded hover:bg-gray-700 transition">
          + Add New Employee
        </button>
      </div>

      {/* Employee List Section */}
      <h3 className="text-xl font-semibold mb-2">Employee List</h3>
      {organization.employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-8 bg-white p-8 rounded-lg shadow-lg">
          <div className="text-gray-500 text-6xl mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 12c2.28 0 4-1.72 4-4S14.28 4 12 4 8 5.72 8 8s1.72 4 4 4zM12 14c-2.28 0-7 1.14-7 3.5V20h14v-2.5c0-2.36-4.72-3.5-7-3.5z"
              />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-800">No Employees Yet</h4>
          <p className="text-gray-600 text-center mb-4">
            Start building your team at {organization.name} by adding your first employee.
          </p>
        </div>
      ) : (
        <ul className="bg-white p-4 rounded-lg shadow-lg">
          {organization.employees.map((employee) => (
            <li key={employee.id} className="mb-2">
              <p className="text-gray-800 font-medium">{employee.name}</p>
              <p className="text-gray-600">{employee.position}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
