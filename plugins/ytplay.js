let limit = 30
let yts = require('yt-search')
let fetch = require('node-fetch')
const { servers, yta, ytv } = require('../lib/y2mate')
let handler = async (m, { conn, command, text, isPrems, isOwner }) => {
memeq = Math.floor(Math.random() * 99999999)
  if (!text) throw 'Cari apa?'
  let results = await yts(text)
  let vid = results.all.find(video => video.seconds < 3600)
  if (!vid) throw 'Video/Audio Tidak ditemukan'
  let isVideo = /2$/.test(command)
  let { dl_link, thumb, title, filesize, filesizeF} = await (isVideo ? ytv : yta)(vid.url, 'id4')
  let isLimit = (isPrems || isOwner ? 99 : limit) * 1024 < filesize
let buttons = [
  {buttonId: '/yta '+vid.url, buttonText: {displayText: 'Music 🎵'}, type: 1},
  {buttonId: '/ytv '+vid.url, buttonText: {displayText: 'Video 📼'}, type: 1},
{buttonId: '/delete '+vid.videoId+memeq, buttonText: {displayText: 'Delete 🗑️'}, type: 1}
]


const buttonsMessage = {
    image: {url: thumb},
    caption:`Lagu Ditemukan!
Silahkan Pilih Format Yang Mau Dikirim`.trim(),    footerText: 'Filesize : '+filesizeF,
    buttons: buttons,
	footer: 'Nana-MD',
     headerType: 4
}
let sendMsg =  await conn.sendMessage(m.chat, buttonsMessage)
}
handler.help = ['ytplay'].map(v => v + ' <pencarian>')
handler.tags = ['downloader']
handler.command = /^(youtube|yt)play$/i

handler.exp = 0
handler.limit = false
handler.premium = false
module.exports = handler

async function getBuffer(url) {
ff = await fetch(url)
fff = await ff.buffer()
return fff
}

async function bitly(urls) {
fet = require('axios')
heh = await fet.get(`https://tobz-api.herokuapp.com/api/bitly?url=${urls}&apikey=Tobzzz17`)

return heh.data.result
}