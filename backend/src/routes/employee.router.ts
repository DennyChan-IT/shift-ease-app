import { Router } from "express";
import {
  addEmployee,
  deleteEmployee,
  getAllEmployees,
  updateEmployee,
} from "../controllers/employeecontroller";

export const router = Router();

router.get("/", getAllEmployees);
router.post("/", addEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);
