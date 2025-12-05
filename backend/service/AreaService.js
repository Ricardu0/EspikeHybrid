// service/AreaService.js
const Area = require('../model/Area');
const AreaRating = require('../model/AreaRating');

/**
 * Cria uma nova área (zona)
 */
const createArea = async (areaData) => {
    // areaData = { name, coordinates }
    const area = new Area({
        name: areaData.name,
        coordinates: areaData.coordinates,
    });
    return await area.save();
};

/**
 * Busca todas as áreas (com suas médias de avaliação)
 */
const getAllAreas = async () => {
    // Retorna todas as áreas. O campo 'ratings' já contém as médias.
    return await Area.find();
};

/**
 * Adiciona uma nova avaliação a uma área e recalcula a média
 */
const addRatingToArea = async (areaId, userId, ratingData) => {
    // ratingData = { overall, risk, lighting, infrastructure, policing, comments }

    // Etapa 1: Verificar se a Área existe
    const area = await Area.findById(areaId);
    if (!area) {
        throw new Error('Área não encontrada');
    }

    // Etapa 2: Criar ou atualizar a avaliação individual
    // Usamos 'upsert' para que o usuário possa atualizar sua avaliação
    const newRating = await AreaRating.findOneAndUpdate(
        { areaId: areaId, userId: userId }, // Critério de busca
        { ...ratingData, areaId: areaId, userId: userId }, // Novos dados
        { new: true, upsert: true } // Opções: retorna o novo doc, cria se não existir
    );

    // Etapa 3: Recalcular as médias
    // Buscar *todas* as avaliações para esta área
    const allRatings = await AreaRating.find({ areaId: areaId });
    
    const newCount = allRatings.length;
    const sumRatings = { overall: 0, risk: 0, lighting: 0, infrastructure: 0, policing: 0 };

    for (const rating of allRatings) {
        sumRatings.overall += rating.overall;
        sumRatings.risk += rating.risk;
        sumRatings.lighting += rating.lighting;
        sumRatings.infrastructure += rating.infrastructure;
        sumRatings.policing += rating.policing;
    }

    const newAverages = {
        overall: newCount > 0 ? sumRatings.overall / newCount : 0,
        risk: newCount > 0 ? sumRatings.risk / newCount : 0,
        lighting: newCount > 0 ? sumRatings.lighting / newCount : 0,
        infrastructure: newCount > 0 ? sumRatings.infrastructure / newCount : 0,
        policing: newCount > 0 ? sumRatings.policing / newCount : 0,
    };
    
    // Etapa 4: Atualizar a Área principal com as novas médias
    area.ratings = newAverages;
    area.ratingCount = newCount;
    
    return await area.save();
};

module.exports = {
    createArea,
    getAllAreas,
    addRatingToArea
};