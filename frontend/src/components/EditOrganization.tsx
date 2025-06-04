import React, { useRef, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { useAuth } from "@clerk/clerk-react";
import { OrganizationType } from "../types/Organization";

type Props = {
  organization: OrganizationType;
  onClose: () => void;
};

export function EditOrganization({ organization, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(organization.name);
  const [location, setLocation] = useState(organization.location);
  const { getToken } = useAuth();

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    const res = await fetch(
      `http://localhost:8080/api/organizations/${organization.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, location }),
      }
    );
    if (res.ok) {
      close();
      onClose();
    } else {
      console.error("Failed to update organization");
    }
  };

  return (
    <>
      <button onClick={open} className="text-gray-500 hover:text-blue-500">
        <FiEdit />
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-lg w-80 p-6 bg-white shadow-lg"
      >
        <h3 className="text-lg font-semibold mb-4">Edit Organization</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
