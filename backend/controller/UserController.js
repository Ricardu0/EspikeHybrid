const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Certifique-se de que este caminho está correto
const { authenticate } = require('../middleware/authenticate');
const UserService = require('../service/UserService');

// Atualizar usuário por email
router.put('/email/:email', async (req, res) => {
    const { email } = req.params;
    const userData = req.body;
    console.log('Email para atualização:', email);
    console.log('Dados recebidos para atualização:', userData);

    try {
        // Se a senha estiver presente, faça o hash e atualize
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
            console.log('Senha atualizada e criptografada.');
        }

        const updatedUser = await UserService.updateUserByEmail(email, userData);
        console.log('Usuário atualizado:', updatedUser);

        // Gera um novo token JWT se a senha foi atualizada
        let newToken;
        if (userData.password) {
            newToken = jwt.sign(
                { id: updatedUser._id, email: updatedUser.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            console.log('Novo token gerado:', newToken);
        }

        res.status(200).json({
            user: updatedUser,
            token: newToken
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(400).json({ message: error.message });
    }
});

// -------------------------------------------------------------------------------------


// Rota para deletar o usuário atual
router.delete('/me', authenticate, async (req, res) => {
    try {
        await userService.deleteCurrentUser(req.user);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para deletar um usuário por ID
router.delete('/users/:id', async (req, res) => {
    try {
        // Recebe o ID do usuário da URL
        const userId = req.params.id;

        // Chama a função de deletar usuário do userService
        const user = await userService.deleteUser(userId);

        // Se o usuário não for encontrado, retorna erro 404
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Se o usuário for deletado com sucesso, responde com uma mensagem de sucesso
        res.status(200).json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para deletar um usuário por email
// Rota para deletar um usuário por email
router.delete('/email/:email', authenticate, async (req, res) => {
    try {
        const { email } = req.params;

        // Verificar se o usuário existe
        const existingUser = await userService.getUserByEmail(email);
        if (!existingUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        await userService.deleteUserByEmail(email);
        res.status(200).json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({
            message: 'Erro ao deletar usuário',
            error: error.message
        });
    }
});
// Rota para obter o usuário atual
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await userService.getCurrentUser(req.user);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para adicionar um novo usuário
router.post('/', async (req, res) => {
    try {
        const user = await UserService.addUser(req.body);
        res.status(201).json({ message: 'User added successfully!', user });
    } catch (error) {
        console.error('Erro ao adicionar usuário no controlador:', error);

        if (error.message && error.message.includes('Já existe um usuário com esse email')) {
            return res.status(409).json({
                status: 'error',
                message: error.message
            });
        }

        res.status(500).json({ message: 'Ocorreu um erro ao adicionar o usuário.' + error });
    }
});

// Rota para obter um usuário por ID
router.get('/user/:id', async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para obter todos os usuários
router.get('/users', async (req, res) => {
    try {
        const users = await userService.getUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para atualizar um usuário por ID
router.put('/users/:id', authenticate, async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = req.body;

        // Verificar se o usuário existe
        const existingUser = await userService.getUserById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Se houver senha, faz o hash
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        const updatedUser = await userService.updateUser({ ...userData, _id: userId });

        // Remove a senha do objeto retornado
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.status(200).json(userResponse);
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
});

// Função para criar um novo usuário (se necessário)
const createUser = async (req, res) => {
    try {
        const user = await userService.addUser(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    user_type: user.user_type
                }
            }
        });
    } catch (error) {
        if (error.message.includes('já está em uso')) {
            return res.status(409).json({
                status: 'error',
                message: error.message
            });
        }
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Exportando o router e a função createUser
module.exports = {
    createUser,
    router
};
