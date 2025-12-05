const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserService = require('../service/UserService');

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Tentativa de login:', { email }); // Log para debug

        if (!email || !password) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios' });
        }

        const user = await UserService.getUserByEmail(email);
        console.log('Usuário encontrado:', user ? 'Sim' : 'Não'); // Log para debug

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log('Senha válida:', isValidPassword ? 'Sim' : 'Não'); // Log para debug

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router;