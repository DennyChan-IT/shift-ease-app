import { Router } from "express";
import {
  addEmployee,
  approveRequest,
  deleteEmployee,
  getAllEmployees,
  getAllPendingRequest,
  loggedUser,
  rejectRequest,
  updateEmployee,
} from "../controllers/employeecontroller";

export const router = Router();

router.get("/", getAllEmployees);
router.get("/logged-user", loggedUser);
router.post("/", addEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

router.get("/pending-requests", getAllPendingRequest);
router.post("/pending-requests/:id", approveRequest);
router.delete("/pending-requests/:id", rejectRequest);