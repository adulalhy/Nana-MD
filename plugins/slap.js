let fetch = require("node-fetch")
const { sticker } = require('../lib/sticker')

let handler = async (m, { conn}) => {
  try {
  let res = await fetch('https://neko-love.xyz/api/v1/slap')
  let json = await res.json()
  let { 
url
} = json
let stiker = await sticker(null, url, 'Slap', 'Nana-MD')
 /*  conn.sendMessage(m.chat, {sticker: { url: stiker }}, {
    quoted: m
  }) */
   conn.sendFile(m.chat, stiker, '', 'Busett wibu bang?:v', m)
 } catch (e) {
  }
}
handler.help = ['slap']
handler.tags = ['expression']
handler.command = /^slap/i

module.exports = handler
