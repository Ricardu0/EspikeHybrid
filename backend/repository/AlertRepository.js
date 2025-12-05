const AlertRepository = require('../model/Alert');

// Encontrar todos os alertas
async function findAll() {
    try {
        return await AlertRepository.find();
    } catch (error) {
        console.error('Erro ao buscar alertas:', error);
        throw error;
    }
}

// Encontrar um alerta por ID
async function findById(id) {
    try {
        return await AlertRepository.findById(id);
    } catch (error) {
        console.error('Erro ao buscar alerta por ID:', error);
        throw error;
    }
}

// Criar um novo alerta
async function create(alertData) {
    try {
        const alert = new AlertRepository(alertData);
        return await alert.save();
    } catch (error) {
        console.error('Erro ao criar alerta:', error);
        throw error;
    }
}

// Atualizar um alerta
async function update(id, alertData) {
    try {
        return await AlertRepository.findByIdAndUpdate(id, alertData, { new: true });
    } catch (error) {
        console.error('Erro ao atualizar alerta:', error);
        throw error;
    }
}

// Deletar um alerta
async function deleteById(id) {
    try {
        return await AlertRepository.findByIdAndDelete(id);
    } catch (error) {
        console.error('Erro ao deletar alerta:', error);
        throw error;
    }
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteById
};
