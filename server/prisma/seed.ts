import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  demoFacilities,
  demoUsers,
  permissionGroups,
  roles,
  type Grants,
} from "./seed-data";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in server/.env");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

function mustGet(map: Map<string, string>, key: string): string {
  const value = map.get(key);
  if (!value) {
    throw new Error(`Seed data refers to "${key}", which was not created`);
  }
  return value;
}

// Turns { patients: ["view"], users: "*" } into ["patients.view", "users.view", "users.manage"].
function expandGrants(grants: Grants): string[] {
  const keys: string[] = [];
  for (const [module, actions] of Object.entries(grants)) {
    const available = permissionGroups[module];
    if (!available) {
      throw new Error(`Unknown permission module: ${module}`);
    }
    const chosen = actions === "*" ? available : actions;
    for (const action of chosen) {
      if (!available.includes(action)) {
        throw new Error(`Unknown permission: ${module}.${action}`);
      }
      keys.push(`${module}.${action}`);
    }
  }
  return keys;
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed demo data when NODE_ENV is production");
  }
  const demoPassword = process.env.SEED_DEMO_PASSWORD;
  if (!demoPassword) {
    throw new Error("Set SEED_DEMO_PASSWORD in server/.env before seeding");
  }

  // 1. Permissions
  const permissionIdByKey = new Map<string, string>();
  for (const [module, actions] of Object.entries(permissionGroups)) {
    for (const action of actions) {
      const key = `${module}.${action}`;
      const permission = await prisma.permission.upsert({
        where: { key },
        update: { module },
        create: { key, module },
      });
      permissionIdByKey.set(key, permission.id);
    }
  }

  // 2. Roles and their permissions (the seed file is the source of truth for system roles)
  const roleIdByKey = new Map<string, string>();
  for (const role of roles) {
    const saved = await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name, description: role.description },
      create: { key: role.key, name: role.name, description: role.description },
    });
    roleIdByKey.set(role.key, saved.id);

    await prisma.rolePermission.deleteMany({ where: { roleId: saved.id } });
    await prisma.rolePermission.createMany({
      data: expandGrants(role.grants).map((key) => ({
        roleId: saved.id,
        permissionId: mustGet(permissionIdByKey, key),
      })),
    });
  }

  // 3. Facilities and departments
  const facilityIdByCode = new Map<string, string>();
  for (const facility of demoFacilities) {
    const saved = await prisma.facility.upsert({
      where: { code: facility.code },
      update: { name: facility.name },
      create: { code: facility.code, name: facility.name },
    });
    facilityIdByCode.set(facility.code, saved.id);

    for (const name of facility.departments) {
      await prisma.department.upsert({
        where: { facilityId_name: { facilityId: saved.id, name } },
        update: {},
        create: { facilityId: saved.id, name },
      });
    }
  }

  // 4. Users, memberships and facility-scoped roles
  const passwordHash = await bcrypt.hash(demoPassword, 12);
  for (const userSeed of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: userSeed.email },
      update: {
        firstName: userSeed.firstName,
        lastName: userSeed.lastName,
        isPlatformAdmin: userSeed.isPlatformAdmin ?? false,
        passwordHash,
      },
      create: {
        email: userSeed.email,
        firstName: userSeed.firstName,
        lastName: userSeed.lastName,
        isPlatformAdmin: userSeed.isPlatformAdmin ?? false,
        passwordHash,
      },
    });

    for (const m of userSeed.memberships) {
      const facilityId = mustGet(facilityIdByCode, m.facilityCode);
      let departmentId: string | null = null;
      if (m.department) {
        const department = await prisma.department.findUniqueOrThrow({
          where: { facilityId_name: { facilityId, name: m.department } },
          select: { id: true },
        });
        departmentId = department.id;
      }

      const membership = await prisma.facilityMembership.upsert({
        where: { userId_facilityId: { userId: user.id, facilityId } },
        update: { departmentId },
        create: { userId: user.id, facilityId, departmentId },
      });

      await prisma.membershipRole.deleteMany({ where: { membershipId: membership.id } });
      await prisma.membershipRole.createMany({
        data: m.roles.map((roleKey) => ({
          membershipId: membership.id,
          roleId: mustGet(roleIdByKey, roleKey),
        })),
      });
    }
  }

  // 5. Summary
  console.log("Seed complete:");
  console.log("  facilities      ", await prisma.facility.count());
  console.log("  departments     ", await prisma.department.count());
  console.log("  permissions     ", await prisma.permission.count());
  console.log("  roles           ", await prisma.role.count());
  console.log("  role permissions", await prisma.rolePermission.count());
  console.log("  users           ", await prisma.user.count());
  console.log("  memberships     ", await prisma.facilityMembership.count());
  console.log("  membership roles", await prisma.membershipRole.count());
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });