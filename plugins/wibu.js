let wibu = require('../lib/wibu')
let fetch = require('node-fetch')
     let handler = async (m, {conn, text}) => {
if (!text) throw 'Masukkan nama animenya kak :*'
let onii_chan = await wibu(text)
if (onii_chan.length == 0) throw `Anime ${text}\nTidak Ditemukan!`
for (let i of onii_chan) {
let kaption = `*${i.judul}*\n\n_${i.desc}_\n\n Genre : ${i.genre}\nRating : ${i.rating}\n\n${i.link}`
conn.sendFile(m.chat, await buffer(i.thumbnail), '',kaption, m)
}
}
handler.help = ['anime <query>']
handler.tags = ['internet']
handler.command = /^(anime)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler

async function buffer(linkku) {
let f = await fetch(linkku)
let ff = await f.buffer()
return ff
}