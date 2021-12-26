let { getVideo, getLatest } = require('../lib/nekopoi')
let handler = async (m, { text }) => {
 let latest = await getLatest()
 let { title, links } = await getVideo(latest.link)
 if (links.length == 0) throw 'Video Tidak Ditemukan!'
 teksnya = `*[NEKOPOI LATEST]*\n\nTitle : ${title}\n\n${links.join('\n')}`
// m.reply(teksnya.trim())
 conn.sendFile(m.chat, latest.image, 'nekopoi.jpeg', teksnya.trim(), m)
}
handler.help = ['nekolatest', 'nekopoilatest']
handler.tags = ['sange']
handler.command = /^nekolatest|nekopoilatest$/i
handler.owner = false
handler.mods = false
handler.premium = true
handler.group = false
handler.private = false
handler.nsfw = true

handler.limit = true
handler.admin = false
handler.botAdmin = false

handler.fail = null


module.exports = handler
