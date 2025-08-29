import { Request } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errorHandler';

// Esquemas de validação
const createTeamSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  managerId: z.string().uuid('ID do gerente inválido'),
  department: z.enum(['TI', 'RH', 'FINANCEIRO', 'MARKETING', 'VENDAS', 'OPERACOES', 'DIRETORIA', 'OUTRO']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  memberIds: z.array(z.string().uuid('ID de membro inválido')).default([]),
});

const updateTeamSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres').optional(),
  description: z.string().optional(),
  managerId: z.string().uuid('ID do gerente inválido').optional(),
  department: z.enum(['TI', 'RH', 'FINANCEIRO', 'MARKETING', 'VENDAS', 'OPERACOES', 'DIRETORIA', 'OUTRO']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  memberIds: z.array(z.string().uuid('ID de membro inválido')).optional(),
});

// Tipos
interface TeamQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  department?: string;
  status?: string;
  managerId?: string;
}

// Controlador para listar equipes com paginação e filtros
export const getTeams = async (req: Request<{}, {}, {}, TeamQueryParams>) => {
  try {
    const { page = '1', limit = '10', search, department, status, managerId } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = Math.min(parseInt(limit, 10) || 10, 100);
    const skip = (pageNumber - 1) * pageSize;

    // Filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (department) where.department = department;
    if (status) where.status = status;
    if (managerId) where.managerId = managerId;

    // Busca as equipes com paginação
    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          members: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                  position: true,
                },
              },
              role: true,
              joinedAt: true,
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.team.count({ where }),
    ]);

    return {
      success: true,
      data: teams,
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

// Controlador para obter uma equipe por ID
export const getTeamById = async (teamId: string) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            position: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                position: true,
                department: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        competencies: {
          include: {
            competency: true,
            updatedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundError('Equipe não encontrada');
    }

    return {
      success: true,
      data: team,
    };
  } catch (error) {
    throw error;
  }
};

// Controlador para criar uma nova equipe
export const createTeam = async (req: Request) => {
  try {
    const { memberIds, ...data } = createTeamSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new ForbiddenError('Usuário não autenticado');
    }

    // Verifica se o gerente existe
    const manager = await prisma.user.findUnique({
      where: { id: data.managerId },
    });

    if (!manager) {
      throw new BadRequestError('Gerente não encontrado');
    }

    // Verifica se os membros existem
    if (memberIds && memberIds.length > 0) {
      const members = await prisma.user.findMany({
        where: { id: { in: memberIds } },
      });

      if (members.length !== memberIds.length) {
        throw new BadRequestError('Um ou mais membros não foram encontrados');
      }
    }

    // Cria a equipe
    const team = await prisma.team.create({
      data: {
        ...data,
        createdById: userId,
        members: {
          create: [
            // Adiciona o gerente como membro com papel de líder
            {
              userId: data.managerId,
              role: 'LEADER',
              joinedAt: new Date(),
            },
            // Adiciona os demais membros
            ...(memberIds || [])
              .filter((id: string) => id !== data.managerId) // Evita duplicar o gerente
              .map((userId: string) => ({
                userId,
                role: 'MEMBER',
                joinedAt: new Date(),
              })),
          ],
        },
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // TODO: Enviar notificações para os membros adicionados

    return {
      success: true,
      message: 'Equipe criada com sucesso',
      data: team,
    };
  } catch (error) {
    throw error;
  }
};

// Controlador para atualizar uma equipe
export const updateTeam = async (teamId: string, req: Request) => {
  try {
    const { memberIds, ...data } = updateTeamSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new ForbiddenError('Usuário não autenticado');
    }

    // Verifica se a equipe existe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team) {
      throw new NotFoundError('Equipe não encontrada');
    }

    // Verifica se o usuário tem permissão para atualizar a equipe
    const isAdmin = req.user?.role === 'ADMIN';
    const isTeamManager = team.managerId === userId;
    
    if (!isAdmin && !isTeamManager) {
      throw new ForbiddenError('Você não tem permissão para atualizar esta equipe');
    }

    // Se estiver atualizando o gerente, verifica se o novo gerente existe
    if (data.managerId) {
      const newManager = await prisma.user.findUnique({
        where: { id: data.managerId },
      });

      if (!newManager) {
        throw new BadRequestError('Novo gerente não encontrado');
      }
    }

    // Atualiza a equipe
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        ...data,
        // Atualiza os membros se necessário
        ...(memberIds && {
          members: {
            // Remove todos os membros atuais
            deleteMany: {},
            // Adiciona os novos membros
            create: [
              // Adiciona o gerente como membro com papel de líder
              {
                userId: data.managerId || team.managerId,
                role: 'LEADER',
                joinedAt: new Date(),
              },
              // Adiciona os demais membros, exceto o gerente
              ...(memberIds || [])
                .filter((id: string) => id !== (data.managerId || team.managerId))
                .map((userId: string) => ({
                  userId,
                  role: 'MEMBER',
                  joinedAt: new Date(),
                })),
            ],
          },
        }),
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // TODO: Enviar notificações para os membros adicionados/removidos

    return {
      success: true,
      message: 'Equipe atualizada com sucesso',
      data: updatedTeam,
    };
  } catch (error) {
    throw error;
  }
};

