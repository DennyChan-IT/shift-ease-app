import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";

type Availability = {
  id: string;
  effectiveStart: string;
  effectiveEnd: string;
  status: string;
  employee: { name: string };
};

export function Availability() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchAvailabilities = async () => {
      const token = await getToken();
      const response = await fetch("http://localhost:8080/api/employees/availabilities", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAvailabilities(data);
    };

    fetchAvailabilities();
  }, []);

  const handleEdit = (id: string) => {
    navigate(`/availability/edit/${id}`);
  };

  return (
    <div className="flex-1 w-full p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Availability</h2>
        <Link to="/add-availability">
          <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-700 transition">
            + Add Availability
          </button>
        </Link>
      </div>
      <table className="w-full bg-white shadow rounded">
        <thead className="border border-b">
          <tr>
            <th className="px-4 py-2 text-left">Employee</th>
            <th className="px-4 py-2 text-left">Effective Dates</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {availabilities.map((availability) => (
            <tr key={availability.id} className="border-b">
              <td className="px-4 py-2">{availability.employee.name}</td>
              <td className="px-4 py-2">
                {new Date(availability.effectiveStart).toLocaleDateString()} -{" "}
                {new Date(availability.effectiveEnd).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => handleEdit(availability.id)}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button className="text-red-500 hover:underline ml-2">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
