// controllers/OcurrenceController.js
const express = require('express');
const router = express.Router();
const OcurrenceService = require('../service/OcurrenceService');
const MarkerService = require('../service/MarkerService');

router.post('/', async (req, res) => {
    try {
        const { description, occurrence_type, latitude, longitude } = req.body;

        console.log('Dados recebidos no backend', req.body);

        // Validações
        if (!description || !occurrence_type || !latitude || !longitude) {
            return res.status(400).json({
                message: 'Todos os campos são obrigatórios: descrição, tipo, latitude e longitude',
            });
        }

        const ocurrenceData = {
            description,
            occurrence_type,
            latitude,
            longitude,
            date_time: new Date(),
            status: 'ativo',
        };

        const ocurrence = await OcurrenceService.createOcurrence(ocurrenceData);

        console.log('Ocurrence criada:', ocurrence);

        if (!ocurrence || !ocurrence._id) {
            throw new Error('Erro ao criar ocurrence');
        }

        // Criar marcador associado à ocurrence
        const markerData = {
            ocurrenceId: ocurrence._id,
            latitude,
            longitude,
            description,
        };

        const marker = await MarkerService.createMarker(markerData);
        if (!marker){
            await OcurrenceService.deleteOcurrence(ocurrence._id); // Reverte a ocorrência caso falhe
            return res.status(500).json({ message: 'Erro ao criar marcador.' });
        }

        console.log('Marcador criado:', marker);

        if (!marker){
            {
                await OcurrenceService.deleteOcurrence(ocurrence._id); // Reversão no caso de falha
                return res.status(500).json({ message: 'Erro ao criar marcador.' });
            }
        }

        console.log("Marcador criado", marker);

        res.status(201).json({ ocurrence, marker });
    } catch (error) {
        console.error('Erro ao criar ocurrence e marcador:', error);
        res.status(500).json({
            message: 'Erro interno ao criar ocurrence',
            error: error.message,
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const ocurrences = await OcurrenceService.getAllOcurrences();
        res.status(200).json(ocurrences);
    } catch (error) {
        console.error('Erro ao buscar ocurrences:', error);
        res.status(500).json({
            message: 'Erro interno ao buscar ocurrences',
            error: error.message,
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const ocurrence = await OcurrenceService.getOcurrenceById(req.params.id);
        if (!ocurrence) {
            return res.status(404).json({ message: 'Ocurrence não encontrada' });
        }
        res.status(200).json(ocurrence);
    } catch (error) {
        console.error('Erro ao buscar ocurrence:', error);
        res.status(500).json({
            message: 'Erro interno ao buscar ocurrence',
            error: error.message,
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { description, occurrence_type, latitude, longitude, status } = req.body;

        // Validações
        if (!description || !occurrence_type || !latitude || !longitude || !status) {
            return res.status(400).json({
                message: 'Todos os campos são obrigatórios: descrição, tipo, latitude, longitude e status',
            });
        }

        const ocurrenceData = {
            description,
            occurrence_type,
            latitude,
            longitude,
            status,
        };

        const ocurrence = await OcurrenceService.updateOcurrence(req.params.id, ocurrenceData);
        if (!ocurrence) {
            return res.status(404).json({ message: 'Ocurrence não encontrada' });
        }
        res.status(200).json(ocurrence);
    } catch (error) {
        console.error('Erro ao atualizar ocurrence:', error);
        res.status(500).json({
            message: 'Erro interno ao atualizar ocurrence',
            error: error.message,
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const ocurrence = await OcurrenceService.deleteOcurrence(req.params.id);
        if (!ocurrence) {
            return res.status(404).json({ message: 'Ocurrence não encontrada' });
        }
        res.status(200).json({ message: 'Ocurrence deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar ocurrence:', error);
        res.status(500).json({
            message: 'Erro interno ao deletar ocurrence',
            error: error.message,
        });
    }
});

module.exports = router;
