import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const addAdmin = async (req: Request, res: Response) => {
  const { email, name, position, organizationId } = req.body;

  try {
    const admin = await prisma.employee.create({
      data: { name, email, position, organizationId },
    });

    res.status(201).json(admin);
  } catch (error) {
    console.error("Error adding admin:", error);
    res.status(500).json({ error: "Failed to add admin" });
  }
};
