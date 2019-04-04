import express from 'express';

export default () => {
    return (_req: express.Request, res: express.Response, _next: AnyFunc) => {
        res.send(
            '<!DOCTYPE html>' +
            `<html><head><title>Plark Spreader</title></head><body><a href="https://plark.io">Plark</a></body></html>`
        );
    };
};
