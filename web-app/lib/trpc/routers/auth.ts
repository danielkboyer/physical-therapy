import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { createClinic } from '@/lib/db/clinic';
import { createUser, getUserByEmail, verifyPassword } from '@/lib/db/user';
import { TRPCError } from '@trpc/server';

// Input/Output schemas
export const signupSchema = z.object({
  clinicName: z.string().min(1, 'Clinic name is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  clinicId: z.string(),
  createdAt: z.number(),
});

export const authRouter = router({
  signup: publicProcedure
    .input(signupSchema)
    .output(
      z.object({
        user: userSchema,
        clinicId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if user already exists
      const existingUser = await getUserByEmail(input.email);
      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        });
      }

      // Create clinic first
      const clinic = await createClinic(input.clinicName);

      // Create user (first user is the admin)
      const user = await createUser({
        email: input.email,
        name: input.name,
        password: input.password,
        clinicId: clinic.id,
      });

      return {
        user,
        clinicId: clinic.id,
      };
    }),

  login: publicProcedure
    .input(loginSchema)
    .output(
      z.object({
        user: userSchema,
      })
    )
    .mutation(async ({ input }) => {
      // Get user by email
      const user = await getUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Verify password
      const isValidPassword = await verifyPassword(user, input.password);
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
      };
    }),
});
