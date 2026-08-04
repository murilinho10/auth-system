const rateLimit = require('express-rate-limit');

// Limita tentativas de login/cadastro para evitar brute-force
const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 tentativas por IP
  message: { erro: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Limita pedidos de recuperação de senha (mais restrito, evita spam de email)
const limiteRecuperacao = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 pedidos por IP por hora
  message: { erro: 'Muitos pedidos de recuperação. Tente novamente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Limite geral pra API toda
const limiteGeral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { erro: 'Muitas requisições. Tente novamente mais tarde.' }
});

module.exports = { limiteAuth, limiteRecuperacao, limiteGeral };
