let handler = async (m, { conn, command, text }) => {
  const message = `Cazzo vuoi negr.`;
  // manda il messaggio nella chat dove il comando è stato usato, citandolo
  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

handler.help = ['blood'];
handler.tags = ['giochi'];
handler.command = /^blood$/i;

export default handler;
