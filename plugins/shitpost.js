let fetch = require('node-fetch')
let handler = async (m, { conn, args }) => {
m.reply('wait...')
apus = global.API('xteam', '/shitpost', {}, 'APIKEY')
conn.sendFile(m.chat, await fetch(apus).then(v => v.buffer()), '','SITPROTNYAAAAAAAA', m)
}
handler.help = ['shitpost']
handler.tags = ['fun']

handler.command = /^(shitpost)$/i

module.exports = handler