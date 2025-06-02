import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getAllOrganizations = async (req: Request, res: Response) => {
  const organizations = await prisma.organization.findMany();

  res.json(organizations);
};

export const createOrganization = async (req: Request, res: Response) => {
  const { name, location } = req.body;
  const newOrganization = await prisma.organization.create({
    data: {
      name,
      location,
    },
  });
  res.status(201).json(newOrganization);
};

export const deleteOrganization = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.organization.delete({
      where: { id },
    });
    res.status(200).json({ message: "Organization deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete organization" });
  }
};
