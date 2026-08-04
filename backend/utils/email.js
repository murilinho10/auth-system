const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function enviarEmailRecuperacao(destinatario, nome, linkReset) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL, // ex: 'Auth System <onboarding@seudominio.com>'
      to: destinatario,
      subject: 'Recuperação de senha',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2>Olá, ${nome}</h2>
          <p>Recebemos uma solicitação para redefinir sua senha.</p>
          <p>Clique no botão abaixo para criar uma nova senha. Este link expira em 1 hora.</p>
          <a href="${linkReset}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Redefinir senha
          </a>
          <p>Se você não solicitou isso, ignore este email — sua senha continuará a mesma.</p>
          <p style="color: #888; font-size: 12px; margin-top: 24px;">Se o botão não funcionar, copie e cole este link no navegador:<br>${linkReset}</p>
        </div>
      `
    });
    return true;
  } catch (erro) {
    console.error('Erro ao enviar email:', erro);
    return false;
  }
}

module.exports = { enviarEmailRecuperacao };
