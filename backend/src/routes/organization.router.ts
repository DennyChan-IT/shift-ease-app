import { Router } from "express";
import { createOrganization, getAllOrganizations } from "../controllers/organizationcontroller";

export const router = Router();

router.get("/", getAllOrganizations);
router.post("/", createOrganization);
