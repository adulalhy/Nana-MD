let handler = async (m, { conn, args }) => {
  if (!args[0]) throw 'Uhm...url nya mana?'
m.reply('Downloading....')
  let { mp3, name, artists, album_name, release_date, cover_url } = await require('../lib/spotify')(args[0]).catch(() => m.reply('Error, Mungkin Linknya Gavalid'))
  conn.sendFile(m.chat, await getBuffer(cover_url), '',`*Title* : ${name}\n*Artist* : ${artists}\n*Release* : ${release_date}\n*Album* : ${album_name}`, m)
  conn.sendFile(m.chat, mp3, '','',m)
}
handler.help = ['spotify'].map(v => v + ' <url>')
handler.tags = ['downloader']
handler.command = /^(spotify(dl)?)$/i

module.exports = handler

async function getBuffer(url) {
h = await require('node-fetch')(url)
j = await h.buffer()
return j 
}