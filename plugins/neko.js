let fetch = require('node-fetch')
     let handler  = async (m, { conn, args }) => {
    heum = await fetch(`https://recoders-area.caliph.repl.co/api/neko`)
    json = await heum.buffer()
   conn.sendMessage(m.chat, json, 'imageMessage', { quoted: m, caption: 'Nekonya kak' })
}
handler.help = ['neko']
handler.tags = ['wibu']
handler.command = /^neko$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler