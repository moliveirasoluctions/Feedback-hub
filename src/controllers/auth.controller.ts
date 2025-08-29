import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import config from '../config/server';
import { BadRequestError, UnauthorizedError } from '../utils/errorHandler';

// Esquemas de validação
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'HR', 'TEAM_LEAD']).default('USER'),
  department: z.enum(['TI', 'RH', 'FINANCEIRO', 'MARKETING', 'VENDAS', 'OPERACOES', 'DIRETORIA', 'OUTRO']),
  position: z.string().min(3, 'O cargo deve ter no mínimo 3 caracteres'),
});

// Gera um token JWT
const generateToken = (userId: string) => {
  return jwt.sign(
    { userId },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  );
};

// Controlador de login
export const login = async (req: Request, res: Response) => {
  try {
    // Valida os dados de entrada
    const { email, password } = loginSchema.parse(req.body);

    // Busca o usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Verifica se o usuário existe e a senha está correta
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    // Verifica se o usuário está ativo
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Sua conta está desativada ou pendente de ativação');
    }

    // Gera os tokens
    const token = generateToken(user.id);
    const refreshToken = jwt.sign(
      { userId: user.id },
      config.auth.jwtSecret,
      { expiresIn: config.auth.refreshTokenExpiresIn }
    );

    // Atualiza o último login do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Retorna os tokens e informações do usuário (sem a senha)
    const { passwordHash, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    throw error;
  }
};

// Controlador de registro
export const register = async (req: Request, res: Response) => {
  try {
    // Valida os dados de entrada
    const { name, email, password, role, department, position } = registerSchema.parse(req.body);

    // Verifica se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestError('E-mail já está em uso');
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o novo usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role,
        department,
        position,
        status: 'PENDING_ACTIVATION', // Requer ativação por um administrador
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: true,
        position: true,
        createdAt: true,
      },
    });

    // TODO: Enviar e-mail de confirmação ou notificação para o administrador

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso. Aguarde a ativação da sua conta.',
      data: newUser,
    });
  } catch (error) {
    throw error;
  }
};

// Controlador para atualizar o token de acesso
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestError('Refresh token não fornecido');
    }

    // Verifica o refresh token
    const decoded = jwt.verify(refreshToken, config.auth.jwtSecret) as { userId: string };
    
    if (!decoded?.userId) {
      throw new UnauthorizedError('Refresh token inválido');
    }

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, status: true },
    });

    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    // Gera um novo token de acesso
    const newToken = generateToken(user.id);

    res.json({
      success: true,
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    throw new UnauthorizedError('Falha ao atualizar o token de acesso');
  }
};

// Controlador para obter o perfil do usuário autenticado
export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Não autenticado');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: true,
        position: true,
        avatar: true,
        phone: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    throw error;
  }
};
