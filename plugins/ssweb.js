let fetch = require('node-fetch')
let { promisify } = require('util')
let porn = require('is-porn')

let handler = async (m, { conn, command, args }) => {
  let full = /f$/i.test(command)
  let isHP = /hp$/i.test(command)
  if (!args[0]) return conn.reply(m.chat, 'Tidak ada url', m)
  let url = /https?:\/\//.test(args[0]) ? args[0] : 'https://' + args[0]
  
 let { host } = new URL(url)

isNsfw = await promisify(porn)(host)

if (isNsfw) throw 'Content Blocked!'
 if (isHP) return conn.sendMessage(m.chat, await require('../lib/sshp')(url), 'imageMessage', { quoted: m, caption: 'Sukses...\nType : Handphone' })
 conn.sendMessage(m.chat, await require('../lib/ssweb')(url, full), 'imageMessage', { quoted: m, caption: 'Sukses...\nType : Desktop' })
}
handler.help = ['ss', 'ssf', 'sshp'].map(v => v + ' <url>')
handler.tags = ['internet']
handler.command = /^ss(web)?(f|hp)?$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false
handler.limit = 1
handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler