let yts = require('yt-search')
const { default: makeWASocket, BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, downloadContentFromMessage, downloadHistory, proto, getMessage, generateWAMessageContent, prepareWAMessageMedia } = require('@adiwajshing/baileys')
let handler = async (m, { text, conn }) => {
  if (!text) throw 'Cari apa?'
  let results = await yts(text)
  let anjing = []
  let teks = results.all.map(v => {
    switch (v.type) {
      case 'video': 
      anjing.push({
      "title": `${v.title}`,
      "rows": [
        {
          "title": `${v.title}`,
          "description": `*${v.title}* (${v.url})
Duration: ${v.timestamp}
Uploaded ${v.ago}
${v.views} views
      `.trim(),
          "rowId": `/ytplay ${v.url}`
        }
      ]
    })
    break
      case 'channel':
      anjing.push({
      "title": `${v.title}`,
      "rows": [
        {
          "title": `${v.name}`,
          "description":  `
*${v.name}* (${v.url})
_${v.subCountLabel} (${v.subCount}) Subscriber_
${v.videoCount} video
`.trim(),
          "rowId": `/mention Itu Channel, Mana Bisa di Download Hadeh`
        }
      ]
    })
    break
    }
  }).filter(v => v).join('\n========================\n')
  hem = {
  "title": "YT-SEARCH",
  "description": "Silahkan Gan Dipilih              ",
  "buttonText": "PENCET",
  "listType": "SINGLE_SELECT",
  "sections": anjing
  }
 const templateList = generateWAMessageFromContent(m.chat, proto.Message.fromObject({ "listMessage": hem }), {});
  conn.relayMessage(m.chat, templateList.message, { messageId: templateList.key.id });
}
handler.help = ['', 'earch'].map(v => 'yts' + v + ' <pencarian>')
handler.tags = ['tools']
handler.command = /^yts(earch)?$/i
module.exports = handler
