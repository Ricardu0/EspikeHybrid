const jwt = require('jsonwebtoken');
const User = require('../model/User');

const isAdmin = async (req, res, next) => {
    try {
        // Primeira verificação: o user_type pode já estar no token (JWT atualizado)
        if (req.user && (req.user.user_type === 'admin' || req.user.user_type === 'mod')) {
            return next();
        }

        // Fallback: se o token não tem user_type (token antigo), busca no banco pelo _id
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(403).json({ error: 'Acesso negado. Usuário não identificado.' });
        }

        const userFromDb = await User.findById(userId).select('user_type');
        if (!userFromDb) {
            return res.status(403).json({ error: 'Acesso negado. Usuário não encontrado.' });
        }

        if (userFromDb.user_type === 'admin' || userFromDb.user_type === 'mod') {
            // Atualiza req.user com o tipo correto do banco
            req.user.user_type = userFromDb.user_type;
            return next();
        }

        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    } catch (err) {
        console.error('[isAdmin] Erro:', err.message);
        return res.status(500).json({ error: 'Erro interno ao verificar permissões.' });
    }
};

module.exports = { isAdmin };
