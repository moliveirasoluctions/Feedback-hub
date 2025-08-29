import { Request } from 'express';
import { prisma } from '../../lib/prisma';
import { BadRequestError, ForbiddenError } from '../../utils/errorHandler';
import { createFeedbackSchema } from '../feedback.controller';
import { feedbackUtils } from '../feedback.controller';

export const createFeedback = async (req: Request) => {
  const data = createFeedbackSchema.parse(req.body);
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ForbiddenError('Usuário não autenticado');
  }

  // Verifica se o destinatário existe
  const receiver = await prisma.user.findUnique({
    where: { id: data.receiverId },
  });

  if (!receiver) {
    throw new BadRequestError('Destinatário não encontrado');
  }

  // Não permite criar feedback para si mesmo, a menos que seja um feedback 360
  if (data.type !== 'FEEDBACK_360' && data.receiverId === userId) {
    throw new BadRequestError('Não é possível criar feedback para si mesmo');
  }

  // Verifica se a equipe existe (se fornecida)
  if (data.teamId) {
    const team = await prisma.team.findUnique({
      where: { id: data.teamId },
      include: { members: true },
    });

    if (!team) {
      throw new BadRequestError('Equipe não encontrada');
    }

    // Verifica se o remetente pertence à equipe
    const isGiverInTeam = team.members.some(member => member.userId === userId);
    if (!isGiverInTeam && req.user?.role !== 'ADMIN') {
      throw new ForbiddenError('Você não é membro desta equipe');
    }

    // Verifica se o destinatário pertence à equipe
    const isReceiverInTeam = team.members.some(member => member.userId === data.receiverId);
    if (!isReceiverInTeam) {
      throw new BadRequestError('O destinatário não é membro desta equipe');
    }
  }

  // Verifica as competências (se fornecidas)
  if (data.competencies && data.competencies.length > 0) {
    const competencyIds = data.competencies.map(c => c.competencyId);
    const competencies = await prisma.competency.findMany({
      where: { id: { in: competencyIds } },
    });

    if (competencies.length !== competencyIds.length) {
      throw new BadRequestError('Uma ou mais competências não foram encontradas');
    }
  }

  // Cria o feedback
  const feedback = await prisma.feedback.create({
    data: {
      type: data.type,
      giverId: userId,
      receiverId: data.receiverId,
      teamId: data.teamId,
      title: data.title,
      description: data.description,
      rating: data.rating,
      priority: data.priority,
      isAnonymous: data.isAnonymous,
      isConfidential: data.isConfidential,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: 'PENDING',
      // Adiciona as competências
      ...(data.competencies && data.competencies.length > 0 && {
        competencies: {
          create: data.competencies.map(comp => ({
            competencyId: comp.competencyId,
            rating: comp.rating,
            comments: comp.comments,
          })),
        },
      }),
      // Registra a criação no histórico
      history: {
        create: [
          {
            userId,
            action: 'FEEDBACK_CREATED',
            changedField: 'status',
            oldValue: null,
            newValue: 'PENDING',
          },
        ],
      },
    },
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
    },
  });

  // TODO: Enviar notificação para o destinatário
  // TODO: Se for um feedback 360, notificar os outros avaliadores

  return {
    success: true,
    message: 'Feedback criado com sucesso',
    data: feedback,
  };
};
