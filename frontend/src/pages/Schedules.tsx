import React, { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useOrganizations } from "../contexts/organization-context";
import { useAuth } from "@clerk/clerk-react";

type ScheduleDay = {
  date: Date;
  employees: number;
};

type EmployeeType = {
  id: string;
  name: string;
};

type AvailabilitySlot = {
  startTime: string;
  endTime: string;
};

// Simple modal component to show availability and assign hours
function AvailabilityModal({
  isOpen,
  onClose,
  date,
  employee,
  availabilityData,
  onAssign,
}: {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  employee: EmployeeType | null;
  availabilityData: AvailabilitySlot[];
  onAssign: (slot: AvailabilitySlot) => void;
}) {
  if (!isOpen || !employee || !date) return null;

  return (
    <dialog open className="rounded-lg p-6 bg-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">
        Assign Hours for {employee.name} on {format(date, "MMM dd, yyyy")}
      </h2>
      <ul className="space-y-2 mb-4">
        {availabilityData.map((slot, idx) => (
          <li key={idx}>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => {
                onAssign(slot);
                onClose();
              }}
            >
              {slot.startTime} - {slot.endTime}
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={onClose}
        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
      >
        Cancel
      </button>
    </dialog>
  );
}

const Schedules = () => {
  const [currentWeek, setCurrentWeek] = useState<ScheduleDay[] | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [availableEmployees, setAvailableEmployees] = useState<EmployeeType[]>([]);
  const [addedEmployees, setAddedEmployees] = useState<EmployeeType[]>([]);
  const { organizations } = useOrganizations();
  const { getToken } = useAuth();


  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [modalEmployee, setModalEmployee] = useState<EmployeeType | null>(null);

  // Mock availability data
  const mockAvailabilityData: AvailabilitySlot[] = [
    { startTime: "08:00", endTime: "12:00" },
    { startTime: "12:00", endTime: "16:00" },
    { startTime: "16:00", endTime: "20:00" },
  ];

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

  const handleOrganizationChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    
    const orgId = event.target.value;
    setSelectedOrganization(orgId);
    const token = await getToken();

    if (orgId) {
      try {
        const response = await fetch(`http://localhost:8080/api/employees/availabilities`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,

          },
        });

        if (response.ok) {
          const data = await response.json();
          const filteredEmployees = data.filter(
            (availability: any) => availability.employee.organizationId === orgId
          );
          setAvailableEmployees(filteredEmployees.map((item: any) => item.employee));
        }
      } catch (error) {
        console.error("Error fetching available employees:", error);
      }
    }
  };

  const handleAddEmployee = (employee: EmployeeType) => {
    setAddedEmployees((prev) => [...prev, employee]);
    setAvailableEmployees((prev) => prev.filter((emp) => emp.id !== employee.id));
  };

  const handleCellClick = (day: ScheduleDay, employee: EmployeeType) => {
    setModalDate(day.date);
    setModalEmployee(employee);
    setIsModalOpen(true);
  };

  const handleAssign = (slot: AvailabilitySlot) => {
    // Integrate logic to save the assigned hours
    // to the backend or update state accordingly.
    console.log(
      `Assigned ${slot.startTime}-${slot.endTime} to ${modalEmployee?.name} on ${modalDate}`
    );
    // Update your schedule state or send data to the backend here.
  };

  if (!currentWeek) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full p-4 bg-gray-100 min-h-screen">
      {/* Week Navigation */}
      <div className="flex mb-6">
        <button
          className="border border-gray-200 bg-white px-2 py-1 hover:bg-gray-300"
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
          className="border border-gray-200 bg-white px-2 py-1 hover:bg-gray-300"
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
            <table className="w-full">
              <thead>
                <tr>
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
                        <div className="flex items-center p-3">{day.employees}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {addedEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="bg-white border border-gray-300 px-4 py-2 font-bold text-left">
                      {employee.name}
                    </td>
                    {currentWeek.map((day) => (
                      <td
                        key={day.date.toISOString()}
                        className="bg-white border border-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(day, employee)}
                      >
                        {/* Display assigned hours, else empty */}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="bg-white border border-gray-300 px-4 py-2 font-bold text-left">
                    <select
                      className="p-2 border rounded"
                      onChange={(e) => {
                        const selectedEmployee = availableEmployees.find(
                          (emp) => emp.id === e.target.value
                        );
                        if (selectedEmployee) handleAddEmployee(selectedEmployee);
                      }}
                    >
                      <option value="" disabled selected>
                        Add Employee
                      </option>
                      {availableEmployees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  {currentWeek.map((day) => (
                    <td
                      key={day.date.toISOString()}
                      className="bg-white border border-gray-300 px-4 py-2"
                    ></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AvailabilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={modalDate}
        employee={modalEmployee}
        availabilityData={mockAvailabilityData}
        onAssign={handleAssign}
      />
    </div>
  );
};

export default Schedules;
