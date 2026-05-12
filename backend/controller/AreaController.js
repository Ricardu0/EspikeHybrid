// controller/AreaController.js
const express = require('express');
const router = express.Router();
const AreaService = require('../service/AreaService');
const { authenticate } = require('../middleware/authenticate');
const { isAdmin } = require('../middleware/isAdmin');

/**
 * GET /api/areas
 * Busca todas as áreas cadastradas (para mostrar no mapa).
 * Esta rota é pública.
 */
router.get('/', async (req, res) => {
    try {
        const areas = await AreaService.getAllAreas();
        res.status(200).json(areas);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar áreas', error: error.message });
    }
});

/**
 * POST /api/areas
 * Cria uma nova área (zona). Requer autenticação.
 * Cria uma nova área (zona). Requer autenticação e ser admin/mod.
 */
router.post('/', authenticate, isAdmin, async (req, res) => {
    try {
        const { name, coordinates } = req.body;
        if (!name || !coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
            return res.status(400).json({ message: 'Nome e coordenadas (mínimo 3 pontos) são obrigatórios' });
        }

        const newArea = await AreaService.createArea({ name, coordinates });
        res.status(201).json(newArea);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar área', error: error.message });
    }
});

/**
 * POST /api/areas/:id/rate
 * Adiciona ou atualiza uma avaliação para uma área específica. Requer autenticação.
 */
router.post('/:id/rate', authenticate, async (req, res) => {
    try {
        const areaId = req.params.id;
        
        // Assumindo que o middleware 'authenticate' adiciona o usuário em 'req.user'
        if (!req.user || !req.user.id) {
             return res.status(401).json({ message: 'Usuário não autenticado ou ID não encontrado no token' });
        }
        const userId = req.user.id; 
        
        const { overall, risk, lighting, infrastructure, policing, comments } = req.body;

        // Validação básica
        if (overall === undefined || risk === undefined || lighting === undefined || infrastructure === undefined || policing === undefined) {
            return res.status(400).json({ message: 'Todos os campos de avaliação (overall, risk, etc.) são obrigatórios' });
        }
        
        const ratingData = { overall, risk, lighting, infrastructure, policing, comments };

        // Service cuida de toda a lógica (salvar avaliação, calcular média, atualizar área)
        const updatedArea = await AreaService.addRatingToArea(areaId, userId, ratingData);

        res.status(200).json(updatedArea); // Retorna a área atualizada com a nova média

    } catch (error) {
         console.error('Erro ao avaliar área:', error);
        res.status(500).json({ message: 'Erro ao registrar avaliação', error: error.message });
    }
});

/**
 * GET /api/areas/:id/reports
 * Busca todos os relatos de uma área.
 */
router.get('/:id/reports', authenticate, async (req, res) => {
    try {
        const viewerUserId = req.user?.id || req.user?._id || null;
        const reports = await AreaService.getReportsForArea(req.params.id, viewerUserId);
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar relatos', error: error.message });
    }
});

/**
 * POST /api/areas/:id/reports
 * Adiciona um relato a uma área específica. Requer autenticação.
 */
router.post('/:id/reports', authenticate, async (req, res) => {
    try {
        const areaId = req.params.id;
        
        if (!req.user || !req.user.id) {
             return res.status(401).json({ message: 'Usuário não autenticado ou ID não encontrado no token' });
        }
        const userId = req.user.id; 
        
        const { comment } = req.body;

        if (!comment) {
            return res.status(400).json({ message: 'O comentário é obrigatório' });
        }
        
        const newReport = await AreaService.addReportToArea(areaId, userId, comment);
        res.status(201).json(newReport);
    } catch (error) {
        console.error('Erro ao adicionar relato:', error);
        res.status(500).json({ message: 'Erro ao adicionar relato', error: error.message });
    }
});

/**
 * POST /api/areas/:id/reports/:reportId/vote
 * Upvota ou downvota um relato.
 */
router.post('/:id/reports/:reportId/vote', authenticate, async (req, res) => {
    try {
        const voterId = req.user?.id || req.user?._id;
        if (!voterId) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        const { isUpvote } = req.body;
        if (typeof isUpvote !== 'boolean') {
            return res.status(400).json({ message: 'isUpvote deve ser um booleano' });
        }

        const result = await AreaService.voteOnReport(req.params.reportId, voterId, isUpvote);
        res.status(200).json(result);
    } catch (error) {
        console.error('Erro ao votar no relato:', error);
        if (error.message.includes('próprio relato')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro ao registrar voto', error: error.message });
    }
});

module.exports = router;