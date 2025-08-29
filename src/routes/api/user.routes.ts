import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  updatePassword 
} from '../../controllers/user.controller';

const router = Router();

// Aplica autenticação em todas as rotas
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Listar usuários com paginação e filtros
 * @access  Admin, HR
 * @query   page: número da página (opcional, padrão: 1)
 * @query   limit: itens por página (opcional, padrão: 10, máximo: 100)
 * @query   search: termo de busca (opcional)
 * @query   role: filtrar por função (opcional)
 * @query   department: filtrar por departamento (opcional)
 * @query   status: filtrar por status (opcional)
 */
router.get('/', authorize(['ADMIN', 'HR']), async (req, res, next) => {
  try {
    const result = await getUsers(req);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Obter um usuário por ID
 * @access  Autenticado
 * @params  id: ID do usuário
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await getUserById(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/users
 * @desc    Criar um novo usuário
 * @access  Admin, HR
 * @body    { name, email, password, role, department, position, status, phone, avatar }
 */
router.post('/', authorize(['ADMIN', 'HR']), async (req, res, next) => {
  try {
    const result = await createUser(req);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Atualizar um usuário
 * @access  Admin, HR ou o próprio usuário
 * @params  id: ID do usuário
 * @body    { name, email, role, department, position, status, phone, avatar }
 */
router.put('/:id', async (req, res, next) => {
  try {
    // Verifica se o usuário tem permissão
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'HR' && req.user?.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar este usuário',
      });
    }

    // Impede que usuários não-administradores alterem a função ou status
    if (req.user?.role !== 'ADMIN' && (req.body.role || req.body.status)) {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem alterar a função ou status de um usuário',
      });
    }

    const result = await updateUser(req.params.id, req);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Excluir um usuário
 * @access  Admin, HR
 * @params  id: ID do usuário
 */
router.delete('/:id', authorize(['ADMIN', 'HR']), async (req, res, next) => {
  try {
    const result = await deleteUser(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/:id/password
 * @desc    Atualizar senha do usuário
 * @access  Próprio usuário ou Admin/HR
 * @params  id: ID do usuário
 * @body    { currentPassword, newPassword }
 */
router.put('/:id/password', async (req, res, next) => {
  try {
    // Verifica se o usuário tem permissão
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'HR' && req.user?.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar a senha deste usuário',
      });
    }

    const result = await updatePassword(req.params.id, req);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
