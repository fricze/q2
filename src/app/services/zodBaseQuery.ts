import { ZodSchema } from "zod";
import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query/react";

type TBaseQuery = BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError & { validationError?: boolean; },
    { dataSchema?: ZodSchema, validate?: Function, argumentSchema?: ZodSchema },
    FetchBaseQueryMeta
>;

/**
 * HOF that wraps a base query function with additional functionality for data validation using zod
 *
 * @param baseQuery The base query function to be wrapped.
 * @returns A modified version of the baseQuery with added data validation.
 */
export const baseQueryWithValidation: (baseQuery: TBaseQuery) => TBaseQuery =
    (baseQuery: TBaseQuery) => async (args, api, extraOptions) => {
        if (extraOptions?.argumentSchema) {
            try {
                const newArgs = args as unknown as { body: any };
                const body = newArgs?.body;
                extraOptions?.argumentSchema.parse(newArgs?.body);
            } catch (error) {
                const d = error as { issues: {message: string;}[] };
                if (d.issues) {
                    return { error: JSON.stringify(d.issues.map(a => a.message)) }
                }
                return { error }
            }
        }

        // Call the original baseQuery function with the provided arguments
        const returnValue = await baseQuery(args, api, extraOptions);

        // Retrieve the data schema from the extraOptions object
        const validate = extraOptions?.validate;
        const schema = extraOptions?.dataSchema;

        const { data } = returnValue;

        if (data && schema) {
            try {
                return { data: schema.parse(data) };
            } catch (error) {
                return {
                    error: {
                        status: 400,
                        data: JSON.stringify(error),
                        validationError: true,
                    }
                }
            }
        }

        // Check if both 'data' and 'zodSchema' are defined
        if (data && validate) {
            // throws Validation error if the 'data' fails validation.
            try {
                validate(data);
            } catch (error) {
                return {
                    error: {
                        status: 400,
                        data: JSON.stringify(error),
                        validationError: true,
                    }
                }
            }
        }

        // Return the original returnValue object
        return returnValue;
    };
