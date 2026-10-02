import { prisma } from "../../config/db";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { hashPassword, verifyPassword } from "../../utils/password";
import { signSessionToken } from "./auth.tokens";
import type {
  ActiveFacility,
  AuthContext,
  AuthUser,
  FacilitySummary,
  SessionInfo,
} from "./auth.types";

function invalidLogin(): AppError {
  return new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
}

// Used to spend similar time when the email does not exist.
let dummyHash: Promise<string> | null = null;
function getDummyHash(): Promise<string> {
  if (!dummyHash) {
    dummyHash = hashPassword("not-a-real-password");
  }
  return dummyHash;
}

async function listActiveFacilities(userId: string): Promise<FacilitySummary[]> {
  const memberships = await prisma.facilityMembership.findMany({
    where: { userId, isActive: true, facility: { isActive: true } },
    select: { facility: { select: { id: true, name: true, code: true } } },
    orderBy: { facility: { name: "asc" } },
  });
  return memberships.map((membership) => membership.facility);
}

// Returns null unless the user has an active membership in an active facility.
async function loadActiveFacility(userId: string, facilityId: string): Promise<ActiveFacility | null> {
  const membership = await prisma.facilityMembership.findFirst({
    where: { userId, facilityId, isActive: true, facility: { isActive: true } },
    select: {
      id: true,
      facility: { select: { id: true, name: true, code: true } },
      roles: {
        select: {
          role: {
            select: {
              key: true,
              name: true,
              permissions: { select: { permission: { select: { key: true } } } },
            },
          },
        },
      },
    },
  });
  if (!membership) {
    return null;
  }

  const permissionKeys = new Set<string>();
  for (const { role } of membership.roles) {
    for (const { permission } of role.permissions) {
      permissionKeys.add(permission.key);
    }
  }

  return {
    ...membership.facility,
    membershipId: membership.id,
    roles: membership.roles.map(({ role }) => ({ key: role.key, name: role.name })),
    permissions: Array.from(permissionKeys).sort(),
  };
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !user.isActive) {
    await verifyPassword(input.password, await getDummyHash());
    throw invalidLogin();
  }
  if (!(await verifyPassword(input.password, user.passwordHash))) {
    throw invalidLogin();
  }

  const facilities = await listActiveFacilities(user.id);
  if (facilities.length === 0 && !user.isPlatformAdmin) {
    throw new AppError(403, "NO_FACILITY_ACCESS", "Your account is not assigned to an active facility");
  }

  // One facility: enter it automatically. Several: the client shows a selector.
  const onlyFacility = facilities.length === 1 ? facilities[0] : undefined;
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_HOURS * 60 * 60 * 1000);
  const session = await prisma.session.create({
    data: { userId: user.id, activeFacilityId: onlyFacility?.id ?? null, expiresAt },
  });

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isPlatformAdmin: user.isPlatformAdmin,
  };
  const activeFacility = onlyFacility ? await loadActiveFacility(user.id, onlyFacility.id) : null;

  return {
    token: signSessionToken(session.id, user.id, expiresAt),
    expiresAt,
    info: { user: authUser, facilities, activeFacility } satisfies SessionInfo,
  };
}

// Used by the authenticate middleware. Returns null for any invalid session.
export async function loadAuthContext(sessionId: string): Promise<AuthContext | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      activeFacilityId: true,
      revokedAt: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isPlatformAdmin: true,
          isActive: true,
        },
      },
    },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date() || !session.user.isActive) {
    return null;
  }

  const { isActive: _isActive, ...user } = session.user;
  const facility = session.activeFacilityId
    ? await loadActiveFacility(user.id, session.activeFacilityId)
    : null;

  return { sessionId: session.id, user, facility };
}

export async function getSessionInfo(context: AuthContext): Promise<SessionInfo> {
  return {
    user: context.user,
    facilities: await listActiveFacilities(context.user.id),
    activeFacility: context.facility,
  };
}

export async function selectFacility(context: AuthContext, facilityId: string): Promise<SessionInfo> {
  const facility = await loadActiveFacility(context.user.id, facilityId);
  if (!facility) {
    throw new AppError(403, "FACILITY_ACCESS_DENIED", "You do not have access to that facility");
  }
  await prisma.session.update({
    where: { id: context.sessionId },
    data: { activeFacilityId: facilityId },
  });
  return getSessionInfo({ ...context, facility });
}

export async function logout(sessionId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}