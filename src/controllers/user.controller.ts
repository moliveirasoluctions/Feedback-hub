import { Request } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errorHandler';

// Esquemas de validação
const createUserSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'HR', 'TEAM_LEAD']).default('USER'),
  department: z.enum(['TI', 'RH', 'FINANCEIRO', 'MARKETING', 'VENDAS', 'OPERACOES', 'DIRETORIA', 'OUTRO']),
  position: z.string().min(3, 'O cargo deve ter no mínimo 3 caracteres'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_ACTIVATION']).default('PENDING_ACTIVATION'),
  phone: z.string().optional(),
  avatar: z.string().url('URL do avatar inválida').optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres').optional(),
  email: z.string().email('E-mail inválido').optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER', 'HR', 'TEAM_LEAD']).optional(),
  department: z.enum(['TI', 'RH', 'FINANCEIRO', 'MARKETING', 'VENDAS', 'OPERACOES', 'DIRETORIA', 'OUTRO']).optional(),
  position: z.string().min(3, 'O cargo deve ter no mínimo 3 caracteres').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_ACTIVATION']).optional(),
  phone: z.string().optional().nullable(),
  avatar: z.string().url('URL do avatar inválida').optional().nullable(),
});

// Tipos
interface UserQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  role?: string;
  department?: string;
  status?: string;
}

// Controlador para listar usuários com paginação e filtros
export const getUsers = async (req: Request<{}, {}, {}, UserQueryParams>) => {
  try {
    const { page = '1', limit = '10', search, role, department, status } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = Math.min(parseInt(limit, 10) || 10, 100);
    const skip = (pageNumber - 1) * pageSize;

    // Filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (role) where.role = role;
    if (department) where.department = department;
    if (status) where.status = status;

    // Busca os usuários com paginação
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          department: true,
          position: true,
          avatar: true,
          lastLogin: true,
          createdAt: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      },
    };
  } catch (error) {
    throw error;
  }
};

// Controlador para obter um usuário por ID
export const getUserById = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      throw new NotFoundError('Usuário não encontrado');
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    throw error;
  }
};

// Controlador para criar um novo usuário
export const createUser = async (req: Request) => {
  try {
    const data = createUserSchema.parse(req.body);

    // Verifica se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestError('E-mail já está em uso');
    }

    // Cria o novo usuário
    const newUser = await prisma.user.create({
      data: {
        ...data,
        // A senha deve ser criptografada antes de ser salva
        passwordHash: 'temporary-password', // Será substituída pelo hash real
      },
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
        createdAt: true,
      },
    });

    // TODO: Enviar e-mail com link para definir senha

    return {
      success: true,
      message: 'Usuário criado com sucesso',
      data: newUser,
    };
  } catch (error) {
    throw error;
  }
};

// Controlador para atualizar um usuário
export const updateUser = async (userId: string, req: Request) => {
  try {
    const data = updateUserSchema.parse(req.body);

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Se estiver atualizando o e-mail, verifica se já está em uso
    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new BadRequestError('E-mail já está em uso');
      }
    }

    // Atualiza o usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
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

    return {
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: updatedUser,
    };
  } catch (error) {
    throw error;
  }
};

// Controlador para excluir um usuário
export const deleteUser = async (userId: string) => {
  try {
    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Impede a exclusão do próprio usuário
    if (req.user?.id === userId) {
      throw new ForbiddenError('Você não pode excluir sua própria conta');
    }

    // Exclui o usuário
    await prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: 'Usuário excluído com sucesso',
    };
  } catch (error) {
    throw error;
  }
};

// Controlador para atualizar a senha do usuário
export const updatePassword = async (userId: string, req: Request) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new BadRequestError('Senha atual e nova senha são obrigatórias');
    }

    if (newPassword.length < 6) {
      throw new BadRequestError('A nova senha deve ter no mínimo 6 caracteres');
    }

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Verifica se a senha atual está correta
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestError('Senha atual incorreta');
    }

    // Atualiza a senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: userId },
      data: { 
        passwordHash: hashedPassword,
        lastPasswordChange: new Date(),
      },
    });

    return {
      success: true,
      message: 'Senha atualizada com sucesso',
    };
  } catch (error) {
    throw error;
  }
};
