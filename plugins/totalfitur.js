let handler = async (m, { conn, usedPrefix: _p, args, command }) => {
let totalfeature = Object.values(global.plugins).filter(
    (v) => v.help && v.tags
  ).length;
conn.reply(m.chat, `_*Total Features : ${totalfeature}*_`,m)
}

handler.help = ['totalfitur']
handler.tags = ['']
handler.command = ['totalfitur']
module.exports = handler