import { config } from "dotenv";
import { ClerkExpressWithAuth, createClerkClient, LooseAuthProp } from "@clerk/clerk-sdk-node";
import express from "express";
import { router as organizationRouter } from "./routes/organization.router";
import cors from "cors";
import { validateUser } from "./middleware/validate-user";
import { router as employeeRouter} from "./routes/employee.router";
import { PrismaClient } from "@prisma/client";


declare global {
  namespace Express {
    interface Request extends LooseAuthProp {}
  }
}

config();


export const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

const app = express();


app.use(cors());
app.use(express.json());
app.use(ClerkExpressWithAuth())

app.use(validateUser)


app.use("/api/organizations", organizationRouter);
app.use("/api/employees", employeeRouter);
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

app.listen(8080, () => {
    console.log("[server]: Listening at http://localhost:8080");
  });
  