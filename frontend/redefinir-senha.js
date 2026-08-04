const formRedefinirSenha = document.getElementById('formRedefinirSenha');
const mensagemDiv = document.getElementById('mensagem');

// Lê o token e o id do usuário direto da URL (vieram do link do email)
const parametros = new URLSearchParams(window.location.search);
const token = parametros.get('token');
const id = parametros.get('id');

if (!token || !id) {
  mensagemDiv.textContent = 'Link inválido. Solicite uma nova recuperação de senha.';
  mensagemDiv.classList.add('erro');
  formRedefinirSenha.style.display = 'none';
}

formRedefinirSenha.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const novaSenha = document.getElementById('novaSenha').value;
  const confirmarSenha = document.getElementById('confirmarSenha').value;

  mensagemDiv.textContent = '';
  mensagemDiv.className = 'mensagem';

  if (novaSenha !== confirmarSenha) {
    mensagemDiv.textContent = 'As senhas não coincidem.';
    mensagemDiv.classList.add('erro');
    return;
  }

  const botao = formRedefinirSenha.querySelector('button');
  botao.disabled = true;
  botao.textContent = 'Redefinindo...';

  try {
    const resposta = await fetch(`${API_URL}/auth/redefinir-senha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, token, novaSenha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagemDiv.textContent = dados.erro || 'Erro ao redefinir senha.';
      mensagemDiv.classList.add('erro');
      return;
    }

    mensagemDiv.textContent = 'Senha redefinida! Redirecionando para login...';
    mensagemDiv.classList.add('sucesso');

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);

  } catch (erro) {
    mensagemDiv.textContent = 'Não foi possível conectar ao servidor.';
    mensagemDiv.classList.add('erro');
  } finally {
    botao.disabled = false;
    botao.textContent = 'Redefinir senha';
  }
});
