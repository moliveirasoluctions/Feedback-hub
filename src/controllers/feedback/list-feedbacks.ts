import { Request } from 'express';
import { prisma } from '../../lib/prisma';
import { ForbiddenError } from '../../utils/errorHandler';
import { FeedbackQueryParams } from '../feedback.controller';
import { feedbackUtils } from '../feedback.controller';

export const getFeedbacks = async (req: Request<{}, {}, {}, FeedbackQueryParams>) => {
  const { 
    page = '1', 
    limit = '10', 
    type, 
    status, 
    priority, 
    giverId, 
    receiverId, 
    teamId, 
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;
  
  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = Math.min(parseInt(limit, 10) || 10, 100);
  const skip = (pageNumber - 1) * pageSize;
  const userId = req.user?.id;

  // Se não estiver autenticado, não pode ver feedbacks
  if (!userId) {
    throw new ForbiddenError('Usuário não autenticado');
  }

  // Filtros
  const where: any = {};
  
  // Filtros básicos
  if (type) where.type = type;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (giverId) where.giverId = giverId;
  if (receiverId) where.receiverId = receiverId;
  if (teamId) where.teamId = teamId;
  
  // Filtro de busca
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Se não for admin, só pode ver seus próprios feedbacks ou feedbacks que deu
  if (req.user?.role !== 'ADMIN') {
    where.OR = [
      { giverId: userId },
      { receiverId: userId },
      // Se for gerente, pode ver feedbacks da equipe
      ...(req.user?.managedTeams?.length ? [
        { teamId: { in: req.user.managedTeams } }
      ] : []),
      ...(where.OR || []),
    ];
  }

  // Ordenação
  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  // Busca os feedbacks com paginação
  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      include: {
        giver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        competencies: {
          include: {
            competency: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      skip,
      take: pageSize,
      orderBy,
    }),
    prisma.feedback.count({ where }),
  ]);

  // Se o feedback for anônimo, remove as informações do remetente
  const sanitizedFeedbacks = feedbacks.map(feedback => ({
    ...feedback,
    giver: feedback.isAnonymous 
      ? { id: 'anonymous', name: 'Anônimo', email: null, avatar: null }
      : feedback.giver,
  }));

  return {
    success: true,
    data: sanitizedFeedbacks,
    pagination: {
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      limit: pageSize,
    },
  };
};
