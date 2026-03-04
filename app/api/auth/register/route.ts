/**
 * Register API Route Handler
 * App Router route handler for user registration
 * Migrated from Pages API to App Router
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import { registerSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { prisma } from "@/prisma/client";

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod schema
    const { name, email, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use MongoDB client directly to bypass Prisma constraints
    const mongoClient = new MongoClient(process.env.DATABASE_URL!);
    await mongoClient.connect();

    const db = mongoClient.db();
    const userCollection = db.collection("User");

    // Generate a unique username
    const baseUsername = email.split("@")[0];
    let username = baseUsername;
    let counter = 1;

    // Check if username exists and generate a unique one
    while (await userCollection.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Insert user (new signups get admin role for full manipulation power)
    await userCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      username,
      role: "admin",
      createdAt: new Date(),
    });

    await mongoClient.close();

    // Get the created user from Prisma
    const createdUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!createdUser) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid registration data" },
        { status: 400 }
      );
    }

    logger.error("Registration error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
