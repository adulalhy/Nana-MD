let fetch = require('node-fetch')
let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) throw `Contoh Penggunaan\n${usedPrefix}spamsms 628xxxxxxxx`
  let nomor = text.replace(/[^0-9]/gi, '')
  if (!nomor.startsWith('62')) throw `Contoh Penggunaan\n${usedPrefix}spamsms 628xxxxxxxx`
  m.reply('_*Tunggu permintaan anda sedang diproses.....*_')
  let spam1 = await fetch(global.API('lol', '/api/sms/spam1', { nomor }, 'apikey'))
  let spam2 = await fetch(global.API('lol', '/api/sms/spam2', { nomor }, 'apikey'))
  let spam3 = await fetch(global.API('lol', '/api/sms/spam3', { nomor }, 'apikey'))
  let spam4 = await fetch(global.API('lol', '/api/sms/spam4', { nomor }, 'apikey'))
  let spam5 = await fetch(global.API('lol', '/api/sms/spam5', { nomor }, 'apikey'))
  let spam6 = await fetch(global.API('lol', '/api/sms/spam6', { nomor }, 'apikey'))
  let spam7 = await fetch(global.API('lol', '/api/sms/spam7', { nomor }, 'apikey'))
  let spam8 = await fetch(global.API('lol', '/api/sms/spam2', { nomor }, 'apikey'))
  m.reply('Spam sms sukses....')
  }
handler.help = ['spamsms <nomor>']
handler.tags = ['tools']
handler.premium = true
handler.command = /^(spamsms)$/i

module.exports = handler