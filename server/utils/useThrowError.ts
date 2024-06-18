import { SafeParseError } from 'zod';

export class TagError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TagError';

        Object.setPrototypeOf(this, TagError.prototype);
    }

    get message(): string {
        return this.message;
    }
}

export const useThrowError = () => {
    const createValidationError = <T>(result: SafeParseError<T>) => {
        const msg = result.error.errors[0].message;

        return createError({
            statusCode: 409,
            message: msg
        });
    };

    const createTagError = (message: string): TagError => {
        return new TagError(message);
    };

    return { createValidationError, createTagError };
};
