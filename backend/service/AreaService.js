const Area = require('../model/Area');
const AreaRating = require('../model/AreaRating');
const AreaReport = require('../model/AreaReport');
const AreaReportVote = require('../model/AreaReportVote');
const User = require('../model/User');

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

const addReportToArea = async (areaId, userId, comment) => {
    const area = await Area.findById(areaId);
    if (!area) {
        throw new Error('Área não encontrada');
    }
    const report = new AreaReport({
        area_id: areaId,
        user_id: userId,
        comment: comment
    });
    return await report.save();
};

const getReportsForArea = async (areaId, viewerUserId = null) => {
    const reports = await AreaReport.find({ area_id: areaId })
        .populate('user_id', 'name user_type moralScore')
        .sort({ createdAt: -1 })
        .lean(); // lean() para poder adicionar campos extras

    // Para cada relato, buscar a contagem de votos e o voto do viewer
    const enriched = await Promise.all(reports.map(async (report) => {
        const votes = await AreaReportVote.find({ report_id: report._id });
        const upvotes = votes.filter(v => v.isUpvote).length;
        const downvotes = votes.filter(v => !v.isUpvote).length;

        let myVote = null;
        if (viewerUserId) {
            const myVoteDoc = votes.find(v => v.voter_id.toString() === viewerUserId.toString());
            if (myVoteDoc) myVote = myVoteDoc.isUpvote ? 'up' : 'down';
        }

        return { ...report, upvotes, downvotes, myVote };
    }));

    return enriched;
};

const voteOnReport = async (reportId, voterId, isUpvote) => {
    const report = await AreaReport.findById(reportId);
    if (!report) throw new Error('Relato não encontrado');

    // Não pode votar no próprio relato
    if (report.user_id.toString() === voterId.toString()) {
        throw new Error('Você não pode votar no seu próprio relato');
    }

    // Buscar voto anterior (se existir)
    const existingVote = await AreaReportVote.findOne({ report_id: reportId, voter_id: voterId });

    let moralDelta = 0;

    if (existingVote) {
        if (existingVote.isUpvote === isUpvote) {
            // Clicou no mesmo voto → desfaz (toggle off)
            await AreaReportVote.deleteOne({ _id: existingVote._id });
            moralDelta = isUpvote ? -1 : +2; // desfaz o efeito anterior
        } else {
            // Mudou o voto (de up para down ou vice-versa)
            const oldEffect = existingVote.isUpvote ? +1 : -2;
            const newEffect = isUpvote ? +1 : -2;
            moralDelta = newEffect - oldEffect;
            existingVote.isUpvote = isUpvote;
            await existingVote.save();
        }
    } else {
        // Novo voto
        await AreaReportVote.create({ report_id: reportId, voter_id: voterId, isUpvote });
        moralDelta = isUpvote ? +1 : -2;
    }

    // Aplica o delta no moralScore do autor do relato (mínimo 0)
    if (moralDelta !== 0) {
        await User.findByIdAndUpdate(report.user_id, {
            $inc: { moralScore: moralDelta }
        });
        // Garante que não vai abaixo de 0
        await User.updateOne(
            { _id: report.user_id, moralScore: { $lt: 0 } },
            { $set: { moralScore: 0 } }
        );
    }

    // Retorna dados atualizados do relato
    const votes = await AreaReportVote.find({ report_id: reportId });
    const upvotes = votes.filter(v => v.isUpvote).length;
    const downvotes = votes.filter(v => !v.isUpvote).length;
    const myVoteDoc = votes.find(v => v.voter_id.toString() === voterId.toString());
    const myVote = myVoteDoc ? (myVoteDoc.isUpvote ? 'up' : 'down') : null;

    return { reportId, upvotes, downvotes, myVote };
};

module.exports = {
    createArea,
    getAllAreas,
    addRatingToArea,
    addReportToArea,
    getReportsForArea,
    voteOnReport,
};