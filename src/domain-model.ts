import { z } from "zod";

export const PostSchema = z.object({
    name: z.string(),
    id: z.string(),
    content: z.string().optional(),
    // content: z.string(),
});

export const PostsResponseSchema = z.array(PostSchema);


export type Post = z.infer<typeof PostSchema>;
export type PostsResponse = z.infer<typeof PostsResponseSchema>;
