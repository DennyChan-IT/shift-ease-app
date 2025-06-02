import { config } from "dotenv";
import { ClerkExpressWithAuth, createClerkClient, LooseAuthProp } from "@clerk/clerk-sdk-node";
import express from "express";
import { router as organizationRouter } from "./routes/organization.router";
import cors from "cors";
import { validateUser } from "./middleware/validate-user";


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

app.listen(8080, () => {
    console.log("[server]: Listening at http://localhost:8080");
  });
  