import { prisma } from "../../config/db";

// facilityId always comes from the server-side session, never from the request.
export function getCurrentFacility(facilityId: string) {
  return prisma.facility.findUniqueOrThrow({
    where: { id: facilityId },
    select: {
      id: true,
      name: true,
      code: true,
      email: true,
      phone: true,
      address: true,
      logoUrl: true,
      currencyCode: true,
    },
  });
}

export function listDepartments(facilityId: string) {
  return prisma.department.findMany({
    where: { facilityId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, isActive: true },
  });
}