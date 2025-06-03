import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { PendingRequest } from "../types/PendingRequest";

export default function PendingRequests() {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [userPosition, setUserPosition] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = await getToken();
      try {
        const response = await fetch("http://localhost:8080/api/employees/logged-user", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserPosition(data.position); // Store user's position
        } else {
          console.error("Failed to fetch user details");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      const token = await getToken();
      try {
        const response = await fetch(
          "http://localhost:8080/api/employees/pending-requests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setPendingRequests(data);
        } else {
          console.error("Failed to fetch pending requests");
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleApprove = async (id: string) => {
    const token = await getToken();
    try {
      const response = await fetch(
        `http://localhost:8080/api/employees/pending-requests/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        setPendingRequests((prev) =>
          prev.filter((request) => request.id !== id)
        );
      } else {
        console.error("Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleDeny = async (id: string) => {
    const token = await getToken();
    try {
      const response = await fetch(
        `http://localhost:8080/api/employees/pending-requests/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        setPendingRequests((prev) =>
          prev.filter((request) => request.id !== id)
        );
      } else {
        console.error("Failed to deny request");
      }
    } catch (error) {
      console.error("Error denying request:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Pending Requests</h2>
      <ul>
        {pendingRequests.map((request) => (
          <li
            key={request.id}
            className="flex justify-between items-center border-b pb-4 mb-4"
          >
            <div>
              <p className="font-medium text-gray-800">{request.name}</p>
              <p className="text-sm text-gray-600">{request.position}</p>
            </div>
            {userPosition !== "Manager" && ( // Only render buttons if not a Manager
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApprove(request.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDeny(request.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Deny
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
