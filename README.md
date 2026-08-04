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
