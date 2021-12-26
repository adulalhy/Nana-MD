let handler = async(m, { conn, text, participants }) => {
     conn.sendMessage(m.chat, { text: text, mentions: participants.map(a => a.id) }, )
}
handler.help = ['hidetag <pesan>']
handler.tags = ['group']
handler.command = /^(hidetag)$/i

handler.group = true
handler.admin = true

module.exports = handler