import { z } from 'zod';
import { fr } from '../i18n/fr';

const v = fr.auth.validation;

/**
 * 🔒 LA politique de mot de passe est celle du projet Supabase (Authentication › Policies) :
 * `password_min_length = 8`, `password_required_characters` = une minuscule, une majuscule
 * et un chiffre. Le front la reflète EXACTEMENT — changer l'un sans l'autre fait mentir le
 * message du champ. Relevé le 05/09/2026 via l'API de gestion.
 */
export const PASSWORD_MIN = 8;
export const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export const emailSchema = z.string().trim().min(1, v.emailRequired).email(v.emailInvalid);
export const passwordSchema = z
  .string()
  .min(1, v.passwordRequired)
  .min(PASSWORD_MIN, v.passwordMin)
  .regex(PASSWORD_RULE, v.passwordChars);

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, v.passwordRequired) });
export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({ email: emailSchema, password: passwordSchema, confirm: z.string().min(1, v.passwordConfirmRequired) })
  .refine(d => d.password === d.confirm, { message: v.passwordMismatch, path: ['confirm'] });
export type SignupValues = z.infer<typeof signupSchema>;

export const forgotSchema = z.object({ email: emailSchema });
export type ForgotValues = z.infer<typeof forgotSchema>;

export const newPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string().min(1, v.passwordConfirmRequired) })
  .refine(d => d.password === d.confirm, { message: v.passwordMismatch, path: ['confirm'] });
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
