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
