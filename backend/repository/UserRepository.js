// repository/UserRepository.js
const User = require('../model/User');

class UserRepository {
    async create(userData) {
        try {
            const user = new User(userData);
            return await user.save();
        } catch (error) {
            if (error.code === 11000) {
                // Erro de duplicação (email ou CPF já existente)
                const field = Object.keys(error.keyPattern)[0];
                throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} já está em uso`);
            }
            throw error;
        }
    }

    async findByEmail(email) {
        return await User.findOne({ email });
    }

    async findAll() {
        return await User.find();
    }

    async findById(id) {
        return await User.findById(id);
    }

    async update(id, userData) {
        return await User.findByIdAndUpdate(id, userData, { new: true });
    }

    async deleteById(id) {
        return await User.findByIdAndDelete(id);
    }
}

module.exports = new UserRepository();
