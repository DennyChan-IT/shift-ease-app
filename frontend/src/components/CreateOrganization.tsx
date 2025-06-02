import { useAuth } from "@clerk/clerk-react";
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";

export function CreateOrganization() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const { getToken } = useAuth();

  // Get the increment function from the outlet context
  const { incrementTotalOrganizations } = useOutletContext<{ incrementTotalOrganizations: () => void }>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();

    try {
      const response = await fetch("http://localhost:8080/api/organizations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, location }),
      });

      if (response.ok) {
        setMessage("Organization created successfully!");
        setName("");
        setLocation("");
        
        // Update total organizations count
        incrementTotalOrganizations();
      } else {
        setMessage("Failed to create organization.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred.");
    }
  };

  return (
    <div className="pl-5 bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4">Organization Details</h3>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Organization Name</label>
        <input
          type="text"
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block mb-2">Location</label>
        <input
          type="text"
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button type="submit" className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-700">
          Create Organization
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
