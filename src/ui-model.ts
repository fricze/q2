import { z } from "zod";

export const NewPostSchema = z.object({
    name: z.string().refine(val => val.length > 3, {
        message: "Name can't be shorter than 3 characters."
    }),
    // content: z.string(),
});

export const PostExcerptSchema = z.object({
    name: z.string(),
    id: z.string(),
    content: z.string().transform(v => v.slice(0, 100)),
});

export const PostAuthorSchema = z.object({
    name: z.string(),
    photo: z.string().url().default('/dummy-author-photo.jpg'),
    email: z.string().email(),
});

