import express from 'express';
import { HttpError } from 'common/http-errors';
import logger from 'common/logger';

export const errorHandler = (error: Error, _req: express.Request, res: express.Response, _next: () => void) => {
    if (error instanceof HttpError) {
        const status = Number(error.status);
        res.status(status).send(error.data);

        return;
    }

    logger.error('Unknown error: ' + error.message, error);
    res.status(500).end();
};