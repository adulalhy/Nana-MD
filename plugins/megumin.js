let fetch = require('node-fetch')
let waifu = require('waifu.pics')
     let handler  = async (m, { conn, args }) => {
     kk = await require('waifu.pics').fetch('sfw/megumin')
   conn.sendFile(m.chat, kk.url, 'megumin.jpg', '', m, false)
}
handler.help = ['megumin']
handler.tags = ['wibu']
handler.command = /^megumin$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler