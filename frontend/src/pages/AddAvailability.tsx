import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEmployees } from "../contexts/employee-context";

type AvailabilityDay = {
  day: string;
  allDay: boolean;
  available: boolean;
  startTime: string;
  endTime: string;
};

export default function AddAvailability() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchEmployees, employees } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [effectiveStartDate, setEffectiveStartDate] = useState<string>("");
  const [effectiveEndDate, setEffectiveEndDate] = useState<string>("");
  const { getToken } = useAuth();

  const [availability, setAvailability] = useState<AvailabilityDay[]>([
    {
      day: "Monday",
      allDay: false,
      available: true,
      startTime: "",
      endTime: "",
    },
    {
      day: "Tuesday",
      allDay: false,
      available: true,
      startTime: "",
      endTime: "",
    },
    {
      day: "Wednesday",
      allDay: false,
      available: true,
      startTime: "",
      endTime: "",
    },
    {
      day: "Thursday",
      allDay: false,
      available: true,
      startTime: "",
      endTime: "",
    },
    {
      day: "Friday",
      allDay: false,
      available: true,
      startTime: "",
      endTime: "",
    },
    {
      day: "Saturday",
      allDay: false,
      available: true,
      startTime: "",
      endTime: "",
    },
    {
      day: "Sunday",
      allDay: false,
      available: true,
      startTime: "",
      endTime: "",
    },
  ]);

  useEffect(() => {
    fetchEmployees();

    // Fetch existing availability for editing
    const fetchAvailability = async () => {
      if (id) {
        const token = await getToken();
        const response = await fetch(`http://localhost:8080/api/employees/availabilities/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setSelectedEmployee(data.employeeId || "");
          setEffectiveStartDate(
            new Date(data.effectiveStart || Date.now()).toISOString().slice(0, 10)
          );
          setEffectiveEndDate(
            new Date(data.effectiveEnd || Date.now()).toISOString().slice(0, 10)
          );
          setAvailability(data.availability || []);
        } else {
          console.error("Failed to fetch availability data");
        }
      }
    };

    fetchAvailability();
  }, [id]);

  const handleDayChange = <T extends keyof AvailabilityDay>(
    index: number,
    field: T,
    value: AvailabilityDay[T]
  ) => {
    setAvailability((prev) =>
      prev.map((day, i) => (i === index ? { ...day, [field]: value } : day))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();

    const payload = {
      employeeId: selectedEmployee,
      effectiveStart: new Date(effectiveStartDate).toISOString(),
      effectiveEnd: new Date(effectiveEndDate).toISOString(),
      availability,
    };

    const url = id
      ? `http://localhost:8080/api/employees/availabilities/${id}`
      : `http://localhost:8080/api/employees/availabilities`;

    const method = id ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(id ? "Availability updated successfully!" : "Availability added successfully!");
        navigate("/availability");
      } else {
        alert("Failed to save availability.");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-xl font-bold mb-4">{id ? "Edit Availability" : "Add Availability"}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="block">
            <span className="font-semibold">Select Employee</span>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="" disabled>
                Choose an employee
              </option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-semibold">Effective Dates</span>
            <div className="flex space-x-2">
              <input
                type="date"
                value={effectiveStartDate}
                onChange={(e) => setEffectiveStartDate(e.target.value)}
                className="p-2 border rounded w-1/2"
                required
              />
              <input
                type="date"
                value={effectiveEndDate}
                onChange={(e) => setEffectiveEndDate(e.target.value)}
                className="p-2 border rounded w-1/2"
                required
              />
            </div>
          </label>
        </div>

        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          {availability.map((day, dayIndex) => (
            <div key={day.day}>
              <span className="font-bold">{day.day}</span>
              <div className="mt-2 flex flex-col space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={day.available}
                    onChange={(e) => handleDayChange(dayIndex, "available", e.target.checked)}
                  />
                  <span>Available</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={day.allDay}
                    onChange={(e) => handleDayChange(dayIndex, "allDay", e.target.checked)}
                  />
                  <span>All Day</span>
                </label>

                {!day.allDay && day.available && (
                  <div className="flex space-x-4 items-center">
                    <input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => handleDayChange(dayIndex, "startTime", e.target.value)}
                      className="border rounded p-2"
                    />
                    <input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => handleDayChange(dayIndex, "endTime", e.target.value)}
                      className="border rounded p-2"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Save
        </button>
      </form>
    </div>
  );
}
