import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Requisição inválida', details?: any) {
    super(400, message, true, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Não autorizado') {
    super(401, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Acesso negado') {
    super(403, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Recurso não encontrado') {
    super(404, message);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Conflito de recursos') {
    super(409, message);
  }
}

export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  // Erros do Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'recurso';
      return res.status(409).json({
        success: false,
        message: `Já existe um registro com o mesmo ${target}`,
        error: err.message,
      });
    }
    
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Recurso não encontrado',
        error: err.message,
      });
    }
  }

  // Erros de validação do Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Erros de autenticação JWT
  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
  }

  if (err instanceof TokenExpiredError) {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
    });
  }

  // Erros personalizados da API
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Erro genérico
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.originalUrl}`,
  });
};
