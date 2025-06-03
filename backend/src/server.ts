import { config } from "dotenv";
import {
  ClerkExpressWithAuth,
  createClerkClient,
  LooseAuthProp,
} from "@clerk/clerk-sdk-node";
import express from "express";
import { router as organizationRouter } from "./routes/organization.router";
import cors from "cors";
import { validateUser } from "./middleware/validate-user";
import { router as employeeRouter } from "./routes/employee.router";
import { PrismaClient } from "@prisma/client";

declare global {
  namespace Express {
    interface Request extends LooseAuthProp {
      userRole?: string;
      userOrganizationId?: string;
    }
  }
}

config();

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(ClerkExpressWithAuth());

app.use(validateUser);

app.use("/api/organizations", organizationRouter);
app.use("/api/employees", employeeRouter);

app.post("/api/invitations", async (req, res) => {
  const { emailAddress, redirectUrl } = req.body;

  try {
    const response = await clerkClient.invitations.createInvitation({
      emailAddress,
      redirectUrl: redirectUrl || "http://localhost:5173/coba2",
    });

    res.status(200).json({ success: true, invitation: response });
  } catch (error) {
    console.error("Error creating invitation:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create invitation" });
  }
});

// GET endpoint for retrieving all invitations
app.get("/api/invitations", async (req, res) => {
  try {
    const invitations = await clerkClient.invitations.getInvitationList();
    res.status(200).json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch invitations" });
  }
});

app.post("/api/invitations/revoke", async (req, res) => {
  const { invitationId } = req.body;

  try {
    await clerkClient.invitations.revokeInvitation(invitationId);
    res
      .status(200)
      .json({ success: true, message: "Invitation revoked successfully" });
  } catch (error) {
    console.error("Error revoking invitation:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to revoke invitation" });
  }
});

const prisma = new PrismaClient();

app.get("/api/employees/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const manager = await prisma.employee.findUnique({
      where: { email },
    });
    if (manager && manager.position === "Manager") {
      res.status(200).json({ exists: true });
    } else {
      res.status(404).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE endpoint
app.delete("/api/employees/pendingRequest/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the pending request
    await prisma.pendingRequest.delete({ where: { id } });

    res.status(200).json({ message: "Request rejected successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reject request." });
  }
});

app.get("/api/user-info", async (req, res) => {
  try {
    const { userRole, userOrganizationId } = req;
    res.status(200).json({ position: userRole, organizationId: userOrganizationId });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/employees/availabilities/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.availability.delete({ where: { id } });
    res.status(200).json({ message: "Availability deleted successfully" });
  } catch (error) {
    console.error("Error deleting availability:", error);
    res.status(500).json({ error: "Failed to delete availability" });
  }
});

app.listen(8080, () => {
  console.log("[server]: Listening at http://localhost:8080");
});
