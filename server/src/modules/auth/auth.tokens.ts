import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export function signSessionToken(sessionId: string, userId: string, expiresAt: Date): string {
  const expiresInSeconds = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  return jwt.sign({ sid: sessionId }, env.JWT_SECRET, {
    algorithm: "HS256",
    subject: userId,
    expiresIn: expiresInSeconds,
  });
}

// Returns the session id, or null when the token is forged, expired or malformed.
export function readSessionToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
    if (typeof payload === "object" && typeof payload.sid === "string") {
      return payload.sid;
    }
    return null;
  } catch {
    return null;
  }
}