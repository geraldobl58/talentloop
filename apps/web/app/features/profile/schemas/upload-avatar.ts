import { z } from "zod";

// Maximum file size: 1MB
const MAX_FILE_SIZE = 1 * 1024 * 1024;

// Allowed image formats
const ACCEPTED_FORMATS = ["image/png", "image/jpeg", "image/gif", "image/webp"];

/**
 * Schema for avatar file upload
 * Validates file size and format
 */
export const avatarUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Arquivo é obrigatório" })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "Arquivo deve ser menor que 5MB",
    })
    .refine((file) => ACCEPTED_FORMATS.includes(file.type), {
      message: "Formato deve ser PNG, JPG, GIF ou WebP",
    }),
});

export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
