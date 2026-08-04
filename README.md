# Auth System — Sistema de Autenticação Reutilizável

Sistema completo de autenticação: cadastro, login, recuperação de senha (via Resend) e logout.
JWT em cookie HttpOnly, senha com bcrypt, rate limiting, MongoDB Atlas.

## Stack
- **Backend:** Node.js + Express + MongoDB (Mongoose) + JWT + bcrypt + Resend
- **Frontend:** HTML/CSS/JS puro

## Estrutura
```
auth-system/
├── backend/
│   ├── models/Usuario.js
│   ├── routes/auth.js
│   ├── middleware/autenticar.js
│   ├── middleware/rateLimiters.js
│   ├── utils/email.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── cadastro.html / cadastro.js
    ├── login.html / login.js
    ├── esqueci-senha.html / esqueci-senha.js
    ├── redefinir-senha.html / redefinir-senha.js
    ├── dashboard.html / dashboard.js
    ├── style.css
    └── config.js
```

## Passo a passo — rodando local

### 1. Backend

```bash
cd backend
npm install
```

Copie `.env.example` para `.env`:
```bash
cp .env.example .env
```

Abra o `.env` e preencha:
- `MONGO_URI` — sua connection string do MongoDB Atlas (pode usar um cluster novo, ou reaproveitar `cluster0.pn4yhvc.mongodb.net` com um banco novo, ex: `authsystem`, pra não misturar com o MonetAI)
- `JWT_SECRET` — qualquer string aleatória longa. Gere uma com:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `RESEND_API_KEY` — pegue no dashboard da Resend (Settings → API Keys)
- `RESEND_FROM_EMAIL` — o email verificado no seu domínio na Resend (ex: `Auth System <onboarding@seudominio.com>`). Se ainda não verificou domínio, a Resend libera um domínio de teste tipo `onboarding@resend.dev` — só funciona enviando pro seu próprio email cadastrado na conta.
- `FRONTEND_URL` — `http://127.0.0.1:5500` se for usar Live Server

Rode o servidor:
```bash
npm start
```

Deve aparecer no terminal:
```
Conectado ao MongoDB
Servidor rodando na porta 3000
```

### 2. Frontend

Abra a pasta `frontend/` com o Live Server do VS Code (botão direito em `login.html` → "Open with Live Server").

Confirme que `config.js` está apontando pro backend certo:
```js
const API_URL = 'http://localhost:3000/api';
```

### 3. Teste o fluxo completo

1. Acesse `cadastro.html`, crie uma conta → deve redirecionar pro `dashboard.html`
2. Clique em "Sair" → volta pro login
3. Faça login com a mesma conta → deve voltar pro dashboard
4. Na tela de login, clique em "Esqueci minha senha" → digite o email → confira sua caixa de entrada
5. Clique no link do email → defina nova senha → faça login com a senha nova

## Deploy (mesmo padrão dos seus outros projetos)

- **Backend → Render:** configure as mesmas variáveis de ambiente do `.env` nas configurações do serviço no Render
- **Frontend → Vercel:** rode `vercel` e depois `vercel --prod`. Atualize `config.js` com a URL do backend em produção, e atualize `FRONTEND_URL` no Render com a URL da Vercel.

## Segurança já implementada
- Senhas nunca salvas em texto puro — sempre hash bcrypt (12 rounds)
- JWT em cookie HttpOnly (não acessível via JavaScript no navegador — protege contra XSS)
- Rate limiting: 10 tentativas/15min em login e cadastro, 3 pedidos/hora em recuperação de senha
- Token de recuperação de senha é hasheado no banco (SHA-256) e expira em 1 hora
- Resposta idêntica em "esqueci senha" mesmo se o email não existir (evita descobrir quais emails têm conta)
- Mensagem de erro genérica em login ("email ou senha inválidos") — não revela se o problema é o email ou a senha

## Próximos passos possíveis (não implementados ainda)
- Verificação de email no cadastro (confirmar que o email é real antes de liberar a conta)
- 2FA (autenticação de dois fatores)
- Refresh tokens (sessão mais longa sem precisar logar de novo toda semana)
