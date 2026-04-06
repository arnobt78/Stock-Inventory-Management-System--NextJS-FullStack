import { NextApiRequest, NextApiResponse } from "next";
import { getSessionServer } from "../utils/auth"; // Use named import

export const authMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  const user = await getSessionServer(req, res);
  console.log("User from middleware:", user);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Attach user to the request object
  (req as any).user = user;
  next();
};
