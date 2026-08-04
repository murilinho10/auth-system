const formCadastro = document.getElementById('formCadastro');
const mensagemDiv = document.getElementById('mensagem');

formCadastro.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  const botao = formCadastro.querySelector('button');
  botao.disabled = true;
  botao.textContent = 'Criando conta...';
  mensagemDiv.textContent = '';
  mensagemDiv.className = 'mensagem';

  try {
    const resposta = await fetch(`${API_URL}/auth/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // necessário para o cookie HttpOnly ser salvo
      body: JSON.stringify({ nome, email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagemDiv.textContent = dados.erro || 'Erro ao criar conta.';
      mensagemDiv.classList.add('erro');
      return;
    }

    mensagemDiv.textContent = 'Conta criada! Redirecionando...';
    mensagemDiv.classList.add('sucesso');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);

  } catch (erro) {
    mensagemDiv.textContent = 'Não foi possível conectar ao servidor.';
    mensagemDiv.classList.add('erro');
  } finally {
    botao.disabled = false;
    botao.textContent = 'Criar conta';
  }
});
