import React, { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useOrganizations } from "../contexts/organization-context";

type ScheduleDay = {
  date: Date;
  employees: number;
};

const Schedules = () => {
  const [currentWeek, setCurrentWeek] = useState<ScheduleDay[] | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<string>(""); // Track the selected organization
  const { organizations } = useOrganizations(); // Fetch organizations

  // Calculate the current week (based on today's date)
  useEffect(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const days: ScheduleDay[] = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      days.push({
        date: day,
        employees: 0, // Default employee count
      });
    }
    setCurrentWeek(days);
  }, []);

  const handleOrganizationChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedOrganization(event.target.value);
  };

  // Ensure data is loaded before rendering
  if (!currentWeek) {
    return;
  }

  return (
    <div className="w-full p-4 bg-gray-100 min-h-screen">
      {/* Week Navigation */}
      <div className="flex mb-6">
        <button
          className=" border border-gray-200 bg-white px-2 py-1 hover:bg-gray-300"
          onClick={() => {
            const newWeek = currentWeek.map((day) => ({
              ...day,
              date: addDays(day.date, -7),
            }));
            setCurrentWeek(newWeek);
          }}
        >
          &lt;
        </button>
        <div className="flex bg-white items-center font-semibold border border-gray-200 px-4 py-1">
          {format(currentWeek[0]?.date, "MMM dd, yyyy")} -{" "}
          {format(currentWeek[6]?.date, "MMM dd, yyyy")}
        </div>
        <button
          className="border border-gray-200 bg-white px-2 py-1  hover:bg-gray-300"
          onClick={() => {
            const newWeek = currentWeek.map((day) => ({
              ...day,
              date: addDays(day.date, 7),
            }));
            setCurrentWeek(newWeek);
          }}
        >
          &gt;
        </button>
      </div>

      {/* Dropdown for selecting organization */}
      <div className="mb-4">
        <select
          value={selectedOrganization}
          onChange={handleOrganizationChange}
          className="p-2 border rounded"
        >
          <option value="" disabled>
            Choose an organization
          </option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {/* Week Grid */}
      <div className="w-full">
        <div className="flex">
          <div className="rounded-t-xl overflow-hidden border border-gray-300">
            <table>
              <thead>
                <th className="w-[20vw] p-4 bg-white border border-gray-300"></th>
                {currentWeek.map((day) => (
                  <th
                    key={day.date.toISOString()}
                    className={`w-[10vw] p-4 bg-white border border-gray-300`}
                  >
                    <div
                      className={`flex justify-between ${
                        isSameDay(day.date, new Date()) ? "bg-gray-300" : ""
                      }`}
                    >
                      <div className="mr-7">
                        <h3 className="text-left text-lg font-bold">
                          {format(day.date, "E")}
                        </h3>
                        <p className="font-bold text-sm text-gray-500">
                          {format(day.date, "MMM dd")}
                        </p>
                      </div>
                      <div className="flex items-center p-3">
                        {day.employees}
                      </div>
                    </div>
                  </th>
                ))}
              </thead>
              <tbody>
                <td className="bg-white border border-gray-300 px-4 py-2 font-bold text-left">
                  <button className="bg-black text-white px-1 rounded hover:bg-gray-700 transition">
                    + Add Employee
                  </button>
                </td>
                {Array.from({ length: 7 }).map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className="bg-white border border-gray-300 px-4 py-2"
                  ></td>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedules;
