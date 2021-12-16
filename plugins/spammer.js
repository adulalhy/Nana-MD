let handler = async(m, { conn, text }) => {
let [number, pesan] = text.split `|`

    if (!number) return conn.reply(m.chat, 'Silahkan masukan nomor yang akan dispam', m)
    if (!pesan) return conn.reply(m.chat, 'Silahkan masukan pesannya', m)
    if (text > 500) return conn.reply(m.chat, 'Teks Kepanjangan!', m)

    let korban = `${number}`
    var nomor = m.sender
    let spam1 = `*「 WA SPAMMER 」*\n\nDari : wa.me/${nomor.split("@s.whatsapp.net")[0]}\nPesan : ${pesan}\n\n~Nana-MD`
    let spam2 = `*「 WA SPAMMER 」*\n\nDari : wa.me/${nomor.split("@s.whatsapp.net")[0]}\nPesan : ${pesan}\n\n~Nana-MD`
    let spam3 = `*「 WA SPAMMER 」*\n\nDari : wa.me/${nomor.split("@s.whatsapp.net")[0]}\nPesan : ${pesan}\n\n~Nana-MD`
    let spam4 = `*「 WA SPAMMER 」*\n\nDari : wa.me/${nomor.split("@s.whatsapp.net")[0]}\nPesan : ${pesan}\n\n~Nana-MD`
    let spam5 = `*「 WA SPAMMER 」*\n\nDari : wa.me/${nomor.split("@s.whatsapp.net")[0]}\nPesan : ${pesan}\n\n~Nana-MD`
    let spam6 = `*「 WA SPAMMER 」*\n\nDari : wa.me/${nomor.split("@s.whatsapp.net")[0]}\nPesan : ${pesan}\n\n~Nana-MD`
    let spam7 = `*「 WA SPAMMER 」*\n\nDari : wa.me/${nomor.split("@s.whatsapp.net")[0]}\nPesan : ${pesan}\n\n~Nana-MD`
    let spam8 = `*「 WA SPAMMER 」*\n\nDari : wa.me/${nomor.split("@s.whatsapp.net")[0]}\nPesan : ${pesan}\n\n~Nana-MD`
    let spam9 = `*「 WA SPAMMER 」*\n\nDari : wa.me/${nomor.split("@s.whatsapp.net")[0]}\nPesan : ${pesan}\n\n~Nana-MD`
    let spam10 = `*「 WA SPAMMER 」*\n\nDari : wa.me/${nomor.split("@s.whatsapp.net")[0]}\nPesan : ${pesan}\n\n~Nana-MD`

    conn.sendMessage(korban + '@s.whatsapp.net', { text: spam1 })
    conn.sendMessage(korban + '@s.whatsapp.net',  { text: spam2 })
    conn.sendMessage(korban + '@s.whatsapp.net',  { text: spam3 })
    conn.sendMessage(korban + '@s.whatsapp.net',  { text: spam4 })
     conn.sendMessage(korban + '@s.whatsapp.net',  { text: spam5 }) 
     conn.sendMessage(korban + '@s.whatsapp.net',  { text: spam6 }) 
     conn.sendMessage(korban + '@s.whatsapp.net',  { text: spam7 }) 
     conn.sendMessage(korban + '@s.whatsapp.net',  { text: spam8 }) 
     conn.sendMessage(korban + '@s.whatsapp.net',  { text: spam9 }) 
     conn.sendMessage(korban + '@s.whatsapp.net',  { text: spam10 })

    let logs = `[!] Berhasil mengirim spam wa ke nomor ${korban} 10 kali`
    conn.reply(m.chat, logs, m)
}
handler.help = ['spam <nomor|pesan>', 'spamwa <nomor|pesan>']
handler.tags = ['spammer']
handler.command = /^(spam|spamwa)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null
handler.limit = false

module.exports = handler
