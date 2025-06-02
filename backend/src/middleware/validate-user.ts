import { WithAuthProp } from "@clerk/clerk-sdk-node";
import { clerkClient } from "../server";
import { Response, Request, NextFunction } from "express";

export const validateUser = async (req: WithAuthProp<Request>, res: Response, next: NextFunction) => {
  const clerkId = req.auth.userId;

  if (clerkId) {
    const user = await clerkClient.users.getUser(clerkId);
    if (user) {
      return next();
    }
  }
  
  res.status(401).json({ message: "unauthorized" });
};
