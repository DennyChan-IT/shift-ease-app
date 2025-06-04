import { Request, Response } from "express";
import { clerkClient } from "../server";

export const createInvitation = async (req: Request, res: Response) => {
  const { emailAddress, signupPath  } = req.body;

  const getBaseUrl = () => {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return "http://localhost:5173";
  };

  // build the absolute fallback URL
  const base = getBaseUrl();
  const redirectUrl = `${base}${signupPath}`;

  try {
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress,
      redirectUrl,
    });
    res.status(200).json({ success: true, invitation });
  } catch (error) {
    console.error("Error creating invitation:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create invitation" });
  }
};

export const listInvitations = async (_req: Request, res: Response) => {
  try {
    const invitations = await clerkClient.invitations.getInvitationList();
    res.status(200).json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch invitations" });
  }
};
