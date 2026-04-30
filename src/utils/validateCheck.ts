import z from "zod";

export class Validate {
  static isValidPassword(password: string | null | undefined): boolean {
    if (password === null || password === undefined) {
      return false; // Return false if password is null or undefined
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$&*-^!])[a-zAZ\d@#$&*-^!]{6,}$/;

    return passwordRegex.test(password);
  }

  static isValidEmail(email: string): boolean {
    const emailSchema = z.string().email();
    return emailSchema.safeParse(email).success;
  }
}
