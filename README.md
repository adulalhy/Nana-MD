[![Deploy Nana-MD](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/adulalhy/Nana-MD)
<p align="center">
<img src="https://i.ibb.co/5shXwhS/8333516ae82a.jpg" alt="NANA BOT" width="500"/>


</p>
<p align="center">
<a href="#"><img title="NANA BOT MULTI DEVICE" src="https://img.shields.io/badge/NANA BOT MULTI DEVICE-green?colorA=%23ff0000&colorB=%23017e40&style=for-the-badge"></a>
</p>
<p align="center">
<a href="https://github.com/adulalhy/Nana-MD"><img title="Author" src="https://img.shields.io/badge/Author-adulalhy-red.svg?style=for-the-badge&logo=github"></a>
</p>

---

# NANA BOT Whatsapp MD
## Information
> NANABOT whatsapp using a Baileys library.
> Jika kamu menemukan semacam bug, harap untuk dimaklumi sementara
>
> • NOTE: Bot ini masih tahap Beta fiturnya juga masih dikit
> 
> • Kalo mau nambah fitur buat folder baru [disini](https://github.com/adulalhy/Nana-MD/tree/main/plugins)


<h3 align="center">Made by :</h3>
<p align="center">
  <a href="https://github.com/adulalhy"><img src="https://github.com/adulalhy.png?size=150)](https://github.com/adulalhy" height="128" width="128" /></a>
</p>


## UNTUK PENGGUNA WINDOWS/VPS/RDP

* Unduh & Instal Git [`Klik Disini`](https://git-scm.com/downloads)
* Unduh & Instal NodeJS [`Klik Disini`](https://nodejs.org/en/download)
* Unduh & Instal FFmpeg [`Klik Disini`](https://ffmpeg.org/download.html) (**Jangan Lupa Tambahkan FFmpeg ke variabel lingkungan PATH**)
* Unduh & Instal ImageMagick [`Klik Disini`](https://imagemagick.org/script/download.php)

```bash
git clone https://github.com/adulalhy/Nana-MD
cd Nana-MD
npm install
npm update
npm index
```

---------

## UNTUK PENGGUNA TERMUX
```bash
git clone https://github.com/adulalhy/Nana-MD
cd Nana-MD
npm i
npm update
node .
```

## UNTUK PENGGUNA HEROKU

### Instal Buildpack
* heroku/nodejs
* https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
* https://github.com/DuckyTeam/heroku-buildpack-imagemagick.git

## Installing the FFmpeg for Windows
* Unduh salah satu versi FFmpeg yang tersedia dengan mengklik [di sini](https://www.gyan.dev/ffmpeg/builds/).
* Extract file ke `C:\` path.
* Ganti nama folder yang telah di-extract menjadi `ffmpeg`.
* Run Command Prompt as Administrator.
* Jalankan perintah berikut::
```cmd
> setx /m PATH "C:\ffmpeg\bin;%PATH%"
```
Jika berhasil, akan memberikanmu pesan seperti: `SUCCESS: specified value was saved`.
* Sekarang setelah Anda menginstal FFmpeg, verifikasi bahwa itu berhasil dengan menjalankan perintah ini untuk melihat versi:
```cmd
> ffmpeg -version
```

## Arguments `node . [--options] [<session name>]`

### `--session <file name>`

Use another session with another name, default is ```session.data.json```

### `--prefix <prefixes>`

* `prefixes` are seperated by each character
Set prefix

### `--server`

Used for [heroku](https://heroku.com/) or scan through website

### `--db <json-server-url>`

Use external db instead of local db, 
Example Server `https://json-server.nurutomo.repl.co/`

Code: `https://repl.it/@AdulAlhy/json-server`

`node . --db 'https://json-server.adulalhy.repl.co/'`

The server should have like this specification

#### GET

```http
GET /
Accept: application/json
```

#### POST

```http
POST /
Content-Type: application/json

{
 data: {}
}
```


# Thanks to
<a href="https://github.com/Nurutomo"><img src="https://github.com/Nurutomo.png?size=100" width="100" height="100"></a> | [![AdulAlhy](http://github.com/adulalhy.png?size=100)](http://github.com/adulalhy) | [![Ilman](https://github.com/ilmanhdyt.png?size=150)](https://github.com/ilmanhdyt) | [![Fazone](https://github.com/fazonetea.png?size=150)](https://github.com/fazonetea) 
----|----|----|----
[Nurutomo](https://github.com/Nurutomo) | [Adul Alhy](https://github.com/adulalhy) | [Ilman (ShiraoriBOT)](https://github.com/ilmanhdyt) | [Fazone](https://github.com/fazonetea)
Author | Owner Nana-MD | Partner | Best Partner
## Donate
- [Saweria](https://saweria.co/adulalhy)
