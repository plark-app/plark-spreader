export class HttpError extends Error {
    public status: number;
    public data?: object;
    public __proto__: any;

    public constructor(message: string = "Internal error", status: number = 500, data?: object) {
        super(message);

        this.status = status;
        this.data = data || {
            error: message,
        };

        this.__proto__ = HttpError.prototype;
    }
}
