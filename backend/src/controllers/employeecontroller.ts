import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { clerkClient } from "../server";

const prisma = new PrismaClient();

export const getAllEmployees = async (req: Request, res: Response) => {
  const { userRole, userOrganizationId } = req;

  const employees = await prisma.employee.findMany({
    where: userRole === "Manager" ? { organizationId: userOrganizationId } : {}, // Filter by organizationId if Manager
    orderBy: { createdAt: "asc" }, // Ensures consistent order
  });

  res.json(employees);
};

export const loggedUser = async (req: Request, res: Response) => {
  const clerkId = req.auth?.userId!;
  const user = await clerkClient.users.getUser(clerkId);
  const clerkEmail = user.emailAddresses[0].emailAddress;

  const dbUser = await prisma.employee.findUnique({
    where: { email: clerkEmail },
  });

  res.json(dbUser);
};

export const addEmployee = async (req: Request, res: Response) => {
  const { name, email, position, organizationId } = req.body;
  const { userRole } = req;

  try {
    if (userRole === "Manager") {
      // Add to PendingRequest instead of Employee
      const pendingRequest = await prisma.pendingRequest.create({
        data: { name, email, position, organizationId },
      });

      res.status(201).json({
        message: "Request added to pending list for admin approval.",
        request: pendingRequest,
      });
      return; // Exit after response
    }

    // If not a Manager, directly add employee
    const employee = await prisma.employee.create({
      data: { name, email, position, organizationId },
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error("Error adding employee:", error);

    // Always respond with an error message and exit
    res.status(500).json({ error: "Failed to add employee" });
    return;
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

export const getAllPendingRequest = async (req: Request, res: Response) => {
  const { userRole, userOrganizationId } = req;

  const pendingRequests = await prisma.pendingRequest.findMany({
    where: userRole === "Manager" ? { organizationId: userOrganizationId } : {}, // Filter by organizationId if Manager
    orderBy: { createdAt: "asc" }, // Ensures consistent order
  });

  res.json(pendingRequests);
};

export const approveRequest = async (req: Request, res: Response) => {
  const { id } = req.params; // Pending request ID

  try {
    const pendingRequest = await prisma.pendingRequest.findUnique({
      where: { id },
    });

    if (!pendingRequest) {
      res.status(404).json({ error: "Pending request not found." });
      return;
    }

    // Move to Employee table
    const employee = await prisma.employee.create({
      data: {
        name: pendingRequest.name,
        email: pendingRequest.email,
        position: pendingRequest.position,
        organizationId: pendingRequest.organizationId,
      },
    });

    // Send an invitation via Clerk
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: pendingRequest.email,
    });

    // Delete the pending request from the database
    await prisma.pendingRequest.delete({ where: { id } });

    res.status(200).json({
      message: "Request approved and removed from pending list.",
      employee,
      invitation,
    });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({ error: "Failed to approve request." });
  }
};


export const rejectRequest = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Delete the pending request
    await prisma.pendingRequest.delete({ where: { id } });

    res.status(200).json({ message: "Request rejected successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reject request." });
  }
};
