import express from 'express';
import { HttpError } from 'common/http-errors';

export const errorHandler = (error: Error, _req: express.Request, res: express.Response, _next: () => void) => {

    console.log(error instanceof HttpError);

    if (error instanceof HttpError) {
        const status = Number(error.status);
        res.status(status).send(error.data);

        return;
    }

    console.log('Unknown error:', error);
    res.status(500).end();
};