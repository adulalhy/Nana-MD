let handler = async (m, { conn, usedPrefix, text }) => {
  if (!text) throw `Contoh Penggunaan\n${usedPrefix}map jakarta`
  m.reply('Mohon tunggu sebentar~')
  json = await require('axios').get(`https://mnazria.herokuapp.com/api/maps?search=${text}`)
  conn.sendMessage(m.chat, { image: url: json.data.gambar }, { quoted: m, caption: `Map : `+text })
}
handler.help = ['map']
handler.tags = ['tools']
handler.command = /^map$/i

module.exports = handler
