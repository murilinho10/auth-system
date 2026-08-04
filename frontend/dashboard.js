const infoUsuario = document.getElementById('infoUsuario');
const botaoLogout = document.getElementById('botaoLogout');

// Ao carregar a página, verifica se o usuário está logado
async function carregarUsuario() {
  try {
    const resposta = await fetch(`${API_URL}/auth/eu`, {
      credentials: 'include'
    });

    if (!resposta.ok) {
      window.location.href = 'login.html';
      return;
    }

    const dados = await resposta.json();
    infoUsuario.textContent = `Logado como: ${dados.usuario.nome} (${dados.usuario.email})`;

  } catch (erro) {
    window.location.href = 'login.html';
  }
}

botaoLogout.addEventListener('click', async () => {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  window.location.href = 'login.html';
});

carregarUsuario();
