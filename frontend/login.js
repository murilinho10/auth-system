const formLogin = document.getElementById('formLogin');
const mensagemDiv = document.getElementById('mensagem');

formLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  const botao = formLogin.querySelector('button');
  botao.disabled = true;
  botao.textContent = 'Entrando...';
  mensagemDiv.textContent = '';
  mensagemDiv.className = 'mensagem';

  try {
    const resposta = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagemDiv.textContent = dados.erro || 'Erro ao entrar.';
      mensagemDiv.classList.add('erro');
      return;
    }

    mensagemDiv.textContent = 'Login realizado! Redirecionando...';
    mensagemDiv.classList.add('sucesso');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 800);

  } catch (erro) {
    mensagemDiv.textContent = 'Não foi possível conectar ao servidor.';
    mensagemDiv.classList.add('erro');
  } finally {
    botao.disabled = false;
    botao.textContent = 'Entrar';
  }
});
