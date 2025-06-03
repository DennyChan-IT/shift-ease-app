import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const addEmployee = async (req: Request, res: Response) => {
    const { name, position, organizationId } = req.body;
    try {
      const employee = await prisma.employee.create({
        data: { name, position, organizationId },
      });
      res.status(201).json(employee);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add employee" });
    }
  };