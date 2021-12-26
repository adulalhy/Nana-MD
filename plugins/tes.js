let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
if (m.key.fromMe) return 
if (m.isBaileys) return 
  if (m.mentionedJid.includes(conn.user.jid)) {
conn.sendFile(m.chat, './src/tag.webp', 'apsi tag tag', '', m)
conn.sendFile(m.chat, './src/tmp5.mp3', 'nana.mp3', '',m, ptt= true)
   } else if (m.text.toLowerCase() == 'p') {
    m.reply('Utamakan Salam Kak') 
   } else if (m.text.toLowerCase().includes('assalamualaikum')) {
     m.reply('Waalaikumsalam')
	 
	 } else if (m.text.toLowerCase() == 'nana') {
		 let nana = ['./src/tmp.mp3','./src/tmp1.mp3','./src/tmp2.mp3','./src/tmp3.mp3','./src/tmp4.mp3','./src/tmp5.mp3']
		 let rann = nana[Math.floor(Math.random() * nana.length)]
conn.sendFile(m.chat, rann, 'ran.mp3', '', m, ptt= true)
}
  return true
}

module.exports = handler
