let nh = require('nhentai')
let moment = require('moment')
let handler = async (m, { conn, args }) => {
 if (!DATABASE.data.chats[m.chat].nsfw && m.isGroup) throw 'Feature Nsfw Disable\nType *!enable* *nsfw* to activate this feature'
 if (!args[0]) throw 'Kodenya Mana?'
  let req = new nh.API()
  response = await req.fetchDoujin(args[0]).catch(e => {
  throw `Kode ${args[0]} Tidak Ditemukan!`
  })
  let caption = `*Data Berhasil Ditemukan!!*
  
  Title : ${response.titles.english}
  
  Title Japan : ${response.titles.japanese}
  
  Upload At : ${moment(response.uploadDate).format('HH:mm:ss DD-MM-YYYY')}
  
  Lang : ${response.tags.all.filter(v => v.type == 'language').map(v => v.name).join(', ')}
  
  Character : ${response.tags.all.filter(v => v.type == 'character').map(v => v.name).join(', ')}
  
  Category : ${response.tags.all.filter(v => v.type == 'category').map(v => v.name).join(', ')}
  
  Tag : ${response.tags.all.filter(v => v.type == 'tag').map(v => v.name).join(', ')}
  
  
  
  Mohon Tunggu Sebentar, Media Sedang Dikirim.....
  `.trim()
  await conn.sendMessage(m.chat, { url: response.thumbnail.url } , 'imageMessage', { caption, quoted: m, thumbnail: Buffer.alloc(0) })
  conn.sendMessage(m.chat, await getpdf(args[0]), 'documentMessage', { quoted: m, filename: response.titles.english+'.pdf', thumbnail: await getBuffer(response.thumbnail.url), mimetype: 'application/pdf' })
}
handler.help = ['nh', 'nhentai'].map(v => v + ' <code>')
handler.tags = ['sange']
handler.command = /^(nh|nhentai)$/i
handler.limit = 1
handler.owner = false
handler.mods = false
handler.premium = true
handler.group = false
handler.private = false
handler.nsfw = true

handler.admin = false
handler.botAdmin = false

handler.fail = null

module.exports = handler

async function getpdf(id) {
let count = 0
let ResultPdf = [];
const nhentai = require("nhentai");
const request = require("request");
const topdf = require("image-to-pdf");
const fs = require("fs");
const get_result = new nhentai.API()
      const doujin = await get_result.fetchDoujin(id);
      const array_page = doujin.pages
      const title = doujin.titles.pretty

      for (let index = 0; index < array_page.length; index++) {
        const image_name = "nhentai/" + title + index + ".jpg"
        await new Promise((resolve) => request(array_page[index]).pipe(fs.createWriteStream(image_name)).on('finish', resolve))
        console.log(array_page[index].url);

        ResultPdf.push(image_name);
        count++
      }

      await new Promise((resolve) =>
        topdf(ResultPdf, 'A4')
        .pipe(fs.createWriteStream('nhentai/' + title + '.pdf'))
        .on('finish', resolve)
      )

      for (let index = 0; index < array_page.length; index++) {
        fs.unlink("nhentai/" + title + index + ".jpg", (err) => {
          if (err) throw err
        })
      }
      output = await fs.promises.readFile("nhentai/" + title +".pdf")
      await fs.promises.unlink("nhentai/" + title +".pdf")
      return output
}
