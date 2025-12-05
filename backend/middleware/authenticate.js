const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error("Token ausente ou com formato inválido");
            return res.status(401).json({ message: 'Acesso negado: Token ausente ou inválido' });
        }

        const token = authHeader.replace('Bearer ', '');
        console.log("Token recebido:", token); // Log do token recebido

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token verificado:", verified); // Log do token verificado completo

        // Garante que _id seja passado corretamente
        req.user = {
            _id: verified._id || verified.id,  // Tenta _id primeiro, depois id
            ...verified  // Mantém outras informações do token
        };

        console.log("Usuário no middleware:", req.user); // Log do usuário que será passado

        next();
    } catch (error) {
        console.error("Erro ao verificar token:", error.message);
        // Trata erros de verificação de token

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Token inválido' });
        } else {
            return res.status(500).json({ message: 'Erro interno no servidor' });
        }
    }
};

module.exports = { authenticate };