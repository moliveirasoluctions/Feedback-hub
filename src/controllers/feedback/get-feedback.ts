import { Request } from 'express';
import { prisma } from '../../lib/prisma';
import { NotFoundError, ForbiddenError } from '../../utils/errorHandler';
import { feedbackUtils } from '../feedback.controller';

export const getFeedbackById = async (feedbackId: string, req: Request) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ForbiddenError('Usuário não autenticado');
  }

  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
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
      comments: {
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
        orderBy: { createdAt: 'desc' },
      },
      attachments: {
        orderBy: { uploadedAt: 'desc' },
      },
    },
  });

  if (!feedback) {
    throw new NotFoundError('Feedback não encontrado');
  }

  // Verifica se o usuário tem permissão para ver o feedback
  let canView = false;
  
  // Admin pode ver tudo
  if (req.user?.role === 'ADMIN') {
    canView = true;
  } 
  // O remetente pode ver seu próprio feedback
  else if (feedback.giverId === userId) {
    canView = true;
  } 
  // O destinatário pode ver feedbacks destinados a ele
  else if (feedback.receiverId === userId) {
    canView = true;
  }
  // Gerente da equipe pode ver feedbacks da equipe
  else if (feedback.teamId && req.user?.managedTeams?.includes(feedback.teamId)) {
    canView = true;
  }
  // Membro da equipe pode ver feedbacks da equipe (se não for confidencial)
  else if (feedback.teamId && !feedback.isConfidential) {
    const isMember = await feedbackUtils.isTeamMember(feedback.teamId, userId);
    if (isMember) {
      canView = true;
    }
  }

  if (!canView) {
    throw new ForbiddenError('Você não tem permissão para visualizar este feedback');
  }

  // Se o feedback for anônimo, remove as informações do remetente
  const sanitizedFeedback = feedback.isAnonymous
    ? {
        ...feedback,
        giver: { id: 'anonymous', name: 'Anônimo', email: null, avatar: null },
      }
    : feedback;

  return {
    success: true,
    data: sanitizedFeedback,
  };
};
