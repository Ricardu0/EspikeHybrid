const UserRepository = require('../repository/UserRepository');
const User = require('../model/User');

const addUser = async (userData) => {
    try {
        // Remover espaços em branco e caracteres especiais do CPF e telefone
        userData.cpf = userData.cpf.replace(/[^\d]/g, '');
        userData.phone = userData.phone.replace(/[^\d]/g, '');

        // Verifica se o e-mail já está em uso
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error('Já existe um usuário com esse email.'); // Esta mensagem será capturada no controlador
        }

        // Criar e salvar o novo usuário
        const user = new User(userData);
        return await user.save();
    } catch (error) {
        console.error('Erro ao adicionar usuário:', error);
        throw error; // Repropaga o erro para o controlador
    }
};

// As demais funções do UserService permanecem inalteradas
const getUserById = async (id) => {
    return await User.findById(id);
};

const getUsers = async () => {
    return await User.find();
};

const deleteUser = async (id) => {
    return await User.findByIdAndDelete(id);
};

const updateUserByEmail = async (email, userData) => {
    try {
        // Remover o campo _id se estiver presente
        if (userData._id) {
            delete userData._id;
        }

        console.log('Atualizando usuário com email:', email);
        console.log('Dados recebidos para atualização:', userData);

        const updatedUser = await User.findOneAndUpdate({email}, userData, {new: true});
        if (!updatedUser) throw new Error('Usuário não encontrado');

        console.log('Usuário atualizado:', updatedUser);
        return updatedUser;
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        throw error;
    }
};


const getUserByEmail = async (email) => {
    try {
        const user = await User.findOne({email});
        return user;
    } catch (error) {
        console.error('Erro ao buscar usuário por email:', error);
        throw error;
    }
};
// Atualizar este método no userService.js do backend
const deleteUserByEmail = async (email) => {
    try {
        const user = await User.findOneAndDelete({ email });
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return true;
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        throw error;
    }
};

module.exports = {
    addUser,
    getUserById,
    getUsers,
    deleteUser,
    updateUserByEmail,
    getUserByEmail,
    deleteUserByEmail,
};
