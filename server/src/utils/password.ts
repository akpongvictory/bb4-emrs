import argon2 from "argon2";

// Argon2id
const hashOptions: {
type: 2;
memoryCost: number;
timeCost: number;
parallelism: number;
} = {
type: 2,
memoryCost: 65536,
timeCost: 3,
parallelism: 4,
};

export function hashPassword(plain: string): Promise<string> {
return argon2.hash(plain, hashOptions);
}

export async function verifyPassword(
plain: string,
hash: string
): Promise<boolean> {
try {
return await argon2.verify(hash, plain);
} catch {
return false;
}
}