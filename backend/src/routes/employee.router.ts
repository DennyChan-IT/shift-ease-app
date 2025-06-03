import { Router } from "express";
import { addEmployee } from "../controllers/employeecontroller";

export const router = Router();

router.post("/", addEmployee);
