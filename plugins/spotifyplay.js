let yts = require('axios')
let dl = require('../lib/spotify')
let handler = async (m, { text, conn }) => {
  if (!text) throw 'Cari apa?'
  m.reply('Mohon tunggu sebentar~')
  let { data } = (await yts(`https://api.zeks.xyz/api/spotify?apikey=caliph_71&q=${encodeURIComponent(text)}`)).data
  if (!data[0]) throw `Query ${text} Tidak ditemukan!`
  res = data[0]
  caption = `~> Title : ${res.title}\n~> URL : ${await shorten(res.url)}\n~> Album : ${res.album}\n~> Artists : ${res.artists}\n~> Preview MP3 : ${await shorten(res.preview_mp3)}
  
  _Mohon tunggu sebentar, media sedang dikirim...._
  `.trim()
  conn.sendFile(m.chat, res.thumb,'',caption,m)
  sy = await dl(res.url)
  conn.sendFile(m.chat, sy.mp3, '','',m)
}
handler.help = ['spotifyplay', 'sp'].map(v => v + ' <pencarian>')
handler.tags = ['tools']
handler.premium = true
handler.command = /^(s|spotify)(p|play)$/i

module.exports = handler

async function shorten(url){
return (await require('axios').get(`https://is.gd/create.php?format=simple&url=${url}`)).data
}