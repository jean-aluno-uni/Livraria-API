const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const repository = require('../repositories/LivrariaRepository');

class AuthService {
  async registrar({ nome, email, senha }) {
    if (!nome || !email || !senha) {
      throw { status: 400, message: "Campos obrigatórios ausentes: nome, email ou senha." };
    }

    const usuarioExistente = repository.buscarUsuarioPorEmail(email);
    if (usuarioExistente) {
      throw { status: 409, message: "E-mail já cadastrado no sistema." };
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const novoUsuario = repository.salvarUsuario({
      nome,
      email,
      senha_hash,
      role: "USER"
    });

    const { senha_hash: _, ...usuarioRetorno } = novoUsuario;
    return usuarioRetorno;
  }

  async login({ email, senha }) {
    if (!email || !senha) {
      throw { status: 400, message: "E-mail e senha são obrigatórios." };
    }

    const usuario = repository.buscarUsuarioPorEmail(email);
    if (!usuario) {
      throw { status: 401, message: "Credenciais inválidas." };
    }

    const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaConfere) {
      throw { status: 401, message: "Credenciais inválidas." };
    }

    const token = jwt.sign(
      { sub: usuario.id, nome: usuario.nome, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      usuario: { id: usuario.id, nome: usuario.nome, role: usuario.role },
      token
    };
  }
}

module.exports = new AuthService();
