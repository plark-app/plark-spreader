import express from 'express';
import morgan, { TokenIndexer } from 'morgan';

function logFormatter(tokens: TokenIndexer, req: express.Request, res: express.Response): string {
    return [
        `Status: ${tokens.method(req, res)} ${tokens.url(req, res)}`,
        `${tokens.status(req, res)} - ${tokens['response-time'](req, res)} ms`,
        '',
    ].join("\n");
}

export const createLogger = () => morgan(logFormatter);