// Controlador para excluir uma equipe
export const deleteTeam = async (teamId: string, req: Request) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ForbiddenError('Usuário não autenticado');
    }

    // Verifica se a equipe existe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundError('Equipe não encontrada');
    }

    // Verifica se o usuário tem permissão para excluir a equipe
    const isAdmin = req.user?.role === 'ADMIN';
    const isTeamManager = team.managerId === userId;
    
    if (!isAdmin && !isTeamManager) {
      throw new ForbiddenError('Você não tem permissão para excluir esta equipe');
    }

    // Exclui a equipe (os relacionamentos são configurados para CASCADE)
    await prisma.team.delete({
      where: { id: teamId },
    });

    // TODO: Enviar notificações para os membros da equipe

    return {
      success: true,
      message: 'Equipe excluída com sucesso',
    };
  } catch (error) {
    throw error;
  }
};

// Controlador para adicionar membros a uma equipe
export const addTeamMembers = async (teamId: string, req: Request) => {
  try {
    const { memberIds } = z.object({
      memberIds: z.array(z.string().uuid('ID de membro inválido')).min(1, 'Pelo menos um membro deve ser fornecido'),
    }).parse(req.body);

    const userId = req.user?.id;

    if (!userId) {
      throw new ForbiddenError('Usuário não autenticado');
    }

    // Verifica se a equipe existe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team) {
      throw new NotFoundError('Equipe não encontrada');
    }

    // Verifica se o usuário tem permissão para adicionar membros
    const isAdmin = req.user?.role === 'ADMIN';
    const isTeamManager = team.managerId === userId;
    
    if (!isAdmin && !isTeamManager) {
      throw new ForbiddenError('Você não tem permissão para adicionar membros a esta equipe');
    }

    // Verifica se os membros existem
    const existingMembers = await prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true },
    });

    if (existingMembers.length !== memberIds.length) {
      throw new BadRequestError('Um ou mais membros não foram encontrados');
    }

    // Filtra membros que já estão na equipe
    const existingMemberIds = team.members.map(member => member.userId);
    const newMemberIds = memberIds.filter((id: string) => !existingMemberIds.includes(id));

    if (newMemberIds.length === 0) {
      throw new BadRequestError('Todos os membros já estão na equipe');
    }

    // Adiciona os novos membros à equipe
    await prisma.teamMember.createMany({
      data: newMemberIds.map((userId: string) => ({
        teamId,
        userId,
        role: 'MEMBER',
        joinedAt: new Date(),
      })),
    });

    // Atualiza a equipe com os novos membros
    const updatedTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // TODO: Enviar notificações para os novos membros

    return {
      success: true,
      message: 'Membros adicionados à equipe com sucesso',
      data: updatedTeam,
    };
  } catch (error) {
    throw error;
  }
};

// Controlador para remover membros de uma equipe
export const removeTeamMembers = async (teamId: string, req: Request) => {
  try {
    const { memberIds } = z.object({
      memberIds: z.array(z.string().uuid('ID de membro inválido')).min(1, 'Pelo menos um membro deve ser fornecido'),
    }).parse(req.body);

    const userId = req.user?.id;

    if (!userId) {
      throw new ForbiddenError('Usuário não autenticado');
    }

    // Verifica se a equipe existe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team) {
      throw new NotFoundError('Equipe não encontrada');
    }

    // Verifica se o usuário tem permissão para remover membros
    const isAdmin = req.user?.role === 'ADMIN';
    const isTeamManager = team.managerId === userId;
    
    if (!isAdmin && !isTeamManager) {
      throw new ForbiddenError('Você não tem permissão para remover membros desta equipe');
    }

    // Verifica se está tentando remover o gerente
    if (memberIds.includes(team.managerId)) {
      throw new BadRequestError('Não é possível remover o gerente da equipe desta forma');
    }

    // Remove os membros da equipe
    await prisma.teamMember.deleteMany({
      where: {
        teamId,
        userId: { in: memberIds },
      },
    });

    // Atualiza a equipe sem os membros removidos
    const updatedTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // TODO: Enviar notificações para os membros removidos

    return {
      success: true,
      message: 'Membros removidos da equipe com sucesso',
      data: updatedTeam,
    };
  } catch (error) {
    throw error;
  }
};
