import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { baseQueryWithValidation } from './zodBaseQuery';
import { PostsResponseSchema, Post, PostsResponse } from '../../domain-model';
import { NewPostSchema } from '../../ui-model';


export const api = createApi({
    baseQuery: baseQueryWithValidation(fetchBaseQuery({ baseUrl: '/' })),
    tagTypes: ['Post'],
    endpoints: (build) => ({
        getPosts: build.query<PostsResponse, void>({
            query: () => 'posts',
            providesTags: (result) =>
                result
                ? [
                    ...result.map(({ id }) => ({ type: 'Post' as const, id })),
                    { type: 'Post', id: 'LIST' },
                ]
                : [{ type: 'Post', id: 'LIST' }],
            extraOptions: {
                dataSchema: PostsResponseSchema,
            },
            transformErrorResponse: ({ data, validationError }) => {
                if (validationError) {
                    console.error(data);
                    return 'Validation error';
                }

                return data;
            },
        }),
        addPost: build.mutation<Post, Partial<Post>>({
            query: (body) => ({
                url: `posts`,
                method: 'POST',
                body,
            }),
            extraOptions: {
                argumentSchema: NewPostSchema,
            },
            invalidatesTags: [{ type: 'Post', id: 'LIST' }],
        }),
        getPost: build.query<Post, string>({
            query: (id) => `posts/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Post', id }],
        }),
        updatePost: build.mutation<void, Pick<Post, 'id'> & Partial<Post>>({
            query: ({ id, ...patch }) => ({
                url: `posts/${id}`,
                method: 'PUT',
                body: patch,
            }),
            async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    api.util.updateQueryData('getPost', id, (draft) => {
                        Object.assign(draft, patch)
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Post', id }],
        }),
        deletePost: build.mutation<{ success: boolean; id: number }, number>({
            query(id) {
                return {
                    url: `posts/${id}`,
                    method: 'DELETE',
                }
            },
            invalidatesTags: (_result, _error, id) => [{ type: 'Post', id }],
        }),
    }),
});

export const {
    useGetPostQuery,
    useGetPostsQuery,
    useAddPostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
} = api;
