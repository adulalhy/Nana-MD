let handler = async (m, { conn }) => {
  text = `@${m.sender.split('@')[0]} tagged!`
  m.reply(text, false, {
    contextInfo: {
      mentionedJid: conn.parseMention(text)
    }
  })
}
handler.help = ['tagme']
handler.tags = ['fun']

handler.command = /^tagme$/i

module.exports = handler