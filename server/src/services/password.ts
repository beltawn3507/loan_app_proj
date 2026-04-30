import bcrypt from "bcrypt";

export class Password {
  static async toHash(password: string) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    return await bcrypt.compare(suppliedPassword, storedPassword);
  }
}