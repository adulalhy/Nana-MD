//Created By Adul Alhy [Jangan dihapus ya bang :)]

let handler  = async (m, { conn, text }) => {
  function msToDate(ms) {
		temp = ms
		days = Math.floor(ms / (24*60*60*1000));
		daysms = ms % (24*60*60*1000);
		hours = Math.floor((daysms)/(60*60*1000));
		hoursms = ms % (60*60*1000);
		minutes = Math.floor((hoursms)/(60*1000));
		minutesms = ms % (60*1000);
		sec = Math.floor((minutesms)/(1000));
		return days+" Hari "+hours+" Jam "+ minutes + " Menit";
		// +minutes+":"+sec;
  }

	let users = global.DATABASE.data.users

  var text = ""
  var i = 1
  for (let jid in users){
    if (users[jid].premium){
      text += `\n${i}. ${conn.getName(jid)}\n    wa.me/${jid.split('@')[0]}\n    ${msToDate(global.DATABASE.data.users[jid].premiumDate - new Date() * 1)}`
      i += 1
    }
  }

  return conn.reply(m.chat,`❏ Total Premium : ${i-1} user\n❏ Upgrade Premium ? Ketik *.premium*\n${text}`,m)
}
handler.help = ['listpremium','premiumlist','premlist','listprem']
handler.tags = ['bot']
handler.command = /^(listpremium|premiumlist|listprem|premlist)$/i
handler.exp = 2000
module.exports = handler
