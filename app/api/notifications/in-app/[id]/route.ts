/**
 * Individual Notification API Route Handler
 * Handles operations on individual notifications (mark as read/unread)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";
import {
  getNotificationById,
  updateNotification,
  deleteNotification,
} from "@/prisma/notification";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";
import type { UpdateNotificationInput } from "@/types";

/**
 * GET /api/notifications/in-app/:id
 * Fetch a single notification by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notificationId } = await params;
    // Rate limiting check
    const rateLimitResponse = await withRateLimit(
      request,
      defaultRateLimits.standard
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    // Validate that the id is not a special action route
    // Special actions like "mark-all-read" should not be processed as notification IDs
    if (notificationId === "mark-all-read" || notificationId === "unread-count") {
      return NextResponse.json(
        { error: "Invalid notification ID" },
        { status: 404 }
      );
    }

    const notification = await getNotificationById(notificationId, userId);

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    // Transform notification for response
    const transformedNotification = {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt?.toISOString() || null,
      metadata: notification.metadata || null,
    };

    return NextResponse.json(transformedNotification);
  } catch (error) {
    logger.error("Error fetching notification:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch notification",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/in-app/:id
 * Update a notification (mark as read/unread)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notificationId } = await params;
    // Rate limiting check
    const rateLimitResponse = await withRateLimit(
      request,
      defaultRateLimits.standard
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    // Validate that the id is not a special action route
    // Special actions like "mark-all-read" should not be processed as notification IDs
    if (notificationId === "mark-all-read" || notificationId === "unread-count") {
      return NextResponse.json(
        { error: "Invalid notification ID" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate request body
    const updateData: UpdateNotificationInput = {
      id: notificationId,
      read: body.read,
    };

    // Update notification
    const notification = await updateNotification(
      notificationId,
      updateData,
      userId
    );

    const { invalidateAllServerCaches } = await import("@/lib/cache");
    await invalidateAllServerCaches().catch(() => {});

    // Transform notification for response
    const transformedNotification = {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt?.toISOString() || null,
      metadata: notification.metadata || null,
    };

    logger.info("Notification updated", { userId, notificationId, read: notification.read });

    return NextResponse.json(transformedNotification);
  } catch (error) {
    logger.error("Error updating notification:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update notification",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/in-app/:id
 * Delete a notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notificationId } = await params;
    // Rate limiting check
    const rateLimitResponse = await withRateLimit(
      request,
      defaultRateLimits.standard
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    // Validate that the id is not a special action route
    // Special actions like "mark-all-read" should not be processed as notification IDs
    if (notificationId === "mark-all-read" || notificationId === "unread-count") {
      return NextResponse.json(
        { error: "Invalid notification ID" },
        { status: 404 }
      );
    }

    await deleteNotification(notificationId, userId);

    const { invalidateAllServerCaches } = await import("@/lib/cache");
    await invalidateAllServerCaches().catch(() => {});

    logger.info("Notification deleted", { userId, notificationId });

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting notification:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete notification",
      },
      { status: 500 }
    );
  }
}
