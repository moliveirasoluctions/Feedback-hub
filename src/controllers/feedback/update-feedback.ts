import { Request } from 'express';
import { prisma } from '../../lib/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errorHandler';
import { updateFeedbackSchema } from '../feedback.controller';
import { feedbackUtils } from '../feedback.controller';

export const updateFeedback = async (feedbackId: string, req: Request) => {
  const data = updateFeedbackSchema.parse(req.body);
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ForbiddenError('Usuário não autenticado');
  }

  // Verifica se o feedback existe
  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    include: {
      giver: true,
      receiver: true,
      team: true,
    },
  });

  if (!feedback) {
    throw new NotFoundError('Feedback não encontrado');
  }

  // Verifica se o usuário tem permissão para atualizar o feedback
  let canUpdate = false;
  
  // Admin pode atualizar qualquer feedback
  if (req.user?.role === 'ADMIN') {
    canUpdate = true;
  } 
  // O remetente pode atualizar seu próprio feedback
  else if (feedback.giverId === userId) {
    canUpdate = true;
  }
  // O gerente da equipe pode atualizar feedbacks da equipe
  else if (feedback.teamId && await feedbackUtils.isTeamManager(feedback.teamId, userId)) {
    canUpdate = true;
  }

  if (!canUpdate) {
    throw new ForbiddenError('Você não tem permissão para atualizar este feedback');
  }

  // Verifica se o feedback pode ser atualizado
  if (feedback.status === 'APPROVED' || feedback.status === 'ARCHIVED') {
    throw new BadRequestError('Não é possível atualizar um feedback aprovado ou arquivado');
  }

  // Prepara os dados para atualização
  const updateData: any = { ...data };
  
  // Converte strings de data para objetos Date
  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }
  
  if (data.completedAt !== undefined) {
    updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null;
  }

  // Registra as alterações no histórico
  const changes: any[] = [];
  
  // Verifica quais campos foram alterados
  for (const [key, value] of Object.entries(data)) {
    if (key in feedback && feedback[key as keyof typeof feedback] !== value) {
      changes.push({
        userId,
        action: 'FEEDBACK_UPDATED',
        changedField: key,
        oldValue: String(feedback[key as keyof typeof feedback] || ''),
        newValue: String(value),
      });
    }
  }

  // Se houver alterações, adiciona ao histórico
  if (changes.length > 0) {
    updateData.history = {
      create: changes,
    };
  }

  // Atualiza o feedback
  const updatedFeedback = await prisma.feedback.update({
    where: { id: feedbackId },
    data: updateData,
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

  // TODO: Enviar notificação para as partes interessadas
  // - Se o status mudou, notificar o remetente/destinatário
  // - Se o feedback foi aprovado, notificar o RH/Admin

  return {
    success: true,
    message: 'Feedback atualizado com sucesso',
    data: updatedFeedback,
  };
};
