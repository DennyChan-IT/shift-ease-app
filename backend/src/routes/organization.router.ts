import { Router } from "express";
import { createOrganization, deleteOrganization, getAllOrganizations } from "../controllers/organizationcontroller";

export const router = Router();

router.get("/", getAllOrganizations);
router.post("/", createOrganization);
router.delete("/:id", deleteOrganization)
