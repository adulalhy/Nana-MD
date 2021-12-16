console.log('Memulai...')
let { spawn } = require('child_process')
let path = require('path')
let fs = require('fs')
let package = require("./package.json")
let { performance } = require("perf_hooks")
let { sizeFormatter } = require("human-readable")
const CFonts = require("cfonts")
const chalk = require("chalk")
const success = chalk.bold.green;
const received = chalk.bold.cyan;
const error = chalk.bold.red;
const moment = require("moment-timezone")
const os = require ("os")
let format = sizeFormatter({
  std: "JEDEC", // 'SI' (default) | 'IEC' | 'JEDEC'
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
})
var d = new Date(new Date() + 3600000)
var locale = "id";
// d.getTimeZoneOffset()
// Offset -420 is 18.00
// Offset    0 is  0.00
// Offset  420 is  7.00
var week = d.toLocaleDateString(locale, {
  weekday: "long",
})
var date = d.toLocaleDateString(locale, {
  day: "numeric",
  month: "long",
  year: "numeric",
})
var time = d.toLocaleTimeString(locale, {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
})

// LOADING ANIMATION
const P = ['\\', '|', '/', '-'];
let x = 0;
const loader = setInterval(() => {
  process.stdout.write(`\r${P[x++]}`)
  x %= P.length;
}, 250)

const loading = setTimeout(() => {
  clearInterval(loader)
}, 5000)
// END OFF LOADING ANIMATION

CFonts.say("Nana-Md", {
  font: "block",
  align: "center",
  gradient: ["red", "blue"],
})

console.log(success("Nana-md By Adul Alhy"))
console.log(success("-> Tanggal:" + date))
console.log(success("-> Jam:" + time))

var isRunning = false
/**
 * Start a js file
 * @param {String} file `path/to/file`
 */
function start(file) {
  if (isRunning) return
  isRunning = true
  let args = [path.join(__dirname, file), ...process.argv.slice(2)]
  let p = spawn(process.argv[0], args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  })
  p.on('message', data => {
    console.log(received("[RECEIVED]", data))
    switch (data) {
      case 'reset':
        p.kill()
        isRunning = false
        start.apply(this, arguments)
        break
      case 'uptime':
        p.send(process.uptime())
        break
    }
  })
  p.on('exit', code => {
    isRunning = false
    console.error(error('Exited with code:', code))
    if (code === 0) return
    fs.watchFile(args[0], () => {
      fs.unwatchFile(args[0])
      start(file)
    })
  })
  // console.log(p)
}

  console.log(success("Please Wait" + loading))

start('main.js')
