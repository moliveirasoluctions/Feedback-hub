import { Request } from 'express';
import { prisma } from '../../lib/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errorHandler';
import { feedbackUtils } from '../feedback.controller';

export const deleteFeedback = async (feedbackId: string, req: Request) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ForbiddenError('Usuário não autenticado');
  }

  // Verifica se o feedback existe
  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId },
    include: {
      team: true,
    },
  });

  if (!feedback) {
    throw new NotFoundError('Feedback não encontrado');
  }

  // Verifica se o usuário tem permissão para excluir o feedback
  let canDelete = false;
  
  // Admin pode excluir qualquer feedback
  if (req.user?.role === 'ADMIN') {
    canDelete = true;
  } 
  // O remetente pode excluir seu próprio feedback se ainda não estiver aprovado
  else if (feedback.giverId === userId && feedback.status !== 'APPROVED') {
    canDelete = true;
  }
  // O gerente da equipe pode excluir feedbacks da equipe
  else if (feedback.teamId && await feedbackUtils.isTeamManager(feedback.teamId, userId)) {
    canDelete = true;
  }

  if (!canDelete) {
    throw new ForbiddenError('Você não tem permissão para excluir este feedback');
  }

  // Verifica se o feedback pode ser excluído
  if (feedback.status === 'ARCHIVED') {
    throw new BadRequestError('Não é possível excluir um feedback arquivado');
  }

  // Se for um feedback aprovado, apenas administradores podem excluir
  if (feedback.status === 'APPROVED' && req.user?.role !== 'ADMIN') {
    throw new ForbiddenError('Apenas administradores podem excluir feedbacks aprovados');
  }

  // Exclui o feedback (os relacionamentos são configurados para CASCADE)
  await prisma.feedback.delete({
    where: { id: feedbackId },
  });

  // TODO: Enviar notificação para as partes interessadas
  // - Notificar o destinatário que o feedback foi removido
  // - Se for um feedback de equipe, notificar a equipe

  return {
    success: true,
    message: 'Feedback excluído com sucesso',
  };
};
