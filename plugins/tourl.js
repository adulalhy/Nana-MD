const fetch = require('node-fetch')
const FormData = require('form-data')
const { fromBuffer } = require('file-type')
const fs = require('fs')
const uploadImage = require('../lib/uploadImage')
const uploadFile = require('../lib/uploadFile')

 let handler  = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mimetype = (q.msg || q).mimetype || ''
let content = m.quoted ? JSON.parse(JSON.stringify(m).replace(/quotedM/gi, 'm')).message.extendedTextMessage.contextInfo : m
      let img = /image/.test(mimetype) 
      if (!img) throw 'Foto/Sticker tidak ditemukan'
      try {
     su = await require('imgbb-uploader')('c93b7d1d3f7a145263d4651c46ba55e4', await conn.downloadAndSaveMediaMessage(content))
m.reply(`*Sukses*\nURL : ${su.url}`)
      } catch (e) {
      m.reply(`${e}`)
     }
}
handler.help = ['tourl','imgbb']
handler.tags = ['tools']
handler.command = /^(imgbb|tourl)$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false
handler.limit = true
handler.fail = null

module.exports = handler