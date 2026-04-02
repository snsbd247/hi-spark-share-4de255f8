import bcryptjs from "bcryptjs";

export function hashPassword(password: string) {
  return bcryptjs.hashSync(password, 10);
}