import { z } from 'zod';

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

export const createFeedbackSchema = z.object({
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
});

export const updateFeedbackSchema = createFeedbackSchema.partial().extend({
  status: z.enum(['DRAFT', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

interface FeedbackUtils {
  isTeamMember: (teamId: string, userId: string) => Promise<boolean>;
  isTeamManager: (teamId: string, userId: string) => Promise<boolean>;
}

export interface FeedbackController {
  getFeedbacks: (params: FeedbackQueryParams) => Promise<any>;
  getFeedbackById: (id: string, userId: string) => Promise<any>;
  createFeedback: (data: z.infer<typeof createFeedbackSchema>, userId: string) => Promise<any>;
  updateFeedback: (id: string, data: z.infer<typeof updateFeedbackSchema>, userId: string) => Promise<any>;
  deleteFeedback: (id: string, userId: string) => Promise<void>;
  addComment: (feedbackId: string, data: any, userId: string) => Promise<any>;
  updateComment: (commentId: string, data: any, userId: string) => Promise<any>;
  deleteComment: (commentId: string, userId: string) => Promise<void>;
  utils: FeedbackUtils;
}
