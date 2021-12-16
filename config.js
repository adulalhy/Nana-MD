let fs = require('fs')
let chalk = require('chalk')
const fetch = require("node-fetch");
const success = chalk.bold.green
const received = chalk.bold.cyan
const error = chalk.bold.red


global.owner = ['6281390199407','6281393190599'] // Put your number here
global.mods = [] // Want some help?
global.prems = [] // Premium user has unlimited limit
global.APIs = {
// Contoh Penambahan Rest Api Yang Akan Digunakan
// Prefix: 'Alamat Url Website Rest Api',
  bx: 'https://bx-hunter.herokuapp.com',
  dhnjing: 'https://dhnjing.xyz',
  hardianto: 'https://hardianto-chan.herokuapp.com',
  jonaz: 'https://jonaz-api-v2.herokuapp.com',
  neoxr: 'https://neoxr-api.herokuapp.com',
  nzcha: 'http://nzcha-apii.herokuapp.com',
  bg: 'http://bochil.ddns.net',
  fdci: 'https://api.fdci.se',
  bsbt: 'https://bsbt-api-rest.herokuapp.com',
  nrtm: 'https://nurutomo.herokuapp.com',
  pencarikode: 'https://pencarikode.xyz',
  xteam: 'https://api.xteam.xyz',
  zahir: 'https://zahirr-web.herokuapp.com',
  zekais: 'http://zekais-api.herokuapp.com',
  zeks: 'https://api.zeks.xyz',
  leys: 'https://leyscoders-api.herokuapp.com',
  hardianto: 'https://hardianto-chan.herokuapp.com',
  lol: 'https://api.lolhuman.xyz',
  vh: 'http://api.vhtear.com',
}
global.APIKeys = { 
// Contoh Penambahan Rest Api + Apikey Yang Akan Digunakan
// 'Alamat Url Website Rest Api': 'Apikey',
  'https://bx-hunter.herokuapp.com': 'Ikyy69',
  'https://bsbt-api-rest.herokuapp.com': 'benniismael',
  'https://hardianto-chan.herokuapp.com': 'hardianto',
  'https://neoxr-api.herokuapp.com': 'yntkts',
  'https://pencarikode.xyz': 'pais',
  'https://api.xteam.xyz': 'HIRO',
  'http://api.vhtear.com': 'HIROZTWO',
  'https://api.lolhuman.xyz': 'HIRO',
  'https://zahirr-web.herokuapp.com': 'zahirgans',
  'https://api.zeks.xyz': 'apivinz',
  'https://leyscoders-api.herokuapp.com': 'dappakntlll',
  'https://hardianto-chan.herokuapp.com': 'hardianto'
}

// Sticker WM
global.packname = 'Nana-MD'
global.author = 'Adul Alhy'

global.sessionid = '48736705854:2Tq6joffmVDzaS:24' // ID Sesi Instagram, Kamu Bisa Menganti Dengan Sesi Milikmu
global.multiplier = 69 // Semakin Tinggi Angka/Nilai, Maka Peningkatan Level Akan Semakin Sulit
global.wait = '_*Please Wait . . . . *_' // Pesan Saat Memuat / Menunggu
global.eror = '_*Server Sedang Mengalami Error { Error:404 }*_' // Pesan Jika Mengalami Error
global.fla = 'https://i.ibb.co/jy23Sgc/wallhaven-mdwkxm-min.jpg'


global.rpg = {
  emoticon(string) {
    string = string.toLowerCase()
    let emot = {
      exp: '✉️',
      money: '💵',
      potion: '🥤',
      diamond: '💎',
      common: '📦',
      uncommon: '🎁',
      mythic: '🗳️',
      legendary: '🗃️',
      pet: '🎁',
      sampah: '🗑',
      armor: '🥼',
      sword: '⚔️',
      kayu: '🪵',
      batu: '🪨',
      string: '🕸️',
      kuda: '🐎',
      kucing: '🐈' ,
      anjing: '🐕',
      petFood: '🍖',
      gold: '👑',
      emerald: '💚'
    }
    let results = Object.keys(emot).map(v => [v, new RegExp(v, 'gi')]).filter(v => v[1].test(string))
    if (!results.length) return ''
    else return emot[results[0][0]]
  }
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  delete require.cache[file]
  require(file)
})