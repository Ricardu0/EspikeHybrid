// controllers/MarkerController.js
const express = require('express');
const router = express.Router();
const MarkerService = require('../service/MarkerService');

router.post('/', async (req, res) => {
    try {
        const { occurrenceId, latitude, longitude, description } = req.body;

        // Validações
        if (!occurrenceId || !latitude || !longitude || !description) {
            return res.status(400).json({
                message: 'Todos os campos são obrigatórios: occurrenceId, latitude, longitude e descrição',
            });
        }

        const markerData = {
            occurrenceId,
            latitude,
            longitude,
            description,
        };

        const marker = await MarkerService.createMarker(markerData);
        res.status(201).json(marker);
    } catch (error) {
        console.error('Erro ao criar marcador:', error);
        res.status(500).json({
            message: 'Erro interno ao criar marcador',
            error: error.message,
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const markers = await MarkerService.getAllMarkers();
        res.status(200).json(markers);
    } catch (error) {
        console.error('Erro ao buscar marcadores:', error);
        res.status(500).json({
            message: 'Erro interno ao buscar marcadores',
            error: error.message,
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const marker = await MarkerService.getMarkerById(req.params.id);
        if (!marker) {
            return res.status(404).json({ message: 'Marcador não encontrado' });
        }
        res.status(200).json(marker);
    } catch (error) {
        console.log('erro', error);
        console.error('Erro ao buscar marcador:', error);
        res.status(500).json({
            message: 'Erro interno ao buscar marcador',
            error: error.message,
        });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const { latitude, longitude, description } = req.body;

        // Validações
        if (!latitude || !longitude || !description) {
            return res.status(400).json({
                message: 'Todos os campos são obrigatórios: latitude, longitude e descrição',
            });
        }

        const markerData = {
            latitude,
            longitude,
            description,
        };

        const marker = await MarkerService.updateMarker(req.params.id, markerData);
        if (!marker) {
            return res.status(404).json({ message: 'Marcador não encontrado' });
        }
        res.status(200).json(marker);
    } catch (error) {
        console.error('Erro ao atualizar marcador:', error);
        res.status(500).json({
            message: 'Erro interno ao atualizar marcador',
            error: error.message,
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const marker = await MarkerService.deleteMarker(req.params.id);
        if (!marker) {
            return res.status(404).json({ message: 'Marcador não encontrado' });
        }
        res.status(200).json({ message: 'Marcador deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar marcador:', error);
        res.status(500).json({
            message: 'Erro interno ao deletar marcador',
            error: error.message,
        });
    }
});




module.exports = router;
