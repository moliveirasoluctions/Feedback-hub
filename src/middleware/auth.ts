import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { UnauthorizedError, ForbiddenError } from '../utils/errorHandler';
import config from '../config/server';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        status: string;
      };
    }
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Verifica se o token está presente no header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token de autenticação não fornecido');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Token de autenticação inválido');
    }

    // Verifica e decodifica o token JWT
    const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };
    if (!decoded?.userId) {
      throw new UnauthorizedError('Token inválido');
    }

    // Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    // Verifica se o usuário está ativo
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError('Sua conta está desativada ou pendente de ativação');
    }

    // Adiciona o usuário ao objeto de requisição
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Não autenticado'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError('Você não tem permissão para acessar este recurso')
      );
    }

    next();
  };
};

export const checkOwnership = (model: any, paramName = 'id') => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Não autenticado'));
      }

      const resourceId = req.params[paramName];
      if (!resourceId) {
        return next(new Error('ID do recurso não fornecido'));
      }

      // Se for admin, permite o acesso
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Verifica se o usuário é o dono do recurso
      const resource = await model.findUnique({
        where: { id: resourceId },
        select: { userId: true },
      });

      if (!resource) {
        return next(new Error('Recurso não encontrado'));
      }

      if (resource.userId !== req.user.id) {
        return next(
          new ForbiddenError('Você não tem permissão para acessar este recurso')
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
