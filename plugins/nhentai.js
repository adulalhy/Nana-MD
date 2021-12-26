let nanaAPI = require('nana-api')
let nana = new nanaAPI()
let handler = async (m, { usedPrefix, conn, args, text}) => {
  conn.nhentai = conn.nhentai ? conn.nhentai : {}
 if (!DATABASE.data.chats[m.chat].nsfw && m.isGroup) throw 'Feature Nsfw Disable\nType *!enable* *nsfw* to activate this feature'
 if (!text) throw 'Cari apa?'
 m.reply('Mohon tunggu sebentar~')
  let g = await nana.search(text)
  index = 0
  conn.nhentai[m.sender] = []
 let txt = `*── 「 NHENTAI 」 ──*\n\n➸ *Result for*: ${text}`
  for (let i = 0; i < g.results.length; i++) {
  index += 1
  let { id, title, language } = g.results[i]
  txt += `\n\n➸ *Title*: ${title}\n➸ *Index* : ${index}\n➸ *Language*: ${language ? language.charAt(0).toUpperCase() + language.slice(1) : ''}\n➸ *Link*: https://nhentai.net/g/${id}\n\n=_=_=_=_=_=_=_=_=_=_=_=_=`
  conn.nhentai[m.sender].push(id)
    }
  await conn.sendMessage(m.chat, { url: g.results[0].thumbnail.s }, `imageMessage`, { quoted: m, caption: txt })
   m.reply(`ketik *${usedPrefix + 'getdoujin'}* angka_index

  contoh :
  ${usedPrefix}getdoujin 1
  `.trim())                      
                   
}
handler.help = ['nhsearch', 'nhentaisearch'].map(v => v + ' <query>')
handler.tags = ['sange']
handler.command = /^(nh|nhentai)(search)$/i
handler.limit = 1
handler.owner = false
handler.mods = false
handler.premium = true
handler.group = false
handler.private = false
handler.nsfw = true

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler

async function getBuffer(url) {
k = await require('node-fetch')(url)
a = await k.buffer()
return a 
}
