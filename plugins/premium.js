//Created By Adul Alhy [Jangan dihapus ya bang :)]

let handler = async (m, { conn }) => {
  idis = await m.reply(`
╭─「 Shop  」
│ 
│ • Jadi User Premium : 20k / bulan
│ • Join Group : 10k / bulan
│ 
╰────
╭─「 Via  」
│ 
│ • Telkomsel : 081393190599 
│ • Dana & Ovo : 081298108109
│ 
╰────
Kalo Mau Join Grup / Jadi Premium 
Silahkan Chat Kontak Yang Ada Dibawah Ini 
`.trim()) 
  
  conn.sendContact(m.chat, '6281390199407', 'Adul Alhy', m)
}
handler.help = ['premium', 'shop', 'infopremium']
handler.tags = ['info']
handler.command = /^(premium|infopremium)$/i

module.exports = handler
