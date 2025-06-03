import { useAuth } from "@clerk/clerk-react";
import React, { useRef, useState } from "react";
import { EmployeeType } from "../types/Employee";

type AddNewEmployeeProps = {
  organizationId?: string;
  onAdd: (newEmployee: EmployeeType) => void;
};

export function AddNewEmployee({ organizationId, onAdd  }: AddNewEmployeeProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const { getToken } = useAuth();

  const openModal = () => {
    dialogRef.current?.showModal();
  };

  const closeModal = () => {
    dialogRef.current?.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();

    try {
      const response = await fetch("http://localhost:8080/api/employees", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, position, organizationId }), // Include organizationId here
      });

      if (response.ok) {
        const newEmployee = await response.json();
        console.log("Employee added successfully!");
        onAdd(newEmployee); // Call the callback to update state in the parent
        closeModal();
      } else {
        console.error("Failed to add employee");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="bg-black text-white py-2 px-4 rounded hover:bg-gray-700 transition"
      >
        + Add New Employee
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-lg w-96 p-6 bg-white shadow-lg text-left"
      >
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
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="" disabled>
                Select a position
              </option>
              <option value="Manager">Manager</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Employee
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
