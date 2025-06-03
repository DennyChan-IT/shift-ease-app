import { Router } from "express";
import { addAdmin } from "../controllers/admin.controller";

export const router = Router();

router.post("/", addAdmin);
