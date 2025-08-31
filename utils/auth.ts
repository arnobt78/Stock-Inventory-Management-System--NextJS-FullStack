/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, User as PrismaUser } from "@prisma/client";
import Cookies from "js-cookie"; // Import js-cookie
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

type User = PrismaUser;

// Check if we're on the server side
const isServer = typeof window === 'undefined';

export const generateToken = (userId: string): string => {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
  // Debug log - only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log("Generated Token:", token);
  }
  return token;
};

export const verifyToken = (token: string): { userId: string } | null => {
  if (!token || token === "null" || token === "undefined") {
    return null;
  }
  
  // Only verify tokens on the server side
  if (!isServer) {
    // On client side, we'll just return null to avoid JWT library issues
    return null;
  }
  
  try {
    // Check if jwt is properly imported
    if (typeof jwt === 'undefined' || !jwt.verify) {
      console.error("JWT library not properly loaded");
      return null;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    // Debug log - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log("Verified Token:", decoded);
    }
    return decoded;
  } catch (error) {
    // Only log in development to avoid console errors in production
    if (process.env.NODE_ENV === 'development') {
      console.error("Token verification error:", error);
    }
    return null;
  }
};

export const getSessionServer = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User | null> => {
  const token = req.cookies["session_id"];
  // Debug log - only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log("Session ID from cookies:", token);
  }
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  // Debug log - only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log("User from session:", user);
  }
  return user;
};

export const getSessionClient = async (): Promise<User | null> => {
  try {
    const token = Cookies.get("session_id");
    // Debug log - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log("Session ID from cookies:", token);
    }
    if (!token) {
      return null;
    }

    // On client side, we'll make an API call to verify the token
    // This avoids using the JWT library on the client side
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
    });

    if (response.ok) {
      const user = await response.json();
      return user;
    }

    return null;
  } catch (error) {
    // Only log in development to avoid console errors in production
    if (process.env.NODE_ENV === 'development') {
      console.error("Error in getSessionClient:", error);
    }
    return null;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
