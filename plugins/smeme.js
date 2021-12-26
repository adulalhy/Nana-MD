const uploadImage = require('../lib/uploadImage') 
const { webp2png } = require('../lib/webp2mp4')
const { sticker } = require('../lib/sticker')

let handler = async (m, { conn, text }) => {
//  let [teks, teks2] = text.split('|')
 let url 
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) throw 'Reply image dengan caption *#smim teks*'
  if (!/image\/(jpe?g|png|webp)/.test(mime)) throw `Mime ${mime} tidak support`
try {
 m.reply('Mohon tunggu sebentar~')
  if (/image\/(webp)/.test(mime)) {
   url = await webp2png(await q.download())
  } else {
   img = await q.download()
  url = await uploadImage(img)
  }
  let wasted = `https://api.memegen.link/images/custom/_/${text.replace('', '_').replace('\n','%5Cn').replace('?', '~q').replace('%', '~p').replace('#', '~h').replace('/', '~s')}.png?background=${url}`
  let stiker = await sticker(null, wasted, packname, author)
  conn.sendMessage(m.chat, { sticker: url: stiker }, {
    quoted: m
  })
 } catch (e) {
   m.reply('Error || Mungkin kesalahan pada sistem!!')
  }
}
handler.help = ['smim']
handler.tags = ['sticker']
handler.command = /^smim$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler