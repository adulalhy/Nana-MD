const fetch = require('node-fetch')
const FormData = require('form-data')
const { sticker } = require('../lib/sticker')

let handler  = async (m, { conn, text }) => {
   await conn.sendFile(m.chat, global.API('xteam', '/videomaker/poly', { text }, 'APIKEY'), 'poly.mp4', '', m)
  if (!text) throw 'Teksnya.. mana sayang?'
}
handler.help = ['poly <teks>']
//handler.tags = ['creator']
handler.command = /^sleding$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler
