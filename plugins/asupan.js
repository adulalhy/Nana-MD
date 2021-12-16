let fetch = require("node-fetch")
let handler = async (m, { conn }) => {
let res = await fetch('https://raw.githubusercontent.com/VideFrelan/words/main/ptl.txt')
let txt = await res.text()
let arr = txt.split('\n')
let cita = arr[Math.floor(Math.random() * arr.length)]
conn.sendFile(m.chat, cita, 'asupan.mp4', 'Nih kak asupan nya!!\n*Follow:* https://instagram.com/adulalhy2', m, false)
}

handler.tags = ['fun', 'internet']
handler.help = ['asupan','ptlvideo', 'ptlvid']
handler.command = /^(asupan|ptlvideo|ptlvid)$/i






module.exports = handler