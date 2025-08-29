import { prisma } from '../../../lib/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../../utils/errorHandler';
import { 
  FeedbackController, 
  createFeedbackSchema, 
  updateFeedbackSchema,
  FeedbackQueryParams 
} from './types';

// Helper functions
async function isTeamMember(teamId: string, userId: string): Promise<boolean> {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      members: {
        some: { id: userId }
      }
    },
  });
  return !!team;
}

async function isTeamManager(teamId: string, userId: string): Promise<boolean> {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      managerId: userId,
    },
  });
  return !!team;
}

export const feedbackUtils = {
  isTeamMember,
  isTeamManager,
};

// Main controller implementation
const feedbackController: FeedbackController = {
  async getFeedbacks(params) {
    const { page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc', ...filters } = params;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where: any = {};
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    
    if (filters.status) where.status = filters.status;
    if (filters.teamId) where.teamId = filters.teamId;
    if (filters.receiverId) where.receiverId = filters.receiverId;
    if (filters.giverId) where.giverId = filters.giverId;

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          receiver: { select: { id: true, name: true, email: true } },
          giver: { select: { id: true, name: true, email: true } },
          team: { select: { id: true, name: true } },
        },
      }),
      prisma.feedback.count({ where }),
    ]);

    return {
      data: feedbacks,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  },

  async getFeedbackById(id, userId) {
    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        receiver: { select: { id: true, name: true, email: true } },
        giver: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundError('Feedback não encontrado');
    }

    // Check permissions
    const isReceiver = feedback.receiverId === userId;
    const isGiver = feedback.giverId === userId;
    const isTeamManager = feedback.teamId ? await this.utils.isTeamManager(feedback.teamId, userId) : false;

    if (!isReceiver && !isGiver && !isTeamManager) {
      throw new ForbiddenError('Você não tem permissão para acessar este feedback');
    }

    // Anonymize if needed
    if (feedback.isAnonymous && !isGiver) {
      feedback.giver = { id: 'anonymous', name: 'Anônimo', email: '' } as any;
    }

    return feedback;
  },

  async createFeedback(data, userId) {
    // Validate team membership if team is provided
    if (data.teamId && !(await this.utils.isTeamMember(data.teamId, userId))) {
      throw new ForbiddenError('Você não é membro desta equipe');
    }

    // Validate receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: data.receiverId },
    });

    if (!receiver) {
      throw new BadRequestError('Destinatário não encontrado');
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        ...data,
        giverId: userId,
        status: 'PENDING',
      },
      include: {
        receiver: { select: { id: true, name: true, email: true } },
        giver: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
      },
    });

    // TODO: Send notification to receiver

    return feedback;
  },

  async updateFeedback(id, data, userId) {
    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundError('Feedback não encontrado');
    }

    // Only giver or admin can update
    if (feedback.giverId !== userId) {
      throw new ForbiddenError('Você só pode editar seus próprios feedbacks');
    }

    // Prevent updating certain fields
    const { giverId, receiverId, ...updateData } = data as any;

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: updateData,
      include: {
        receiver: { select: { id: true, name: true, email: true } },
        giver: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true } },
      },
    });

    // TODO: Send notification if status changed

    return updatedFeedback;
  },

  async deleteFeedback(id, userId) {
    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundError('Feedback não encontrado');
    }

    // Only giver or admin can delete
    if (feedback.giverId !== userId) {
      throw new ForbiddenError('Você só pode excluir seus próprios feedbacks');
    }

    await prisma.feedback.delete({
      where: { id },
    });
  },

  async addComment(feedbackId, data, userId) {
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new NotFoundError('Feedback não encontrado');
    }

    // Check permissions
    const isReceiver = feedback.receiverId === userId;
    const isGiver = feedback.giverId === userId;
    const isTeamManager = feedback.teamId ? await this.utils.isTeamManager(feedback.teamId, userId) : false;

    if (!isReceiver && !isGiver && !isTeamManager) {
      throw new ForbiddenError('Você não tem permissão para comentar neste feedback');
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        feedbackId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // TODO: Send notification to other participants

    return comment;
  },

  async updateComment(commentId, data, userId) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError('Comentário não encontrado');
    }

    // Only comment author can update
    if (comment.userId !== userId) {
      throw new ForbiddenError('Você só pode editar seus próprios comentários');
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: data.content },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return updatedComment;
  },

  async deleteComment(commentId, userId) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError('Comentário não encontrado');
    }

    // Only comment author or admin can delete
    if (comment.userId !== userId) {
      throw new ForbiddenError('Você só pode excluir seus próprios comentários');
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
  },
};

// Add utils to controller instance
feedbackController.utils = feedbackUtils;

export default feedbackController;

export {
  createFeedbackSchema,
  updateFeedbackSchema,
};

export type { FeedbackQueryParams };
