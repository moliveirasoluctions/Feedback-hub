import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { BadRequestError } from '../utils/errorHandler';

type SchemaType<TBody = any, TQuery = any, TParams = any> = {
  body?: z.ZodType<TBody>;
  query?: z.ZodType<TQuery>;
  params?: z.ZodType<TParams>;
};

export const validateRequest = <TBody = any, TQuery = any, TParams = any>(
  schema: SchemaType<TBody, TQuery, TParams>
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query) as typeof req.query;
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params) as typeof req.params;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        next(new BadRequestError('Erro de validação', { errors }));
      } else {
        next(error);
      }
    }
  };
};
