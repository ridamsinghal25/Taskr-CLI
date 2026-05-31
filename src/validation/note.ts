import zod from "zod";

export const noteSchema = zod.object({
  title: zod.string().trim().min(1).max(100),
  content: zod.string().trim().min(1),
  categoryName: zod.string().trim().min(1),
});

export const noteUpdateSchema = zod
  .object({
    content: zod.string().trim().min(1).optional(),
  })
  .refine((data) => data.content !== undefined, {
    message: "At least one of title or content must be provided",
  });
