
handler.before = async function (m) {
    let user = db.data.users[m.sender]
    if (m.chat.endsWith('broadcast')) return
    if (user.premiumDate != 0 && user.premium) {
        if (new Date() * 1 >= user.premiumDate) {
            await m.reply(`waktu premium kamu sudah habis!`)
            user.premiumDate = 0
            user.premium = false
        }
    }
}

module.exports = handler
