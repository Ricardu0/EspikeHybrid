const express = require('express');
const router = express.Router();
const AlertService = require('../service/AlertService');
const { authenticate } = require('../middleware/authenticate');

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// GET - Buscar todos os alertas
router.get('/', async (req, res) => {
    try {
        const alerts = await AlertService.getAllAlerts();
        res.json(alerts);
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar alertas',
            error: error.message
        });
    }
});

// POST - Criar novo alerta
router.post('/', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('userId no controller:', userId); // Log do userId
        console.log('Dados no corpo da requisição:', req.body); // Log dos dados recebidos

        const alert = await AlertService.createAlert(req.body, userId);
        res.status(201).json(alert);
    } catch (error) {
        console.error('Erro ao criar alerta:', error.message);
        res.status(400).json({ message: 'Erro ao criar alerta', error: error.message });
    }
});


// GET - Buscar alertas próximos
router.get('/nearby', async (req, res) => {
    try {
        const { latitude, longitude, radius } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                message: 'Latitude e longitude são obrigatórios'
            });
        }

        const alerts = await AlertService.getNearbyAlerts(
            parseFloat(latitude),
            parseFloat(longitude),
            radius ? parseFloat(radius) : undefined
        );

        res.json(alerts);
    } catch (error) {
        res.status(500).json({
            message: 'Erro ao buscar alertas próximos',
            error: error.message
        });
    }
});

// PATCH - Atualizar status do alerta
router.patch('/:id/status', async (req, res) => {
    try {
        const alert = await AlertService.updateAlertStatus(
            req.params.id,
            req.user._id,
            req.body.status
        );
        res.json(alert);
    } catch (error) {
        res.status(400).json({
            message: 'Erro ao atualizar status do alerta',
            error: error.message
        });
    }
});

// DELETE - Deletar um alerta
router.delete('/:id', async (req, res) => {
    try {
        await AlertService.deleteAlert(req.params.id, req.user._id);
        res.json({ message: 'Alerta deletado com sucesso' });
    } catch (error) {
        res.status(400).json({
            message: 'Erro ao deletar alerta',
            error: error.message
        });
    }
});

module.exports = router;
