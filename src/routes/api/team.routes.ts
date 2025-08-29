import { Router } from 'express';
import { 
  getTeams, 
  getTeamById, 
  createTeam, 
  updateTeam, 
  deleteTeam,
  addTeamMembers,
  removeTeamMembers
} from '../../controllers/team.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Aplica autenticação em todas as rotas
router.use(authenticate);

/**
 * @route   GET /api/teams
 * @desc    Listar equipes com paginação e filtros
 * @access  Autenticado
 * @query   page: número da página (opcional, padrão: 1)
 * @query   limit: itens por página (opcional, padrão: 10, máximo: 100)
 * @query   search: termo de busca (opcional)
 * @query   department: filtrar por departamento (opcional)
 * @query   status: filtrar por status (opcional)
 * @query   managerId: filtrar por ID do gerente (opcional)
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await getTeams(req);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/teams/:id
 * @desc    Obter uma equipe por ID
 * @access  Autenticado
 * @params  id: ID da equipe
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await getTeamById(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/teams
 * @desc    Criar uma nova equipe
 * @access  Admin, Manager
 * @body    { name, description, managerId, department, status, memberIds }
 */
router.post('/', authorize(['ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const result = await createTeam(req);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/teams/:id
 * @desc    Atualizar uma equipe
 * @access  Admin, Gerente da equipe
 * @params  id: ID da equipe
 * @body    { name, description, managerId, department, status, memberIds }
 */
router.put('/:id', async (req, res, next) => {
  try {
    const result = await updateTeam(req.params.id, req);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/teams/:id
 * @desc    Excluir uma equipe
 * @access  Admin, Gerente da equipe
 * @params  id: ID da equipe
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteTeam(req.params.id, req);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/teams/:id/members
 * @desc    Adicionar membros a uma equipe
 * @access  Admin, Gerente da equipe
 * @params  id: ID da equipe
 * @body    { memberIds: string[] }
 */
router.post('/:id/members', async (req, res, next) => {
  try {
    const result = await addTeamMembers(req.params.id, req);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/teams/:id/members
 * @desc    Remover membros de uma equipe
 * @access  Admin, Gerente da equipe
 * @params  id: ID da equipe
 * @body    { memberIds: string[] }
 */
router.delete('/:id/members', async (req, res, next) => {
  try {
    const result = await removeTeamMembers(req.params.id, req);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
