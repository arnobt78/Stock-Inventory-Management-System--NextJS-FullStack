/**
 * System Configuration Prisma helpers
 */

import { prisma } from "@/prisma/client";
import { DEFAULT_CONFIGS } from "@/types";
import type { UpdateSystemConfigInput } from "@/types";

/**
 * Get all system configurations
 */
export async function getAllSystemConfigs() {
  return prisma.systemConfig.findMany({
    orderBy: [{ category: "asc" }, { key: "asc" }],
  });
}

/**
 * Get public system configurations only
 */
export async function getPublicSystemConfigs() {
  return prisma.systemConfig.findMany({
    where: { isPublic: true },
    orderBy: [{ category: "asc" }, { key: "asc" }],
  });
}

/**
 * Get system configuration by key
 */
export async function getSystemConfigByKey(key: string) {
  return prisma.systemConfig.findUnique({
    where: { key },
  });
}

/**
 * Get system configuration value by key (returns typed value)
 */
export async function getConfigValue<T = string>(
  key: string,
  defaultValue?: T,
): Promise<T> {
  const config = await getSystemConfigByKey(key);
  if (!config) {
    return defaultValue as T;
  }

  // Parse value based on type
  switch (config.type) {
    case "number":
      return parseFloat(config.value) as T;
    case "boolean":
      return (config.value === "true") as T;
    case "json":
      try {
        return JSON.parse(config.value) as T;
      } catch {
        return defaultValue as T;
      }
    default:
      return config.value as T;
  }
}

/**
 * Update system configuration
 */
export async function updateSystemConfig(
  data: UpdateSystemConfigInput,
  userId: string,
) {
  return prisma.systemConfig.update({
    where: { key: data.key },
    data: {
      value: data.value,
      updatedAt: new Date(),
      updatedBy: userId,
    },
  });
}

/**
 * Update multiple system configurations
 */
export async function updateSystemConfigs(
  configs: UpdateSystemConfigInput[],
  userId: string,
) {
  const updates = configs.map((config) =>
    prisma.systemConfig.update({
      where: { key: config.key },
      data: {
        value: config.value,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    }),
  );
  return prisma.$transaction(updates);
}

/**
 * Initialize default configurations if they don't exist
 */
export async function initializeDefaultConfigs() {
  const existingKeys = await prisma.systemConfig.findMany({
    select: { key: true },
  });
  const existingKeySet = new Set(existingKeys.map((c) => c.key));

  const missingConfigs = DEFAULT_CONFIGS.filter(
    (config) => !existingKeySet.has(config.key),
  );

  if (missingConfigs.length > 0) {
    await prisma.systemConfig.createMany({
      data: missingConfigs.map((config) => ({
        ...config,
        createdAt: new Date(),
      })),
    });
  }

  return missingConfigs.length;
}
