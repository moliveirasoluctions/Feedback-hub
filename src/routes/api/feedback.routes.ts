import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation.js';
import feedbackController, { 
  createFeedbackSchema, 
  updateFeedbackSchema
} from '../../controllers/feedback';

type SortField = 'rating' | 'priority' | 'dueDate' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface FeedbackQuery extends Record<string, string | undefined> {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  teamId?: string;
  receiverId?: string;
  giverId?: string;
  sortBy?: string;
  sortOrder?: string;
}

const router = Router();

// Aplica autenticação em todas as rotas
router.use(authenticate);

/**
 * @route   GET /api/feedbacks
 * @desc    Listar feedbacks com paginação e filtros
 * @access  Autenticado
 * @query   page: número da página (opcional, padrão: 1)
 * @query   limit: itens por página (opcional, padrão: 10, máximo: 100)
 * @query   type: tipo de feedback (opcional)
 * @query   status: status do feedback (opcional)
 * @query   priority: prioridade do feedback (opcional)
 * @query   giverId: ID do remetente (opcional)
 * @query   receiverId: ID do destinatário (opcional)
 * @query   teamId: ID da equipe (opcional)
 * @query   search: termo de busca (opcional)
 * @query   sortBy: campo para ordenação (opcional, padrão: 'createdAt')
 * @query   sortOrder: ordem de ordenação (opcional, padrão: 'desc')
 */
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      search, 
      status, 
      teamId, 
      receiverId, 
      giverId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query as FeedbackQuery;

    // Validate sort fields
    const validSortFields: SortField[] = ['rating', 'priority', 'dueDate', 'createdAt'];
    const sortField = validSortFields.includes(sortBy as SortField) 
      ? sortBy as SortField 
      : 'createdAt';

    const sortDirection: SortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    const result = await feedbackController.getFeedbacks({
      page,
      limit,
      search,
      status,
      teamId,
      receiverId,
      giverId,
      sortBy: sortField,
      sortOrder: sortDirection,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/feedbacks/:id
 * @desc    Obter um feedback por ID
 * @access  Autenticado
 * @param   id ID do feedback
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    const feedback = await feedbackController.getFeedbackById(id, userId);
    res.json(feedback);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/feedbacks
 * @desc    Criar um novo feedback
 * @access  Autenticado
 */
router.post(
  '/',
  validateRequest({ body: createFeedbackSchema }),
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Não autorizado' });
      }

      const feedback = await feedbackController.createFeedback(req.body, userId);
      res.status(201).json(feedback);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/feedbacks/:id
 * @desc    Atualizar um feedback existente
 * @access  Autenticado
 * @param   id ID do feedback
 */
router.put(
  '/:id',
  validateRequest({ body: updateFeedbackSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Não autorizado' });
      }

      const feedback = await feedbackController.updateFeedback(id, req.body, userId);
      res.json(feedback);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/feedbacks/:id
 * @desc    Excluir um feedback
 * @access  Autenticado
 * @param   id ID do feedback
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    await feedbackController.deleteFeedback(id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/feedbacks/:id/comments
 * @desc    Adicionar um comentário a um feedback
 * @access  Autenticado
 * @param   id ID do feedback
 */
router.post(
  '/:id/comments',
  validateRequest({
    body: z.object({
      content: z.string().min(1, 'O comentário não pode estar vazio'),
    }),
  }),
  async (req, res, next) => {
    try {
      const { id: feedbackId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Não autorizado' });
      }

      const comment = await feedbackController.addComment(
        feedbackId,
        req.body,
        userId
      );
      
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/comments/:id
 * @desc    Atualizar um comentário
 * @access  Autenticado
 * @param   id ID do comentário
 */
router.put(
  '/comments/:id',
  validateRequest({
    body: z.object({
      content: z.string().min(1, 'O comentário não pode estar vazio'),
    }),
  }),
  async (req, res, next) => {
    try {
      const { id: commentId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Não autorizado' });
      }

      const comment = await feedbackController.updateComment(
        commentId,
        req.body,
        userId
      );
      
      res.json(comment);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/comments/:id
 * @desc    Excluir um comentário
 * @access  Autenticado
 * @param   id ID do comentário
 */
router.delete('/comments/:id', async (req, res, next) => {
  try {
    const { id: commentId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    await feedbackController.deleteComment(commentId, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/feedbacks
 * @desc    Criar um novo feedback
 * @access  Autenticado
 * @body    Ver createFeedbackSchema para os campos necessários
 */
router.post(
  '/', 
  validateRequest({ body: createFeedbackSchema }), 
  async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Não autorizado' });
      }
      const feedback = await feedbackController.createFeedback(req.body, req.user.id);
      res.status(201).json(feedback);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/feedbacks/:id
 * @desc    Atualizar um feedback
 * @access  Autor do feedback, Gerente da equipe ou Admin
 * @params  id: ID do feedback
 * @body    Ver updateFeedbackSchema para os campos atualizáveis
 */
router.put(
  '/:id', 
  validateRequest({ body: updateFeedbackSchema }),
  async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Não autorizado' });
      }
      const feedback = await feedbackController.updateFeedback(req.params.id, req.body, req.user.id);
      res.json(feedback);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/feedbacks/:id
 * @desc    Excluir um feedback
 * @access  Autor do feedback, Gerente da equipe ou Admin
 * @params  id: ID do feedback
 */
router.delete('/:id', async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Não autorizado' });
    }
    await feedbackController.deleteFeedback(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/feedbacks/:id/comments
 * @desc    Adicionar um comentário a um feedback
 * @access  Participante do feedback ou Membro da equipe (se não for confidencial)
 * @params  id: ID do feedback
 * @body    { content: string, isInternal?: boolean }
 */
router.post('/:id/comments', async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Não autorizado' });
    }
    const comment = await feedbackController.addComment(req.params.id, req.body, req.user.id);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/feedbacks/comments/:commentId
 * @desc    Atualizar um comentário
 * @access  Autor do comentário ou Admin
 * @params  commentId: ID do comentário
 * @body    { content: string }
 */
router.put('/comments/:commentId', async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Não autorizado' });
    }
    const comment = await feedbackController.updateComment(req.params.commentId, req.body, req.user.id);
    res.json(comment);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/feedbacks/comments/:commentId
 * @desc    Excluir um comentário
 * @access  Autor do comentário ou Admin
 * @params  commentId: ID do comentário
 */
router.delete('/comments/:commentId', async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Não autorizado' });
    }
    await feedbackController.deleteComment(req.params.commentId, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
