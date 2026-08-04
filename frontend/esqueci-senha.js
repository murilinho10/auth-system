const formEsqueciSenha = document.getElementById('formEsqueciSenha');
const mensagemDiv = document.getElementById('mensagem');

formEsqueciSenha.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const email = document.getElementById('email').value.trim();

  const botao = formEsqueciSenha.querySelector('button');
  botao.disabled = true;
  botao.textContent = 'Enviando...';
  mensagemDiv.textContent = '';
  mensagemDiv.className = 'mensagem';

  try {
    const resposta = await fetch(`${API_URL}/auth/esqueci-senha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const dados = await resposta.json();

    // Sempre mostra mensagem de sucesso (mesmo se o email não existir) — segurança
    mensagemDiv.textContent = dados.mensagem || 'Se este email existir, você receberá um link.';
    mensagemDiv.classList.add('sucesso');
    formEsqueciSenha.reset();

  } catch (erro) {
    mensagemDiv.textContent = 'Não foi possível conectar ao servidor.';
    mensagemDiv.classList.add('erro');
  } finally {
    botao.disabled = false;
    botao.textContent = 'Enviar link';
  }
});
