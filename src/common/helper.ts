import express from 'express';

export async function wait(delay: number = 1000): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, delay));
}

export function fetchBody(req: express.Request): any {
    const data = req.body;

    /** @TODO Remove when > 98% of customers will be updated to Plark v2.2.0 */
    if (data.platform_token) {
        data.fcm_token = data.platform_token;
    }

    return data;
}
