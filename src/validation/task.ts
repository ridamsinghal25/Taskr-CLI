import zod from "zod";

export const taskSchema = zod.object({
  name: zod
    .string()
    .trim()
    .regex(/^[a-zA-Z\s]+$/)
    .min(1)
    .max(50),
});
