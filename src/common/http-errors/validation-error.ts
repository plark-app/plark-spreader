import { HttpError } from './base-http-error';

export class ValidationError extends HttpError {

    public errors: Record<string, string>;

    public constructor(errors: Record<string, string>) {
        super('Validation error', 400, {
            errors: errors,
        });

        this.errors = errors;
    }
}
