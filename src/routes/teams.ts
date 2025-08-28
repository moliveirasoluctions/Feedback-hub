import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/teams
router.get('/', async (_req, res) => {
  try {
    const teams = await prisma.team.findMany({ include: { members: true, manager: true } });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// POST /api/teams
router.post('/', async (req, res) => {
  const { name, managerId, memberIds } = req.body;
  try {
    const newTeam = await prisma.team.create({
      data: {
        name,
        manager: { connect: { id: managerId } },
        members: { connect: memberIds.map((id: string) => ({ id })) },
      },
      include: { members: true, manager: true },
    });
    res.status(201).json(newTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// PUT /api/teams/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, managerId, memberIds } = req.body;
  try {
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        name,
        manager: managerId ? { connect: { id: managerId } } : undefined,
        members: memberIds ? { set: memberIds.map((id: string) => ({ id })) } : undefined,
      },
      include: { members: true, manager: true },
    });
    res.json(updatedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// DELETE /api/teams/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.team.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

export { router as teamRoutes };
