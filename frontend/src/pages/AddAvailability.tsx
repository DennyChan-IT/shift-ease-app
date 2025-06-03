import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useParams, useNavigate } from "react-router-dom";
import { EmployeeType } from "../types/Employee";
import { format, addDays } from "date-fns";

type AvailabilityDay = {
  day: string;
  allDay: boolean;
  available: boolean;
  startTime: string;
  endTime: string;
};

export default function AddAvailability() {
  const { id } = useParams(); // ID for editing
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [, setUserOrganizationId] = useState<string | null>(null);
  const [, setUserId] = useState<string | null>(null);

  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  // Helper: Format a Date as YYYY-MM-DD using local time.
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper: Given any date, return the Monday of that week.
  const getMondayOfDate = (date: Date): Date => {
    // In JavaScript, getDay(): 0=Sunday, 1=Monday, etc.
    const day = date.getDay();
    // For Monday, offset is 0; for Tuesday, offset is 1; for Sunday (0), offset is 6.
    const offset = (day + 6) % 7;
    const monday = new Date(date);
    monday.setDate(date.getDate() - offset);
    return monday;
  };

  // Helper: Get current week's Monday (even if it's in the past)
  const getCurrentMonday = (): string => {
    const now = new Date();
    const monday = getMondayOfDate(now);
    return formatDateLocal(monday);
  };

  // Set default dates (Current Monday → Sunday)
  const [effectiveStartDate, setEffectiveStartDate] = useState<string>(
    format(getCurrentMonday() + "T00:00", "yyyy-MM-dd")
  );
  const [effectiveEndDate, setEffectiveEndDate] = useState<string>(
    format(addDays(getCurrentMonday() + "T00:00", 6), "yyyy-MM-dd")
  );

  // Handler for when the date input changes.
  // It takes whatever date the user picks, computes that week's Monday and Sunday.
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    // Append "T00:00" so that the date is treated in local time.
    const selectedDate = new Date(selected + "T00:00");
    const monday = getMondayOfDate(selectedDate);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Update state with the Monday and Sunday of the chosen week.
    setEffectiveStartDate(formatDateLocal(monday));
    setEffectiveEndDate(formatDateLocal(sunday));
  };

  const [availability, setAvailability] = useState<AvailabilityDay[]>([
    {
      day: "Monday",
      allDay: true,
      available: false,
      startTime: "09:00",
      endTime: "23:00",
    },
    {
      day: "Tuesday",
      allDay: true,
      available: false,
      startTime: "09:00",
      endTime: "23:00",
    },
    {
      day: "Wednesday",
      allDay: true,
      available: false,
      startTime: "09:00",
      endTime: "23:00",
    },
    {
      day: "Thursday",
      allDay: true,
      available: false,
      startTime: "09:00",
      endTime: "23:00",
    },
    {
      day: "Friday",
      allDay: true,
      available: false,
      startTime: "09:00",
      endTime: "24:00",
    },
    {
      day: "Saturday",
      allDay: true,
      available: false,
      startTime: "09:00",
      endTime: "24:00",
    },
    {
      day: "Sunday",
      allDay: true,
      available: false,
      startTime: "09:00",
      endTime: "23:00",
    },
  ]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = await getToken();
      try {
        const response = await fetch("http://localhost:8080/api/user-info", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserRole(data.position);
          setUserOrganizationId(data.organizationId);
          setUserId(data.id);

          if (data.position === "Admin") {
            await fetchAllEmployees();
          } else if (data.position === "Manager") {
            await fetchEmployeesByOrganization(data.organizationId);
          } else {
            // For regular employees, set their own ID
            setSelectedEmployee(data.id);
          }
        } else {
          console.error("Failed to fetch user details");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    const fetchAllEmployees = async () => {
      const token = await getToken();
      try {
        const response = await fetch("http://localhost:8080/api/employees", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setEmployees(data);
        } else {
          console.error("Failed to fetch employees");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    const fetchEmployeesByOrganization = async (organizationId: string) => {
      const token = await getToken();
      try {
        const response = await fetch(
          `http://localhost:8080/api/employees?organizationId=${organizationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setEmployees(data);
        } else {
          console.error("Failed to fetch employees");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchUserDetails();
  }, []);

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
        alert(
          id
            ? "Availability updated successfully!"
            : "Availability added successfully!"
        );
        navigate("/availability");
      } else {
        alert("Failed to save availability.");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
    }
  };

  if (!userRole) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex-1 w-full p-6">
      <h2 className="text-xl font-bold mb-4">
        {id ? "Edit Availability" : "Add Availability"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {(userRole === "Admin" || userRole === "Manager") && (
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
        )}

        {userRole !== "Admin" && userRole !== "Manager" && (
          <p>
            Adding availability for: <strong>Yourself</strong>
          </p>
        )}

        {/* Effective Dates */}
        <label className="block">
          <span className="font-semibold">Effective Dates</span>
          <div className="flex space-x-2">
            <input
              type="date"
              value={effectiveStartDate}
              onChange={handleStartDateChange}
              className="p-2 border rounded w-1/2"
              required
              min={getCurrentMonday()} // Allows dates from the current week's Monday onward.
            />
            <input
              type="date"
              value={effectiveEndDate}
              readOnly
              className="p-2 border rounded w-1/2"
            />
          </div>
        </label>

        {/* Availability Slots */}
        <div className="p-4 border rounded-lg shadow space-y-4">
          {availability.map((day, dayIndex) => (
            <div key={day.day}>
              <span className="font-bold">{day.day}</span>
              <div className="mt-2 flex flex-col space-y-2">
                {/* Available Checkbox */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={day.allDay ? true : day.available}
                    disabled={day.allDay}
                    onChange={(e) => {
                      handleDayChange(dayIndex, "available", e.target.checked);
                    }}
                  />
                  <span>Available</span>
                </label>

                {/* All Day Checkbox */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={day.allDay}
                    onChange={(e) => {
                      const isAllDay = e.target.checked;
                      handleDayChange(dayIndex, "allDay", isAllDay);
                      if (isAllDay) {
                        handleDayChange(dayIndex, "available", true);
                      }
                    }}
                  />
                  <span>All Day</span>
                </label>

                {/* Time Inputs */}
                {!day.allDay && day.available && (
                  <div className="flex space-x-4 items-center">
                    <input
                      type="time"
                      value={day.startTime}
                      onChange={(e) =>
                        handleDayChange(dayIndex, "startTime", e.target.value)
                      }
                      className="border rounded p-2"
                    />
                    <input
                      type="time"
                      value={day.endTime}
                      onChange={(e) =>
                        handleDayChange(dayIndex, "endTime", e.target.value)
                      }
                      className="border rounded p-2"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save
        </button>
      </form>
    </div>
  );
}
