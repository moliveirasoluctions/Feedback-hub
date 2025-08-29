import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import teamRoutes from './team.routes';
import feedbackRoutes from './feedback.routes';

const router = Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de usuários
router.use('/users', userRoutes);

// Rotas de equipes
router.use('/teams', teamRoutes);

// Rotas de feedbacks
router.use('/feedbacks', feedbackRoutes);

// Rota de saúde da API
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API está funcionando corretamente',
    timestamp: new Date().toISOString(),
  });
});

// Rota não encontrada
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
  });
});
// Manipulador para rotas não encontradas
router.use(notFoundHandler);

export default router;
