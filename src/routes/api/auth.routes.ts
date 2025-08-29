import { Router } from 'express';
import { login, register, refreshToken, getProfile } from '../../controllers/auth.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuário
 * @access  Público
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Público
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Atualizar token de acesso
 * @access  Público (mas requer refresh token válido)
 */
router.post('/refresh-token', refreshToken);

/**
 * @route   GET /api/auth/me
 * @desc    Obter perfil do usuário autenticado
 * @access  Privado
 */
router.get('/me', authenticate, getProfile);

export default router;
