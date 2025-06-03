import { LuBuilding } from "react-icons/lu";
import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { useOrganizations } from "../contexts/organization-context";
import { useEffect } from "react";
import { useEmployees } from "../contexts/employee-context";

export default function Organizations() {
  const { organizations, remove } = useOrganizations();
  const { employees, fetchEmployees } = useEmployees();

  useEffect(() => {
    fetchEmployees();
  }, []);
  
  if (organizations.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center h-screen bg-gray-100">
        <LuBuilding className="text-gray-500 text-6xl mx-auto mb-4" />

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          No Organizations Yet
        </h2>
        <p className="text-gray-600 mb-6">
          Get started by adding your first organization to manage employees and
          schedules.
        </p>
        <Link to="/dashboard/create-organization">
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
            + Add Your First Organization
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Organizations Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <div
            key={org.id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition relative"
          >
            <div className="flex justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                {org.name}
              </h3>
              <button
                onClick={() => remove(org.id)}
                className="text-center text-red-500 hover:text-red-700 transition"
              >
                <FiTrash2 />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              📍 {org.location || "Location not specified"}
            </p>
            <p className="text-gray-600 mb-4">{employees.length} employees</p>{" "}
            <button>
              <Link
                to={`/organizations/${org.id}`}
                className="bg-black text-white py-1 px-3 rounded hover:bg-gray-700 transition"
              >
                View Details
              </Link>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
