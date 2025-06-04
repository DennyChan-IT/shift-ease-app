import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@clerk/clerk-react";
import { EmployeeType } from "../types/Employee";
import { FiUserPlus } from "react-icons/fi";

type AddNewEmployeeProps = {
  organizationId?: string;
  onAdd: (newEmployee: EmployeeType) => void;
};

export function AddNewEmployee({ organizationId, onAdd }: AddNewEmployeeProps) {
  const { getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();

    // Check for inactive
    const checkRes = await fetch("http://localhost:8080/api/employees/by-email", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const check = await checkRes.json();
    if (check.exists && !check.isActive) {
      const reactRes = await fetch("http://localhost:8080/api/employees/reactivate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const { employee } = await reactRes.json();
      onAdd(employee);
      setIsOpen(false);
      return;
    }

    // Create new
    const newRes = await fetch("http://localhost:8080/api/employees", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, position, organizationId }),
    });
    const result = await newRes.json();
    if (newRes.ok) {
      if (!result.request) {
        onAdd(result);
        // invitation
        await fetch("http://localhost:8080/api/invitations", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ emailAddress: email }),
        });
      } else {
        alert("Request submitted for approval.");
      }
      setIsOpen(false);
    } else {
      console.error("Failed to add employee", result);
    }
  };

  // Modal markup
  const modal = (
    <div className="fixed inset-0 flex items-center justify-center z-[100]">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative bg-white rounded-lg shadow-lg w-96 p-6 z-10">
        <h2 className="text-xl font-semibold mb-4">Add New Employee</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Position</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
      >
        <FiUserPlus className="mr-2" /> Add New Employee
      </button>
      {isOpen && createPortal(modal, document.body)}
    </>
  );
}
