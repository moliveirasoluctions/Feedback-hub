import { Request } from 'express';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../utils/errorHandler';
import { feedbackUtils } from '../feedback.controller';

// Esquemas de validação
const createCommentSchema = z.object({
  content: z.string().min(1, 'O comentário não pode estar vazio'),
  isInternal: z.boolean().default(false),
});

const updateCommentSchema = z.object({
  content: z.string().min(1, 'O comentário não pode estar vazio'),
});

// Controlador para adicionar um comentário a um feedback
export const addComment = async (feedbackId: string, req: Request) => {
  const { content, isInternal } = createCommentSchema.parse(req.body);
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

  // Verifica se o usuário tem permissão para comentar
  let canComment = false;
  
  // Admin pode comentar em qualquer feedback
  if (req.user?.role === 'ADMIN') {
    canComment = true;
  } 
  // O remetente pode comentar
  else if (feedback.giverId === userId) {
    canComment = true;
  }
  // O destinatário pode comentar
  else if (feedback.receiverId === userId) {
    canComment = true;
  }
  // Membro da equipe pode comentar (se não for confidencial)
  else if (feedback.teamId && !feedback.isConfidential) {
    const isMember = await feedbackUtils.isTeamMember(feedback.teamId, userId);
    if (isMember) {
      canComment = true;
    }
  }

  if (!canComment) {
    throw new ForbiddenError('Você não tem permissão para comentar neste feedback');
  }

  // Cria o comentário
  const comment = await prisma.comment.create({
    data: {
      content,
      isInternal,
      feedbackId,
      userId,
    },
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
  });

  // Atualiza a data de atualização do feedback
  await prisma.feedback.update({
    where: { id: feedbackId },
    data: { updatedAt: new Date() },
  });

  // TODO: Enviar notificação para as partes interessadas
  // - Se não for um comentário interno, notificar o outro participante
  // - Se for um comentário interno, notificar apenas administradores/gerentes

  return {
    success: true,
    message: 'Comentário adicionado com sucesso',
    data: comment,
  };
};

// Controlador para atualizar um comentário
export const updateComment = async (commentId: string, req: Request) => {
  const { content } = updateCommentSchema.parse(req.body);
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ForbiddenError('Usuário não autenticado');
  }

  // Verifica se o comentário existe
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      feedback: true,
    },
  });

  if (!comment) {
    throw new NotFoundError('Comentário não encontrado');
  }

  // Verifica se o usuário tem permissão para atualizar o comentário
  if (comment.userId !== userId && req.user?.role !== 'ADMIN') {
    throw new ForbiddenError('Você não tem permissão para atualizar este comentário');
  }

  // Verifica se o comentário pode ser atualizado (apenas se for o autor ou admin)
  if (comment.userId !== userId && req.user?.role !== 'ADMIN') {
    throw new ForbiddenError('Apenas o autor ou um administrador pode atualizar este comentário');
  }

  // Atualiza o comentário
  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      content,
      updatedAt: new Date(),
    },
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
  });

  // Atualiza a data de atualização do feedback
  await prisma.feedback.update({
    where: { id: comment.feedbackId },
    data: { updatedAt: new Date() },
  });

  return {
    success: true,
    message: 'Comentário atualizado com sucesso',
    data: updatedComment,
  };
};

// Controlador para excluir um comentário
export const deleteComment = async (commentId: string, req: Request) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ForbiddenError('Usuário não autenticado');
  }

  // Verifica se o comentário existe
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      feedback: true,
    },
  });

  if (!comment) {
    throw new NotFoundError('Comentário não encontrado');
  }

  // Verifica se o usuário tem permissão para excluir o comentário
  if (comment.userId !== userId && req.user?.role !== 'ADMIN') {
    throw new ForbiddenError('Você não tem permissão para excluir este comentário');
  }

  // Exclui o comentário
  await prisma.comment.delete({
    where: { id: commentId },
  });

  // Atualiza a data de atualização do feedback
  await prisma.feedback.update({
    where: { id: comment.feedbackId },
    data: { updatedAt: new Date() },
  });

  return {
    success: true,
    message: 'Comentário excluído com sucesso',
  };
};
