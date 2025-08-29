import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../utils/errorHandler';

// Types
export interface FeedbackQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  teamId?: string;
  receiverId?: string;
  giverId?: string;
  sortBy?: 'rating' | 'priority' | 'dueDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Types
export interface FeedbackQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  teamId?: string;
  receiverId?: string;
  giverId?: string;
  sortBy?: 'rating' | 'priority' | 'dueDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Validation Schemas
const createFeedbackSchema = z.object({

// Validation Schemas
const createFeedbackSchema = z.object({
  type: z.enum(['PERFORMANCE', 'BEHAVIOR', 'PROJECT', 'FEEDBACK_360']),
  receiverId: z.string().uuid('ID do destinatário inválido'),
  teamId: z.string().uuid('ID da equipe inválido').optional(),
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres'),
  description: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres'),
  rating: z.number().int().min(1).max(5, 'A avaliação deve ser entre 1 e 5'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  isAnonymous: z.boolean().default(false),
  isConfidential: z.boolean().default(false),
  dueDate: z.string().datetime('Data de vencimento inválida').optional(),
  competencies: z.array(
    z.object({
      competencyId: z.string().uuid('ID da competência inválido'),
      rating: z.number().int().min(1).max(5, 'A avaliação deve ser entre 1 e 5'),
      comments: z.string().optional(),
    })
  ).optional(),
});

export const updateFeedbackSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres').optional(),
  description: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres').optional(),
  rating: z.number().int().min(1).max(5, 'A avaliação deve ser entre 1 e 5').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['DRAFT', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED']).optional(),
  isAnonymous: z.boolean().optional(),
  isConfidential: z.boolean().optional(),
  dueDate: z.string().datetime('Data de vencimento inválida').optional().nullable(),
  completedAt: z.string().datetime('Data de conclusão inválida').optional().nullable(),
});

// Tipos
export interface FeedbackQueryParams {
  page?: string;
  limit?: string;
  type?: string;
  status?: string;
  priority?: string;
  giverId?: string;
  receiverId?: string;
  teamId?: string;
  search?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'rating' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

// Funções auxiliares
async function isTeamMember(teamId: string, userId: string): Promise<boolean> {
  const member = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId,
    },
  });
  return !!member;
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

// Export helper functions
export const feedbackUtils = {
  isTeamMember,
  isTeamManager,
};

// Export schemas and types
export { createFeedbackSchema, updateFeedbackSchema };

// Feedback controller interface
type FeedbackController = {
  getFeedbacks: (params: FeedbackQueryParams) => Promise<any>;
  getFeedbackById: (id: string, userId: string) => Promise<any>;
  createFeedback: (data: z.infer<typeof createFeedbackSchema>, userId: string) => Promise<any>;
  updateFeedback: (id: string, data: z.infer<typeof updateFeedbackSchema>, userId: string) => Promise<any>;
  deleteFeedback: (id: string, userId: string) => Promise<void>;
  addComment: (feedbackId: string, data: any, userId: string) => Promise<any>;
  updateComment: (commentId: string, data: any, userId: string) => Promise<any>;
  deleteComment: (commentId: string, userId: string) => Promise<void>;
};

// Controller implementations
export const feedbackController: FeedbackController = {
  async getFeedbacks(params) {
    // Implementation
    return [];
  },
  
  async getFeedbackById(id, userId) {
    // Implementation
    return {};
  },
  
  async createFeedback(data, userId) {
    // Implementation
    return {};
  },
  
  async updateFeedback(id, data, userId) {
    // Implementation
    return {};
  },
  
  async deleteFeedback(id, userId) {
    // Implementation
  },
  
  async addComment(feedbackId, data, userId) {
    // Implementation
    return {};
  },
  
  async updateComment(commentId, data, userId) {
    // Implementation
    return {};
  },
  
  async deleteComment(commentId, userId) {
    // Implementation
  }
};
