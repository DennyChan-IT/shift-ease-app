import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useParams, Link } from "react-router-dom";
import { OrganizationType } from "../types/Organization";
import { AddNewEmployee } from "../components/AddNewEmployee";
import { EditEmployee } from "../components/EditEmployee";
import { EmployeeType } from "../types/Employee";
import { FiTrash } from "react-icons/fi";
import { useEmployees } from "../contexts/employee-context";

export default function OrganizationDetails() {
  const { id } = useParams();
  const [organization, setOrganization] = useState<OrganizationType>();
  const { fetchEmployees } = useEmployees();
  const { getToken } = useAuth();

  const fetchOrganizationDetails = async () => {
    const token = await getToken();

    try {
      const response = await fetch(
        `http://localhost:8080/api/organizations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
      } else {
        console.error("Failed to fetch organization details");
      }
    } catch (error) {
      console.error("Error fetching organization details:", error);
    }
  };

  const handleAddEmployee = (newEmployee: EmployeeType) => {
    setOrganization((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        employees: [...prev.employees, newEmployee],
      };
    });
  };  

  const handleEmployeeUpdate = (
    updatedEmployee: Omit<EmployeeType, "organizationId">
  ) => {
    setOrganization((prev) => {
      if (!prev) return prev;
      const updatedEmployees = prev.employees.map((emp) =>
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      );
      return { ...prev, employees: updatedEmployees };
    });
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    const token = await getToken();

    try {
      const response = await fetch(
        `http://localhost:8080/api/employees/${employeeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setOrganization((prev) => {
          if (!prev) return prev;
          const updatedEmployees = prev.employees.filter(
            (emp) => emp.id !== employeeId
          );
          return { ...prev, employees: updatedEmployees };
        });
        fetchEmployees();
      } else {
        console.error("Failed to delete employee");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  useEffect(() => {
    fetchOrganizationDetails();
  }, [id]);

  return (
    <div className="flex-1 w-full p-6">
      <Link
        to="/organizations"
        className="text-blue-500 flex items-center mb-6 hover:underline"
      >
        ← Back to Organizations
      </Link>

      <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-lg">
        <div>
          <h2 className="text-2xl font-bold">{organization?.name}</h2>
          <p className="text-gray-600 flex items-center">
            📍 {organization?.location}
          </p>
        </div>
        <AddNewEmployee organizationId={id} onAdd={handleAddEmployee}/>
      </div>

      <h3 className="text-xl font-semibold mb-4">Employee List</h3>
      {organization?.employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-8 bg-white p-8 rounded-lg shadow-lg">
          <h4 className="text-lg font-semibold text-gray-800">
            No Employees Yet
          </h4>
          <p className="text-gray-600 text-center mb-4">
            Start building your team at {organization?.name} by adding your
            first employee.
          </p>
        </div>
      ) : (
        <ul className="bg-white p-6 rounded-lg shadow-lg divide-y divide-gray-200">
          {organization?.employees.map((employee) => (
            <li key={employee.id} className="flex justify-between py-4">
              <div>
                <p className="text-gray-800 font-medium">{employee.name}</p>
                <p className="text-gray-600">{employee.position}</p>
              </div>
              <div className="flex items-center space-x-4">
                <EditEmployee
                  employee={employee}
                  organizationName={organization.name}
                  onUpdate={handleEmployeeUpdate}
                />
                <button
                  onClick={() => handleDeleteEmployee(employee.id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Delete Employee"
                >
                  <FiTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
