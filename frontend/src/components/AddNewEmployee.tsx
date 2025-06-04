import { useAuth } from "@clerk/clerk-react";
import React, { useRef, useState } from "react";
import { EmployeeType } from "../types/Employee";

type AddNewEmployeeProps = {
  organizationId?: string;
  onAdd: (newEmployee: EmployeeType) => void;
};

export function AddNewEmployee({ organizationId, onAdd }: AddNewEmployeeProps) {
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

    // Optionally, check if the employee already exists (by email)
    const checkResponse = await fetch("http://localhost:8080/api/employees/by-email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const checkResult = await checkResponse.json();
    
    if (checkResult && checkResult.exists && !checkResult.isActive) {
      // Reactivate the employee if they exist but are deactivated
      const reactivateResponse = await fetch("http://localhost:8080/api/employees/reactivate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const result = await reactivateResponse.json();
      if (reactivateResponse.ok) {
        alert("Employee reactivated successfully");
        onAdd(result.employee);
        closeModal();
        return;
      } else {
        alert("Failed to reactivate employee");
        return;
      }
    }
    
    // Proceed with normal employee creation logic if no inactive employee exists
    try {
      const response = await fetch("http://localhost:8080/api/employees", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, position, organizationId }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.request) {
          // Pending request logic for managers
          alert("Your request has been submitted for admin approval. No invitation will be sent until approved.");
        } else {
          // Directly added employee logic for non-managers
          console.log("Employee added successfully!");
          onAdd(result);

          // Send invitation
          const invitationResponse = await fetch("http://localhost:8080/api/invitations", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ emailAddress: email }),
          });

          const invitationData = await invitationResponse.json();
          if (invitationResponse.ok && invitationData.success) {
            console.log(`Invitation created successfully! ID: ${invitationData.invitation.id}`);
          } else {
            console.error("Failed to create invitation.");
          }
        }
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
