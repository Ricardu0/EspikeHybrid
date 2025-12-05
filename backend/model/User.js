const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome é obrigatório']
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Telefone é obrigatório']
    },
    cpf: {
        type: String,
        required: [true, 'CPF é obrigatório'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: 8
    },
    user_type: {
        type: String,
        enum: ['user', 'mod'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;  // Corrigido para exportar apenas o modelo definido
