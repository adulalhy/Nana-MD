let fetch = require('nekos.life')
let nekos = new fetch()
let handler = async (m, { conn, text, command }) => {
if (!DATABASE.data.chats[m.chat].nsfw && m.isGroup) throw 'Feature Nsfw Disable\nType *!enable* *nsfw* to activate this feature'
  m.reply(`_*Tunggu permintaan anda sedang diproses...*_`)
  conn.sendMessage(m.chat, { image: url: await nekos.nsfw.trap() }, { quoted: m, caption: 'Huu sange sama kartun....' })
}
handler.command = /^(trap)$/i
handler.tags = ['sange']
handler.help = ['trap']
handler.owner = false
handler.mods = false
handler.premium = true
handler.group = false
handler.private = false
handler.nsfw = true

handler.limit = true
handler.admin = false
handler.botAdmin = false

handler.fail = null


module.exports = handler
