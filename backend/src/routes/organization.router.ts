import { Router } from "express";
import { createOrganization, deleteOrganization, getAllOrganizations, getOrganizationDetails } from "../controllers/organizationcontroller";

export const router = Router();

router.get("/", getAllOrganizations);
router.get("/:id", getOrganizationDetails);
router.post("/", createOrganization);
router.delete("/:id", deleteOrganization)
