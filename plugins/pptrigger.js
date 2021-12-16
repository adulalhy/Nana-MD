
const Canvacord = require('canvacord')
const uploadImage = require('../lib/uploadImage') 
const { sticker } = require('../lib/sticker')

let handler = async (m, { conn, text }) => {
   if (!text && m.mentionedJid.length == 0) return m.reply('Tag member kak, contoh *#pptrigger @member*')
try {
linknya = await conn.profilePictureUrl(m.mentionedJid[0])
baper = await require('node-fetch')(linknya).then(v => v.buffer())
let image = baper

Canvacord.Canvas.trigger(image)
  .then(async buffer => {
stik = await require('../lib/sticker').sticker(buffer, null, packname, author); conn.sendFile(m.chat, stik, '','',m)
  }) 
 } catch (e) {
   m.reply('Error || Mungkin karena foto profil orang tersebut private/depresi')
//m.reply(`${e}`)
  }
}
handler.help = ['pptrigger (@tag)']
handler.tags = ['tools']
handler.command = /^pptrigger$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = true
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler