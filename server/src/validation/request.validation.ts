import {z} from 'zod'

export const signupPostReqBodySchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters")
})

export const loginPostReqBodySchema = z.object({
    email: z.string().email().min(1, "Email is required"),
    password: z.string().min(1, "Password is required")
})

export const shortenPostRequestBodySchema = z.object({
  url: z.string().url("Invalid URL format"),
  code: z.string().optional(),
});

export const updateUserReqBodySchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  currentPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional(),
}).refine(
  (data) => {
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  },
  {
    message: "Current password is required when changing password",
    path: ["currentPassword"],
  }
);