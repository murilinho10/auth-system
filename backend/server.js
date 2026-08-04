require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const { limiteGeral } = require('./middleware/rateLimiters');

const app = express();

// Necessário no Render/Vercel pra rate-limit funcionar corretamente com X-Forwarded-For
app.set('trust proxy', 1);

// Middlewares base
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true // necessário pra cookies HttpOnly funcionarem cross-origin
}));
app.use(limiteGeral);

// Rotas
app.use('/api/auth', authRoutes);

// Rota de saúde (útil pra checar se o backend está no ar)
app.get('/api/saude', (req, res) => {
  res.json({ status: 'ok' });
});

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((erro) => console.error('Erro ao conectar ao MongoDB:', erro));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
