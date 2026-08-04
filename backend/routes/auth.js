const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const router = express.Router();

const Usuario = require('../models/Usuario');
const autenticar = require('../middleware/autenticar');
const { limiteAuth, limiteRecuperacao } = require('../middleware/rateLimiters');
const { enviarEmailRecuperacao } = require('../utils/email');

const SALT_ROUNDS = 12;

// Valida força mínima da senha
function senhaEhForte(senha) {
  // mínimo 8 caracteres, pelo menos 1 letra e 1 número
  return typeof senha === 'string' && senha.length >= 8 && /[a-zA-Z]/.test(senha) && /[0-9]/.test(senha);
}

// Gera JWT e seta como cookie HttpOnly
function gerarTokenECookie(res, usuarioId) {
  const token = jwt.sign({ id: usuarioId }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS em produção
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
  });
}

// ---------- CADASTRO ----------
router.post('/cadastro', limiteAuth, async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    }

    if (!senhaEhForte(senha)) {
      return res.status(400).json({ erro: 'Senha deve ter no mínimo 8 caracteres, com letras e números.' });
    }

    const emailNormalizado = email.toLowerCase().trim();

    const usuarioExistente = await Usuario.findOne({ email: emailNormalizado });
    if (usuarioExistente) {
      return res.status(409).json({ erro: 'Já existe uma conta com este email.' });
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    const novoUsuario = await Usuario.create({
      nome: nome.trim(),
      email: emailNormalizado,
      senhaHash
    });

    gerarTokenECookie(res, novoUsuario._id);

    return res.status(201).json({
      mensagem: 'Conta criada com sucesso.',
      usuario: { id: novoUsuario._id, nome: novoUsuario.nome, email: novoUsuario.email }
    });
  } catch (erro) {
    console.error('Erro no cadastro:', erro);
    return res.status(500).json({ erro: 'Erro interno ao criar conta.' });
  }
});

// ---------- LOGIN ----------
router.post('/login', limiteAuth, async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const emailNormalizado = email.toLowerCase().trim();
    const usuario = await Usuario.findOne({ email: emailNormalizado });

    // Mensagem genérica de propósito — não revela se o email existe ou não
    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

    gerarTokenECookie(res, usuario._id);

    return res.json({
      mensagem: 'Login realizado com sucesso.',
      usuario: { id: usuario._id, nome: usuario.nome, email: usuario.email }
    });
  } catch (erro) {
    console.error('Erro no login:', erro);
    return res.status(500).json({ erro: 'Erro interno ao fazer login.' });
  }
});

// ---------- LOGOUT ----------
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ mensagem: 'Logout realizado.' });
});

// ---------- QUEM SOU EU (rota protegida de teste) ----------
router.get('/eu', autenticar, async (req, res) => {
  const usuario = await Usuario.findById(req.usuarioId).select('-senhaHash -resetSenhaToken');
  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }
  return res.json({ usuario });
});

// ---------- SOLICITAR RECUPERAÇÃO DE SENHA ----------
router.post('/esqueci-senha', limiteRecuperacao, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ erro: 'Email é obrigatório.' });
    }

    const emailNormalizado = email.toLowerCase().trim();
    const usuario = await Usuario.findOne({ email: emailNormalizado });

    // Sempre responde sucesso, mesmo se o email não existir — evita "enumeration attack"
    if (!usuario) {
      return res.json({ mensagem: 'Se este email existir em nossa base, você receberá um link de recuperação.' });
    }

    const tokenBruto = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(tokenBruto).digest('hex');

    usuario.resetSenhaToken = tokenHash;
    usuario.resetSenhaExpira = Date.now() + 60 * 60 * 1000; // 1 hora
    await usuario.save();

    const linkReset = `${process.env.RESET_LINK_BASE_URL}/redefinir-senha.html?token=${tokenBruto}&id=${usuario._id}`;

    await enviarEmailRecuperacao(usuario.email, usuario.nome, linkReset);

    return res.json({ mensagem: 'Se este email existir em nossa base, você receberá um link de recuperação.' });
  } catch (erro) {
    console.error('Erro ao solicitar recuperação:', erro);
    return res.status(500).json({ erro: 'Erro interno ao processar solicitação.' });
  }
});

// ---------- REDEFINIR SENHA ----------
router.post('/redefinir-senha', limiteAuth, async (req, res) => {
  try {
    const { id, token, novaSenha } = req.body;

    if (!id || !token || !novaSenha) {
      return res.status(400).json({ erro: 'Dados incompletos.' });
    }

    if (!senhaEhForte(novaSenha)) {
      return res.status(400).json({ erro: 'Senha deve ter no mínimo 8 caracteres, com letras e números.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const usuario = await Usuario.findOne({
      _id: id,
      resetSenhaToken: tokenHash,
      resetSenhaExpira: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({ erro: 'Link inválido ou expirado. Solicite um novo.' });
    }

    usuario.senhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);
    usuario.resetSenhaToken = null;
    usuario.resetSenhaExpira = null;
    await usuario.save();

    return res.json({ mensagem: 'Senha redefinida com sucesso. Faça login com a nova senha.' });
  } catch (erro) {
    console.error('Erro ao redefinir senha:', erro);
    return res.status(500).json({ erro: 'Erro interno ao redefinir senha.' });
  }
});

module.exports = router;
