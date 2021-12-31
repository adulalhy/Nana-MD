//Created By Adul Alhy [Jangan dihapus ya bang :)]

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
	if (!text) throw `Caranya: .addprem @user|30`
	 function no(number){
    return number.replace(/\s/g,'').replace(/([@+-])/g,'')
  }
  var hl = []
  hl[0] = text.split('|')[0]
  hl[0] = no(hl[0]) + "@s.whatsapp.net"
  hl[1] = text.split('|')[1]
	  var jumlahHari = 86400000 * hl[1]
  // var jumlahHari = 1000 * text
  var now = new Date() * 1
  global.DATABASE.data.users[hl[0]].premium = true
  if (now < global.DATABASE.data.users[hl[0]].premiumDate) global.DATABASE.data.users[hl[0]].premiumDate += jumlahHari
  else global.DATABASE.data.users[hl[0]].premiumDate = now + jumlahHari
  conn.reply(m.chat,`*❏ UPGRADE PREMIUM*\n\nBerhasil menambahkan akses premium kepada *@${hl[0].split('@')[0]}* selama *${hl[1]} hari*.\n\n*Premium : ${msToDate(global.DATABASE.data.users[hl[0]].premiumDate - now)}*`,m,{ contextInfo: { mentionedJid: [hl[0]] } })
  conn.reply(hl[0],`*❏ UPGRADE PREMIUM*\n\nBerhasil menambahkan akses premium kepada *@${hl[0].split('@')[0]}* selama *${hl[1]} hari*.\n\n*Premium : ${msToDate(global.DATABASE.data.users[hl[0]].premiumDate - now)}*`,m,{ contextInfo: { mentionedJid: [hl[0]] } }) 
}
handler.help = ['addprem @user|7']
handler.tags = ['owner']
handler.command = /^(addprem)$/i
handler.owner = true
module.exports = handler

function msToDate(ms) {
    temp = ms
    days = Math.floor(ms / (24 * 60 * 60 * 1000));
    daysms = ms % (24 * 60 * 60 * 1000);
    hours = Math.floor((daysms) / (60 * 60 * 1000));
    hoursms = ms % (60 * 60 * 1000);
    minutes = Math.floor((hoursms) / (60 * 1000));
    minutesms = ms % (60 * 1000);
    sec = Math.floor((minutesms) / (1000));
    return days + " hari " + hours + " jam " + minutes + " menit";
    // +minutes+":"+sec;
}
