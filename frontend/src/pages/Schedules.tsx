import React, { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useOrganizations } from "../contexts/organization-context";
import { useAuth } from "@clerk/clerk-react";

type EmployeeType = {
  id: string;
  name: string;
  organizationId: string;
};

type DailyAvailabilitySlot = {
  day: string;
  allDay: boolean;
  available: boolean;
  startTime?: string | null;
  endTime?: string | null;
};

type Availability = {
  id: string;
  employeeId: string;
  effectiveStart: string;
  effectiveEnd: string;
  DailyAvailabilitySlot: DailyAvailabilitySlot[];
  employee: {
    id: string;
    name: string;
    organizationId: string;
  };
};

type ScheduledShift = {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  employee: {
    id: string;
    name: string;
    organizationId: string;
  };
};

type ScheduleDay = {
  date: Date;
  employees: number;
};

type AvailabilitySlot = {
  startTime: string;
  endTime: string;
};

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
  availabilityData: DailyAvailabilitySlot[];
  onAssign: (slot: AvailabilitySlot) => void;
}) {
  if (!isOpen || !employee || !date) return null;

  const validSlots = availabilityData
    .filter((slot) => slot.available)
    .map((slot) => {
      const start = slot.allDay && !slot.startTime ? "00:00" : slot.startTime;
      const end = slot.allDay && !slot.endTime ? "23:59" : slot.endTime;
      return { startTime: start || "", endTime: end || "" };
    });

  if (validSlots.length === 0) {
    return (
      <dialog open className="rounded-lg p-6 bg-white shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          No valid slots available for {employee.name} on {format(date, "MMM dd, yyyy")}.
        </h2>
        <button
          onClick={onClose}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </dialog>
    );
  }

  return (
    <dialog open className="rounded-lg p-6 bg-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">
        Assign Hours for {employee.name} on {format(date, "MMM dd, yyyy")}
      </h2>
      <ul className="space-y-2 mb-4">
        {validSlots.map((slot, idx) => (
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

  const [availabilitiesByEmployee, setAvailabilitiesByEmployee] = useState<{ [employeeId: string]: Availability[] }>({});
  const [scheduledShifts, setScheduledShifts] = useState<ScheduledShift[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [modalEmployee, setModalEmployee] = useState<EmployeeType | null>(null);
  const [modalSlots, setModalSlots] = useState<DailyAvailabilitySlot[]>([]);

  // Initialize current week
  useEffect(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const days: ScheduleDay[] = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      days.push({ date: day, employees: 0 });
    }
    setCurrentWeek(days);
  }, []);

  const fetchAvailabilities = async (orgId: string) => {
    const token = await getToken();
    const response = await fetch("http://localhost:8080/api/employees/availabilities", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.error("Failed to fetch availabilities");
      return;
    }

    const data: Availability[] = await response.json();
    const filteredData = data.filter((av) => av.employee.organizationId === orgId);

    const uniqueEmployees: EmployeeType[] = [];
    const seenEmployeeIds = new Set<string>();
    for (const item of filteredData) {
      if (!seenEmployeeIds.has(item.employee.id)) {
        seenEmployeeIds.add(item.employee.id);
        uniqueEmployees.push({
          id: item.employee.id,
          name: item.employee.name,
          organizationId: item.employee.organizationId,
        });
      }
    }

    setAvailableEmployees(uniqueEmployees);

    const grouped: { [employeeId: string]: Availability[] } = {};
    for (const avail of filteredData) {
      if (!grouped[avail.employeeId]) {
        grouped[avail.employeeId] = [];
      }
      grouped[avail.employeeId].push(avail);
    }
    setAvailabilitiesByEmployee(grouped);
  };

  const fetchScheduledShifts = async (orgId: string) => {
    const token = await getToken();
    const response = await fetch(`http://localhost:8080/api/employees/scheduled-shifts?organizationId=${orgId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const data: ScheduledShift[] = await response.json();
      setScheduledShifts(data);
    } else {
      console.error("Failed to fetch scheduled shifts");
    }
  };

  const handleOrganizationChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const orgId = event.target.value;
    setSelectedOrganization(orgId);
    if (orgId) {
      await fetchAvailabilities(orgId);
      await fetchScheduledShifts(orgId);
    }
  };

  const handleAddEmployee = (employee: EmployeeType) => {
    setAddedEmployees((prev) => {
      if (prev.some((e) => e.id === employee.id)) return prev;
      return [...prev, employee];
    });
    setAvailableEmployees((prev) => prev.filter((emp) => emp.id !== employee.id));
  };

  const handleCellClick = (day: ScheduleDay, employee: EmployeeType) => {
    const employeeAvailabilities = availabilitiesByEmployee[employee.id] || [];
    const targetDayName = format(day.date, "EEEE");

    const dateAvailabilities = employeeAvailabilities.filter((av) => {
      const start = new Date(av.effectiveStart);
      const end = new Date(av.effectiveEnd);
      return day.date >= start && day.date <= end;
    });

    let daySlots: DailyAvailabilitySlot[] = [];
    for (const av of dateAvailabilities) {
      const slotsForDay = av.DailyAvailabilitySlot.filter((slot) => slot.day === targetDayName);
      daySlots = daySlots.concat(slotsForDay);
    }

    const hasAvailableSlot = daySlots.some((s) => s.available);
    if (!hasAvailableSlot) return;

    setModalDate(day.date);
    setModalEmployee(employee);
    setModalSlots(daySlots);
    setIsModalOpen(true);
  };

  const handleAssign = async (slot: AvailabilitySlot) => {
    if (!modalEmployee || !modalDate) return;
    const token = await getToken();
    const dateString = modalDate.toISOString();

    try {
      const response = await fetch("http://localhost:8080/api/employees/scheduled-shifts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: modalEmployee.id,
          date: dateString,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }),
      });

      if (response.ok) {
        console.log("Shift assigned successfully");
        // After assigning a shift, refetch the scheduled shifts to update the UI
        if (selectedOrganization) {
          await fetchScheduledShifts(selectedOrganization);
        }
      } else {
        console.error("Failed to assign shift:", await response.text());
      }
    } catch (error) {
      console.error("Error assigning shift:", error);
    }
  };

  if (!currentWeek) {
    return <div>Loading...</div>;
  }

  // Helper to find assigned shift for a given employee and date
  const findAssignedShift = (employeeId: string, date: Date): ScheduledShift | undefined => {
    return scheduledShifts.find((shift) => {
      const shiftDate = new Date(shift.date);
      return shift.employeeId === employeeId &&
             shiftDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="w-full p-4 bg-gray-100 min-h-screen">
      <div className="flex mb-6">
        <button
          className="border border-gray-200 bg-white px-2 py-1 hover:bg-gray-300"
          onClick={() => {
            if (!currentWeek) return;
            const newWeek = currentWeek.map((day) => ({
              ...day,
              date: addDays(day.date, -7),
            }));
            setCurrentWeek(newWeek);
          }}
        >
          &lt;
        </button>
        {currentWeek && (
          <div className="flex bg-white items-center font-semibold border border-gray-200 px-4 py-1">
            {format(currentWeek[0].date, "MMM dd, yyyy")} -{" "}
            {format(currentWeek[6].date, "MMM dd, yyyy")}
          </div>
        )}
        <button
          className="border border-gray-200 bg-white px-2 py-1 hover:bg-gray-300"
          onClick={() => {
            if (!currentWeek) return;
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

      <div className="w-full">
        <div className="flex">
          <div className="rounded-t-xl overflow-hidden border border-gray-300 w-full">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-[20vw] p-4 bg-white border border-gray-300"></th>
                  {currentWeek.map((day) => (
                    <th
                      key={day.date.toISOString()}
                      className={`w-[10vw] p-4 bg-white border border-gray-300`}
                    >
                      <div className={`flex justify-between ${isSameDay(day.date, new Date()) ? "bg-gray-300" : ""}`}>
                        <div className="mr-7">
                          <h3 className="text-left text-lg font-bold">{format(day.date, "E")}</h3>
                          <p className="font-bold text-sm text-gray-500">{format(day.date, "MMM dd")}</p>
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
                    {currentWeek.map((day) => {
                      const assignedShift = findAssignedShift(employee.id, day.date);

                      if (assignedShift) {
                        // If there's an assigned shift, show it
                        return (
                          <td
                            key={day.date.toISOString()}
                            className="bg-white border border-gray-300 px-4 py-2"
                          >
                            {assignedShift.startTime} - {assignedShift.endTime}
                          </td>
                        );
                      } else {
                        // If no assigned shift, check availability
                        const employeeAvailabilities = availabilitiesByEmployee[employee.id] || [];
                        const targetDayName = format(day.date, "EEEE");
                        const dateAvailabilities = employeeAvailabilities.filter((av) => {
                          const start = new Date(av.effectiveStart);
                          const end = new Date(av.effectiveEnd);
                          return day.date >= start && day.date <= end;
                        });

                        let daySlots: DailyAvailabilitySlot[] = [];
                        for (const av of dateAvailabilities) {
                          const slotsForDay = av.DailyAvailabilitySlot.filter(
                            (slot) => slot.day === targetDayName
                          );
                          daySlots = daySlots.concat(slotsForDay);
                        }

                        const hasAvailableSlot = daySlots.some((s) => s.available);
                        return (
                          <td
                            key={day.date.toISOString()}
                            className={`bg-white border border-gray-300 px-4 py-2 ${
                              hasAvailableSlot ? "cursor-pointer hover:bg-gray-100" : ""
                            }`}
                            onClick={() => {
                              if (hasAvailableSlot) handleCellClick(day, employee);
                            }}
                          >
                            {hasAvailableSlot ? "Click to assign" : "No availability"}
                          </td>
                        );
                      }
                    })}
                  </tr>
                ))}
                <tr>
                  <td className="bg-white border border-gray-300 px-4 py-2 font-bold text-left">
                    <select
                      className="p-2 border rounded"
                      onChange={(e) => {
                        const selectedEmp = availableEmployees.find(
                          (emp) => emp.id === e.target.value
                        );
                        if (selectedEmp) handleAddEmployee(selectedEmp);
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
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
        availabilityData={modalSlots}
        onAssign={handleAssign}
      />
    </div>
  );
};

export default Schedules;
