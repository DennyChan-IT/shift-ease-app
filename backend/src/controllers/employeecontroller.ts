import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getAllEmployees = async (req: Request, res: Response) => {
  const employees = await prisma.employee.findMany(
    { orderBy: { createdAt: "asc" } } // Ensures consistent order
  );

  res.json(employees);
};

export const addEmployee = async (req: Request, res: Response) => {
  const { name, email, position, organizationId } = req.body;
  try {
    const employee = await prisma.employee.create({
      data: { name, email, position, organizationId },
    });
    res.status(201).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add employee" });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, position } = req.body;

  try {
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: { name, email, position },
    });

    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Failed to update employee" });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.employee.delete({
      where: { id },
    });
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};
