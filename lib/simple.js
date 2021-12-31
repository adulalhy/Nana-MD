const {
    default: makeWASocket,
    proto,
    downloadContentFromMessage,
    getBinaryNodeChild,
    jidDecode,
    areJidsSameUser,
    generateForwardMessageContent,
    generateWAMessageFromContent
} = require('@adiwajshing/baileys-md')
const { toAudio, toPTT, toVideo } = require('./converter')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./exif')
const chalk = require('chalk')
const fetch = require('node-fetch')
const FileType = require('file-type')
const PhoneNumber = require('awesome-phonenumber')
const fs = require('fs')
const path = require('path')

exports.makeWASocket = (...args) => {
    let conn = makeWASocket(...args)

    conn.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }
    if (conn.user && conn.user.id) conn.user.jid = conn.decodeJid(conn.user.id)
    conn.chats = {}
    conn.contacts = {}

    function updateNameToDb(contacts) {
        if (!contacts) return
        for (let contact of contacts) {
            let id = conn.decodeJid(contact.id)
            if (!id) continue
            let chats = conn.contacts[id]
            if (!chats) chats = { id }
            let chat = {
                ...chats,
                ...({
                    ...contact, id, ...(id.endsWith('@g.us') ?
                        { subject: contact.subject || chats.subject || '' } :
                        { name: contact.notify || chats.name || chats.notify || '' })
                } || {})
            }
            conn.contacts[id] = chat
        }
    }
    conn.ev.on('contacts.upsert', updateNameToDb)
    conn.ev.on('groups.update', updateNameToDb)
    conn.ev.on('group-participants.update', async function updateParticipantsToDb({ id, participants, action }) {
        id = conn.decodeJid(id)
        if (!(id in conn.contacts)) conn.contacts[id] = { id }
        let groupMetadata = Object.assign((conn.contacts[id].metadata || {}), await conn.groupMetadata(id))
        for (let participant of participants) {
            participant = conn.decodeJid(participant)
            switch (action) {
                case 'add': {
                    if (participant == conn.user.jid) groupMetadata.readOnly = false
                    let same = (groupMetadata.participants || []).find(user => user && user.id == participant)
                    if (!same) groupMetadata.participants.push({ id, admin: null })
                }
                    break
                case 'remove': {
                    if (participant == conn.user.jid) groupMetadata.readOnly = true
                    let same = (groupMetadata.participants || []).find(user => user && user.id == participant)
                    if (same) {
                        let index = groupMetadata.participants.indexOf(same)
                        if (index !== -1) groupMetadata.participants.splice(index, 1)
                    }
                }
                    break
            }
        }
        conn.contacts[id] = {
            ...conn.contacts[id],
            subject: groupMetadata.subject,
            desc: groupMetadata.desc.toString(),
            metadata: groupMetadata
        }
    })

    conn.ev.on('groups.update', function groupUpdatePushToDb(groupsUpdates) {
        for (let update of groupsUpdates) {
            let id = conn.decodeJid(update.id)
            if (!id) continue
            if (!(id in conn.contacts)) conn.contacts[id] = { id }
            if (!conn.contacts[id].metadata) conn.contacts[id].metadata = {}
            let subject = update.subject
            if (subject) conn.contacts[id].subject = subject
            let announce = update.announce
            if (announce) conn.contacts[id].metadata.announce = announce
        }
    })
    conn.ev.on('chats.upsert', function chatsUpsertPushToDb(chats_upsert) {
        console.log({ chats_upsert })
    })
    conn.ev.on('presence.update', function presenceUpdatePushToDb({ id, presences }) {
        let sender = Object.keys(presences)[0] || id
        let _sender = conn.decodeJid(sender)
        let presence = presences[sender]['lastKnownPresence'] || 'composing'
        if (!(_sender in conn.contacts)) conn.contacts[_sender] = {}
        conn.contacts[_sender].presences = presence
    })

    conn.logger = {
        ...conn.logger,
        info(...args) { console.log(chalk.bold.rgb(57, 183, 16)(`INFO [${chalk.rgb(255, 255, 255)(new Date())}]:`), chalk.cyan(...args)) },
        error(...args) { console.log(chalk.bold.rgb(247, 38, 33)(`ERROR [${chalk.rgb(255, 255, 255)(new Date())}]:`), chalk.rgb(255, 38, 0)(...args)) },
        warn(...args) { console.log(chalk.bold.rgb(239, 225, 3)(`WARNING [${chalk.rgb(255, 255, 255)(new Date())}]:`), chalk.keyword('orange')(...args)) }
    }

    /**
     * getBuffer hehe
     * @param {String|Buffer} path
     * @param {Boolean} returnFilename
     */
    conn.getFile = async (PATH, returnAsFilename) => {
        let res, filename
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        if (data && returnAsFilename && !filename) (filename = path.join(__dirname, '../tmp/' + new Date * 1 + '.' + type.ext), await fs.promises.writeFile(filename, data))
        return {
            res,
            filename,
            ...type,
            data
        }
    }


    /**
     * waitEvent
     * @param {*} eventName 
     * @param {Boolean} is 
     * @param {Number} maxTries 
     * @returns 
     */
    conn.waitEvent = (eventName, is = () => true, maxTries = 25) => {
        return new Promise((resolve, reject) => {
            let tries = 0
            let on = (...args) => {
                if (++tries > maxTries) reject('Max tries reached')
                else if (is()) {
                    conn.ev.off(eventName, on)
                    resolve(...args)
                }
            }
            conn.ev.on(eventName, on)
        })
    }
	

    /**
    * Send Media/File with Automatic Type Specifier
    * @param {String} jid
    * @param {String|Buffer} path
    * @param {String} filename
    * @param {String} caption
    * @param {Object} quoted
    * @param {Boolean} ptt
    * @param {Object} options
    */
    conn.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
        let type = await conn.getFile(path, true)
        let { res, data: file, filename: pathFile } = type
        if (res && res.status !== 200 || file.length <= 65536) {
            try { throw { json: JSON.parse(file.toString()) } }
            catch (e) { if (e.json) throw e.json }
        }
        let opt = { filename }
        if (quoted) opt.quoted = quoted
        if (!type) if (options.asDocument) options.asDocument = true
        let mtype = '', mimetype = type.mime
        if (/webp/.test(type.mime)) mtype = 'sticker'
        else if (/image/.test(type.mime)) mtype = 'image'
        else if (/video/.test(type.mime)) mtype = 'video'
        else if (/audio/.test(type.mime)) (
            convert = await (ptt ? toPTT : toAudio)(file, type.ext),
            file = convert.data,
            pathFile = convert.filename,
            mtype = 'audio',
            mimetype = 'audio/ogg; codecs=opus'
        )
        else mtype = 'document'
        return await conn.sendMessage(jid, {
            ...options,
            caption,
            ptt,
            [mtype]: { url: pathFile },
            mimetype
        }, {
            ...opt,
            ...options
        })
    }

     conn.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }

        await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }

     /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    conn.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }

        await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }

    /**
     * Send Contact
     * @param {String} jid 
     * @param {String} number 
     * @param {String} name 
     * @param {Object} quoted 
     * @param {Object} options 
     */
    conn.sendContact = async (jid, number, name, quoted, options) => {
        number = number.replace(/[^0-9]/g, '')
        let njid = number + '@s.whatsapp.net'
        let vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${name.replace(/\n/g, '\\n')}
TEL;type=CELL;type=VOICE;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}
END:VCARD
    `
        return await conn.sendMessage(jid, {
            contacts: {
                displayName: name,
                contacts: [{ vcard }],
                quoted, ...options
            },
            quoted, ...options
        })
    }

    /**
     * Reply to a message
     * @param {String} jid
     * @param {String|Object} text
     * @param {Object} quoted
     * @param {Object} options
     */
    conn.reply = (jid, text = '', quoted, options) => {
        return Buffer.isBuffer(text) ? this.sendFile(jid, text, 'file', '', quoted, false, options) : conn.sendMessage(jid, { ...options, text }, { quoted, ...options })
    }
    /**
     * send Button
     * @param {String} jid 
     * @param {String} contentText 
     * @param {String} footer
     * @param {Buffer|String} buffer 
     * @param {String[]} buttons 
     * @param {Object} quoted 
     * @param {Object} options 
     */
	 
	   conn.sendButton = async(jid, content, footer, button1, row1) => {
	  const buttons = [
	  {buttonId: row1, buttonText: {displayText: button1}, type: 1}
	  ]
const buttonMessage = {
    text: content,
    footer: footer,
    buttons: buttons,
    headerType: 1
}
return await conn.sendMessage(jid, buttonMessage)
  }
  
   conn.send2Button = async(jid, content, footer, button1, row1, button2, row2) => {
	  const buttons = [
	   { buttonId: row1, buttonText: { displayText: button1 }, type: 1 },
          { buttonId: row2, buttonText: { displayText: button2 }, type: 1 }
	  ]
const buttonMessage = {
    text: content,
    footer: footer,
    buttons: buttons,
    headerType: 1
}
return await conn.sendMessage(jid, buttonMessage)
  }
  
   conn.send3Button = async(jid, content, footer,button1, row1, button2, row2, button3, row3) => {
	  const buttons = [
	  { buttonId: row1, buttonText: { displayText: button1 }, type: 1 },
          { buttonId: row2, buttonText: { displayText: button2 }, type: 1 },
          { buttonId: row3, buttonText: { displayText: button3 }, type: 1 }
	  ]
const buttonMessage = {
    text: content,
    footer: footer,
    buttons: buttons,
    headerType: 1
}
return await conn.sendMessage(jid, buttonMessage)
  }
  
  
    /**
     * Send Button with Image
     * @param {String} jid
     * @param {Buffer} buffer
     * @param {String} content
     * @param {String} footer
     * @param {String} button1
     * @param {String} row1
     * @param {String} button2
     * @param {String} row2
     * @param {String} button3
     * @param {String} row3
     * @param {Object} quoted
     * @param {Object} options
     */
	 
  conn.sendButtonImg = async(jid, content, footer, button1, row1) => {
	  const buttons = [
	  {buttonId: row1, buttonText: {displayText: button1}, type: 1}
	  ]
const buttonMessage = {
    image: {url: buffer},
    caption: content,
    footer: footer,
    buttons: buttons,
    headerType: 1
}
return await conn.sendMessage(jid, buttonMessage)
  }
  
   conn.send2ButtonImg = async(jid, content, footer, button1, row1, button2, row2) => {
	  const buttons = [
	   { buttonId: row1, buttonText: { displayText: button1 }, type: 1 },
          { buttonId: row2, buttonText: { displayText: button2 }, type: 1 }
	  ]
const buttonMessage = {
   image: {url: buffer},
    caption: content,
    footer: footer,
    buttons: buttons,
    headerType: 1
}
return await conn.sendMessage(jid, buttonMessage)
  }
  
   conn.send3ButtonImg = async(jid, content, footer,button1, row1, button2, row2, button3, row3) => {
	  const buttons = [
	  { buttonId: row1, buttonText: { displayText: button1 }, type: 1 },
          { buttonId: row2, buttonText: { displayText: button2 }, type: 1 },
          { buttonId: row3, buttonText: { displayText: button3 }, type: 1 }
	  ]
const buttonMessage = {
    image: {url: buffer},
    caption: content,
    footer: footer,
    buttons: buttons,
    headerType: 1
}
return await conn.sendMessage(jid, buttonMessage)
  }
  
 /**
     * Send Hydrate Button
     * @param {String} jid
     * @param {String} content
     * @param {String} footer
     * @param {String} displayText
     * @param {String} link
     * @param {Object} displayCall
     * @param {Object} number
	 * @param {Object} quickReplyText
     * @param {Object} id
	 * @param {Object} quickReplyText2
     * @param {Object} id2
	 * @param {Object} quickReplyText3
     * @param {Object} id3
	 * @param {Object} quoted
     */
	 
	conn.sendHydrate = async (jid, content, displayText, link, displayCall, number, quickReplyText, id,quoted) => {
		let template = generateWAMessageFromContent(jid, proto.Message.fromObject({
			         templateMessage: {
             hydratedTemplate: {
                 hydratedContentText: content,
                 hydratedButtons: [{
                     urlButton: {
                         displayText: displayText,
                         url: link
                     }
                 }, {
                     callButton: {
                         displayText: displayCall,
                         phoneNumber: number
                     }
                 },
                 {
                     quickReplyButton: {
                         displayText:quickReplyText,
                         id: id
                     }
                 }
                 ]
             }
         }
     }), { userJid: conn.user.jid, quoted: quoted});
     return await conn.relayMessage(
         jid,
         template.message,
         { messageId: template.key.id }
     )
	}
	
	conn.sendHydrate2 = async (jid, content, displayText, link, displayCall, number, quickReplyText, id, quickReplyText2, id2, quoted) => {
		let template = generateWAMessageFromContent(jid, proto.Message.fromObject({
			         templateMessage: {
             hydratedTemplate: {
                 hydratedContentText: content,
                 hydratedButtons: [{
                     urlButton: {
                         displayText: displayText,
                         url: link
                     }
                 }, {
                     callButton: {
                         displayText: displayCall,
                         phoneNumber: number
                     }
                 },
                 {
             quickReplyButton: {
               displayText: quickReplyText,
               id: id,
             }

           },
               {
             quickReplyButton: {
               displayText: quickReplyText2,
               id: id2,
             }
		   }]
         }
       }
     }), { userJid: conn.user.jid, quoted: quoted});
     return await conn.relayMessage(
         jid,
         template.message,
         { messageId: template.key.id }
     )
	}
	
	conn.sendHydrate3 = async (jid, content, displayText, link, displayCall, number, quickReplyText, id, quickReplyText2, id2, quickReplyText3, id3, quoted) => {
		let template = generateWAMessageFromContent(jid, proto.Message.fromObject({
			         templateMessage: {
             hydratedTemplate: {
                 hydratedContentText: content,
                 hydratedButtons: [{
                     urlButton: {
                         displayText: displayText,
                         url: link
                     }
                 }, {
                     callButton: {
                         displayText: displayCall,
                         phoneNumber: number
                     }
                 },
                 {
             quickReplyButton: {
               displayText: quickReplyText,
               id: id,
             }

           },
               {
             quickReplyButton: {
               displayText: quickReplyText2,
               id: id2,
             }
           },
           {
             quickReplyButton: {
              displayText: quickReplyText3,
               id: id3,
            }
		   }]
         }
       }
     }), { userJid: conn.user.jid, quoted: quoted});
     return await conn.relayMessage(
         jid,
         template.message,
         { messageId: template.key.id }
     )
	}
	
	/**
         * Send Buttons with Location
         * @param {String} jid
         * @param {Buffer} buffer
         * @param {String} content
         * @param {String} footer
         * @param {String} button1
         * @param {String} row1
         * @param {String} button2
         * @param {String} row2
         * @param {String} button3
         * @param {String} row3
         */
		 
	conn.sendButtonLoc= async (jid, buffer, content, footer, button1, row1, quoted, options = {}) => {
		let buttons = [{buttonId: row1, buttonText: {displayText: button1}, type: 1}]
		let buttonMessage = {
	location: { jpegThumbnail: buffer },
    caption: content,
    footer: footer,
    buttons: buttons,
    headerType: 6
}
      return await  conn.sendMessage(jid, buttonMessage, {
            quoted,
            upload: conn.waUploadToServer,
            ...options
        })
	}
	conn.send2ButtonLoc= async (jid, buffer, content, footer, button1, row1, button2, row2, quoted, options = {}) => {
		let buttons = [{buttonId: row1, buttonText: {displayText: button1}, type: 1},
		{ buttonId: row2, buttonText: { displayText: button2 }, type: 1 }]
		let buttonMessage = {
	location: { jpegThumbnail: buffer },
    caption: content,
    footer: footer,
    buttons: buttons,
    headerType: 6
}
      return await  conn.sendMessage(jid, buttonMessage, {
            quoted,
            upload: conn.waUploadToServer,
            ...options
        })
	}
		conn.send3ButtonLoc= async (jid, buffer, content, footer, button1, row1, button2, row2, quoted, options = {}) => {
		let buttons = [{buttonId: row1, buttonText: {displayText: button1}, type: 1},
		{ buttonId: row2, buttonText: { displayText: button2 }, type: 1 },
		 { buttonId: row3, buttonText: { displayText: button3 }, type: 1 }
        ]
		let buttonMessage = {
	location: { jpegThumbnail: buffer },
    caption: content,
    footer: footer,
    buttons: buttons,
    headerType: 6
}
      return await  conn.sendMessage(jid, buttonMessage, {
            quoted,
            upload: conn.waUploadToServer,
            ...options
        })
	}

    /**
    * cMod
    * @param {String} jid 
    * @param {*} message 
    * @param {String} text 
    * @param {String} sender 
    * @param {*} options 
    * @returns 
    */
    conn.cMod = (jid, message, text = '', sender = conn.user.jid, options = {}) => {
        let copy = message.toJSON()
        let mtype = Object.keys(copy.message)[0]
        let isEphemeral = false // mtype === 'ephemeralMessage'
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
        let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
        else if (content.caption) content.caption = text || content.caption
        else if (content.text) content.text = text || content.text
        if (typeof content !== 'string') msg[mtype] = { ...content, ...options }
        if (copy.participant) sender = copy.participant = sender || copy.participant
        else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
        copy.key.remoteJid = jid
        copy.key.fromMe = areJidsSameUser(sender, conn.user.id) || false
        return proto.WebMessageInfo.fromObject(copy)
    }

    /**
     * Exact Copy Forward
     * @param {String} jid
     * @param {Object} message
     * @param {Boolean|Number} forwardingScore
     * @param {Object} options
     */
    conn.copyNForward = async (jid, message, forwardingScore = true, options = {}) => {
        let m = generateForwardMessageContent(message, !!forwardingScore)
        let mtype = Object.keys(m)[0]
        if (forwardingScore && typeof forwardingScore == 'number' && forwardingScore > 1) m[mtype].contextInfo.forwardingScore += forwardingScore
        m = generateWAMessageFromContent(jid, m, { ...options, userJid: conn.user.id })
        await conn.relayMessage(jid, m.message, { messageId: m.key.id, additionalAttributes: { ...options } })
        return m
    }
 /**
     * 
     * @param {*} message 
     * @param {*} filename 
     * @param {*} attachExtension 
     * @returns 
     */
    conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = mime.split('/')[0].replace('application', 'document') ? mime.split('/')[0].replace('application', 'document') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
	let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    /**
     * Download media message
     * @param {Object} m
     * @param {String} type 
     * @param {fs.PathLike|fs.promises.FileHandle} filename
     * @returns {Promise<fs.PathLike|fs.promises.FileHandle|Buffer>}
     */
    conn.downloadM = async (m, type, filename = '') => {
        if (!m || !(m.url || m.directPath)) return Buffer.alloc(0)
        const stream = await downloadContentFromMessage(m, type)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        if (filename) await fs.promises.writeFile(filename, buffer)
        return filename && fs.existsSync(filename) ? filename : buffer
    }

    /**
     * Read message
     * @param {String} jid 
     * @param {String|undefined|null} participant 
     * @param {String} messageID 
     */
    conn.chatRead = async (jid, participant, messageID) => {
        return await conn.sendReadReceipt(jid, participant, [messageID])
    }

    /**
     * Parses string into mentionedJid(s)
     * @param {String} text
     */
    conn.parseMention = (text = '') => {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }

    /**
     * Get name from jid
     * @param {String} jid
     * @param {Boolean} withoutContact
     */
    conn.getName = (jid, withoutContact = false) => {
        jid = conn.decodeJid(jid)
        withoutContact = this.withoutContact || withoutContact
        let v
        if (jid.endsWith('@g.us')) return new Promise(async (resolve) => {
            v = conn.contacts[jid] || {}
            if (!(v.name || v.subject)) v = await conn.groupMetadata(jid) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = jid === '0@s.whatsapp.net' ? {
            jid,
            vname: 'WhatsApp'
        } : jid === conn.user.jid ?
            conn.user :
            (conn.contacts[jid] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

    conn.saveName = async (id, name = '') => {
        if (!id) return
        id = conn.decodeJid(id)
        let isGroup = id.endsWith('@g.us')
        if (id in conn.contacts && conn.contacts[id][isGroup ? 'subject' : 'name'] && id in conn.chats) return
        let metadata = {}
        if (isGroup) metadata = await conn.groupMetadata(id)
        let chat = { ...(conn.contacts[id] || {}), id, ...(isGroup ? { subject: metadata.subject, desc: metadata.desc.toString(), metadata } : { name }) }
        conn.contacts[id] = chat
        conn.chats[id] = chat
    }

    conn.pushMessage = (m) => {
        if (['senderKeyDistributionMessage', 'protocolMessage'].includes(m.mtype)) return 
        let id = m.chat
        let chats = conn.chats[id]
        if (!chats) chats = { id }
        if (!chats.messages) chats.messages = {}
        chats.messages[m.id] = JSON.stringify(m, null, 2)
    }

    conn.getBusinessProfile = async (jid) => {
        const results = await conn.query({
            tag: 'iq',
            attrs: {
                to: 's.whatsapp.net',
                xmlns: 'w:biz',
                type: 'get'
            },
            content: [{
                tag: 'business_profile',
                attrs: { v: '244' },
                content: [{
                    tag: 'profile',
                    attrs: { jid }
                }]
            }]
        })
        const profiles = getBinaryNodeChild(getBinaryNodeChild(results, 'business_profile'), 'profile')
        if (!profiles) return {} // if not bussines
        const address = getBinaryNodeChild(profiles, 'address')
        const description = getBinaryNodeChild(profiles, 'description')
        const website = getBinaryNodeChild(profiles, 'website')
        const email = getBinaryNodeChild(profiles, 'email')
        const category = getBinaryNodeChild(getBinaryNodeChild(profiles, 'categories'), 'category')
        return {
            jid: profiles.attrs?.jid,
            address: address?.content.toString(),
            description: description?.content.toString(),
            website: website?.content.toString(),
            email: email?.content.toString(),
            category: category?.content.toString(),
        }
    }
    /**
     * Serialize Message, so it easier to manipulate
     * @param {Object} m
     */
    conn.serializeM = (m) => {
        return exports.smsg(conn, m)
    }

    Object.defineProperty(conn, 'name', {
        value: 'WASocket',
        configurable: true,
    })
//Created By Fazone
//Fix File Size Other 10mb
const _0x32821f=_0x16f6;(function(_0x6744c0,_0x4b14ed){const _0x16dcde=_0x16f6,_0xa560b4=_0x6744c0();while(!![]){try{const _0x1a493a=-parseInt(_0x16dcde(0xe1))/0x1*(parseInt(_0x16dcde(0xe8))/0x2)+parseInt(_0x16dcde(0xfa))/0x3*(-parseInt(_0x16dcde(0xef))/0x4)+-parseInt(_0x16dcde(0xdd))/0x5*(-parseInt(_0x16dcde(0xea))/0x6)+-parseInt(_0x16dcde(0xff))/0x7*(parseInt(_0x16dcde(0xf9))/0x8)+-parseInt(_0x16dcde(0xda))/0x9+parseInt(_0x16dcde(0xf7))/0xa*(-parseInt(_0x16dcde(0xde))/0xb)+parseInt(_0x16dcde(0xf3))/0xc;if(_0x1a493a===_0x4b14ed)break;else _0xa560b4['push'](_0xa560b4['shift']());}catch(_0x53780f){_0xa560b4['push'](_0xa560b4['shift']());}}}(_0x2199,0xaedc6));function _0x16f6(_0x1037a9,_0x1d75a2){const _0x21991e=_0x2199();return _0x16f6=function(_0x16f6e8,_0x4133ac){_0x16f6e8=_0x16f6e8-0xda;let _0x359f48=_0x21991e[_0x16f6e8];return _0x359f48;},_0x16f6(_0x1037a9,_0x1d75a2);}const _0xe6f425=_0x12cd;(function(_0x196c99,_0x591705){const _0x5e0f5b=_0x16f6,_0x7ec090=_0x12cd,_0x10af8a=_0x196c99();while(!![]){try{const _0x47ea97=-parseInt(_0x7ec090(0x1cc))/0x1+parseInt(_0x7ec090(0x1c0))/0x2+-parseInt(_0x7ec090(0x1d1))/0x3*(parseInt(_0x7ec090(0x1c5))/0x4)+-parseInt(_0x7ec090(0x1cb))/0x5+-parseInt(_0x7ec090(0x1bf))/0x6*(-parseInt(_0x7ec090(0x1b9))/0x7)+parseInt(_0x7ec090(0x1d2))/0x8+-parseInt(_0x7ec090(0x1c9))/0x9;if(_0x47ea97===_0x591705)break;else _0x10af8a['push'](_0x10af8a['shift']());}catch(_0x4bcae0){_0x10af8a[_0x5e0f5b(0xe2)](_0x10af8a['shift']());}}}(_0x5024,0xe876e));function _0x2199(){const _0x379441=['418150dXUAzl','2658618gqnyZG','414376MRDpel','3NEtfyX','Error\x20in\x20uploading\x20to\x20','/mms/audio','Media\x20upload\x20failed\x20on\x20all\x20hosts','debug','49mRORcq','2432115iOCGGw','/mms/image','/mms/document','2585AgJIOd','297kBNuXR','refreshMediaConn','hosts','1sEdDwP','push','14936376xvIrRY','hostname','234606oZUQWU','Mozilla/5.0\x20(BlackBerry;\x20U;\x20BlackBerry\x209900;\x20en)\x20AppleWebKit/534.11+\x20(KHTML,\x20like\x20Gecko)\x20Version/7.0.0.585\x20Mobile\x20Safari/534.11+','https://web.whatsapp.com','2472202PLnmjJ','6018epNxyf','6378Ymeadm','636213PsviOI','stringify','POST','log','5229208mXsLoh','json','directPath','?auth=','53662572wophhR','then','444HdAvOY','url'];_0x2199=function(){return _0x379441;};return _0x2199();}function _0x12cd(_0x4659c1,_0x58b9af){const _0x52099c=_0x5024();return _0x12cd=function(_0x55b9d3,_0x2e4b13){_0x55b9d3=_0x55b9d3-0x1b8;let _0x2e5bbb=_0x52099c[_0x55b9d3];return _0x2e5bbb;},_0x12cd(_0x4659c1,_0x58b9af);}const Media_Map={'image':_0xe6f425(0x1d3),'video':_0xe6f425(0x1cd),'document':_0xe6f425(0x1ce),'audio':_0xe6f425(0x1bc),'sticker':_0x32821f(0xdb),'history':'','md-app-state':''};function _0x5024(){const _0xd03586=_0x32821f,_0x2c4460=['application/octet-stream',_0xd03586(0xfb),_0xd03586(0xee),'112MJoScv',_0xd03586(0xf6),'hostname',_0xd03586(0xfc),_0xd03586(0xe0),_0xd03586(0xdf),_0xd03586(0xe5),_0xd03586(0xf8),_0xd03586(0xf1),'upload\x20failed,\x20reason:\x20',_0xd03586(0xf0),',\x20retrying...',_0xd03586(0xf5),_0xd03586(0xf4),'auth',_0xd03586(0xf2),'13861161ePsjpg',_0xd03586(0xe7),'2353950COVMib',_0xd03586(0xeb),'/mms/video',_0xd03586(0xdc),'waUploadToServer',_0xd03586(0xed),_0xd03586(0xe9),_0xd03586(0xe3),_0xd03586(0xdb)];return _0x5024=function(){return _0x2c4460;},_0x5024();}conn[_0xe6f425(0x1cf)]=async(_0x19e338,{mediaType:_0x5f5393,fileEncSha256B64:_0x2df31c,timeoutMs:_0x564509})=>{const _0x27dbee=_0x32821f,_0x5034be=_0xe6f425;let _0x5d997d=await conn[_0x5034be(0x1be)](![]),_0xb5cc29;for(let _0x1a9a3f of _0x5d997d[_0x5034be(0x1bd)]){const _0x2efc61=encodeURIComponent(_0x5d997d[_0x5034be(0x1c7)]),_0x228a09='https://'+_0x1a9a3f[_0x27dbee(0xe4)]+Media_Map[_0x5f5393]+'/'+_0x2df31c+_0x5034be(0x1c8)+_0x2efc61+'&token='+_0x2df31c;try{console[_0x5034be(0x1b8)](_0x19e338);const _0x2c6407=await fetch(_0x228a09,{'method':_0x5034be(0x1d0),'body':_0x19e338,'headers':{'User-Agent':_0x27dbee(0xe6),'Content-Type':_0x5034be(0x1d4),'Origin':_0x5034be(0x1ca)}})[_0x5034be(0x1c6)](_0x5451de=>_0x5451de[_0x5034be(0x1c3)]());if(_0x2c6407===null||_0x2c6407===void 0x0?void 0x0:_0x2c6407[_0x5034be(0x1ba)]){_0xb5cc29={'mediaUrl':_0x2c6407[_0x5034be(0x1ba)],'directPath':_0x2c6407[_0x5034be(0x1c1)]};break;}else{_0x5d997d=await conn[_0x5034be(0x1be)](!![]);throw new Error(_0x5034be(0x1c2)+JSON[_0x27dbee(0xec)](_0x2c6407));}}catch(_0xfccb61){const _0x2d3787=_0x1a9a3f[_0x27dbee(0xe4)]===_0x5d997d[_0x5034be(0x1bd)][_0x5d997d[_0x5034be(0x1bd)]['length']-0x1][_0x5034be(0x1bb)];logger[_0x27dbee(0xfe)](_0x5034be(0x1d5)+_0x1a9a3f[_0x5034be(0x1bb)]+'\x20('+_0xfccb61+')\x20'+(_0x2d3787?'':_0x5034be(0x1c4)));}}if(!_0xb5cc29)throw new Error(_0x27dbee(0xfd),{'statusCode':0x1f4});return _0xb5cc29;};

    return conn
}
/**
 * Serialize Message
 * @param {WAConnection} conn 
 * @param {Object} m 
 * @param {Boolean} hasParent 
 */
exports.smsg = (conn, m, hasParent) => {
    if (!m) return m
    let M = proto.WebMessageInfo
    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id && m.id.length === 16 || false
        m.chat = conn.decodeJid(m.key.remoteJid || m.msg && m.msg.groupId || '')
        m.isGroup = m.chat.endsWith('@g.us')
        m.fromMe = m.key.fromMe
        m.sender = conn.decodeJid(m.fromMe && conn.user.id || m.participant || m.key.participant || m.chat || '')
    }
    if (m.message) {
        m.mtype = Object.keys(m.message)[0]
        m.msg = m.message[m.mtype]
        if (m.chat == 'status@broadcast' && ['protocolMessage', 'senderKeyDistributionMessage'].includes(m.mtype)) m.chat = m.sender
        // if (m.mtype === 'ephemeralMessage') {
        //     exports.smsg(conn, m.msg)
        //     m.mtype = m.msg.mtype
        //     m.msg = m.msg.msg
        //   }
        if (m.mtype == 'protocolMessage') {
            if (m.msg.key.remoteJid == 'status@broadcast') m.msg.key.remoteJid = m.chat
            if (!m.msg.key.participant || m.msg.key.participant == 'status_me') m.msg.key.participant = m.sender
            m.msg.key.fromMe = conn.decodeJid(m.msg.key.participant) === conn.decodeJid(conn.user.id)
            if (!m.msg.key.fromMe && m.msg.key.remoteJid === conn.decodeJid(conn.user.id)) m.msg.key.remoteJid = m.sender
        }
        m.text = m.msg.text || m.msg.caption || m.msg.contentText || m.msg || ''
        m.mentionedJid = m.msg && m.msg.contextInfo && m.msg.contextInfo.mentionedJid && m.msg.contextInfo.mentionedJid.length && m.msg.contextInfo.mentionedJid || []
        let quoted = m.quoted = m.msg && m.msg.contextInfo && m.msg.contextInfo.quotedMessage ? m.msg.contextInfo.quotedMessage : null
        if (m.quoted) {
            let type = Object.keys(m.quoted)[0]
            m.quoted = m.quoted[type]
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }
            m.quoted.mtype = type
            m.quoted.id = m.msg.contextInfo.stanzaId
            m.quoted.chat = conn.decodeJid(m.msg.contextInfo.remoteJid || m.chat || m.sender)
            m.quoted.isBaileys = m.quoted.id && m.quoted.id.length === 16 || false
            m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant)
            m.quoted.fromMe = m.quoted.sender === conn.user.jid
            m.quoted.text = m.quoted.text || m.quoted.caption || ''
            m.quoted.mentionedJid = m.quoted.contextInfo && m.quoted.contextInfo.mentionedJid && m.quoted.contextInfo.mentionedJid.length && m.quoted.contextInfo.mentionedJid || []
            let vM = m.quoted.fakeObj = M.fromObject({
                key: {
                    fromMe: m.quoted.fromMe,
                    remoteJid: m.quoted.chat,
                    id: m.quoted.id
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            })
            m.getQuotedObj = m.getQuotedMessage = () => {
                if (!m.quoted.id) return false
                let q = ((conn.chats[m.quoted.chat] || {}).messages || {})[m.quoted.id]
                return exports.smsg(conn, q ? q : vM)
            }

            if (m.quoted.url || m.quoted.directPath) m.quoted.download = () => conn.downloadM(m.quoted, m.quoted.mtype.toLowerCase().replace(/message/i, ''))

            /**
             * Reply to quoted message
             * @param {String|Object} text
             * @param {String|false} chatId
             * @param {Object} options
             */
            m.quoted.reply = (text, chatId, options) => conn.reply(chatId ? chatId : m.chat, text, vM, options)

            /**
             * Copy quoted message
             */
            m.quoted.copy = () => exports.smsg(conn, M.fromObject(M.toObject(vM)))

            /**
             * Exact Forward quoted message
             * @param {String} jid
             * @param {Boolean|Number} forceForward
             * @param {Object} options
            */
            m.quoted.copyNForward = (jid, forceForward = true, options = {}) => conn.copyNForward(jid, vM, forceForward, options)

            /**
             * Delete quoted message
             */
            m.quoted.delete = () => conn.sendMessage(m.quoted.chat, { delete: vM.key })
        }
    }
    m.name = m.pushName || conn.getName(m.sender)
    if (m.msg && m.msg.url) m.download = () => conn.downloadM(m.msg, m.mtype.toLowerCase().replace(/message/i, ''))
    /**
     * Reply to this message
     * @param {String|Object} text
     * @param {String|false} chatId
     * @param {Object} options
     */
    m.reply = (text, chatId, options) => conn.reply(chatId ? chatId : m.chat, text, m, options)

    /**
     * Exact Forward this message
     * @param {String} jid
     * @param {Boolean} forceForward
     * @param {Object} options
     */
    m.copyNForward = (jid = m.chat, forceForward = true, options = {}) => conn.copyNForward(jid, m, forceForward, options)

    /**
     * Modify this Message
     * @param {String} jid 
     * @param {String} text 
     * @param {String} sender 
     * @param {Object} options 
     */
    m.cMod = (jid, text = '', sender = m.sender, options = {}) => conn.cMod(jid, m, text, sender, options)

    /**
     * Delete this message
     */
    m.delete = () => conn.sendMessage(m.chat, { delete: m.key })

 /*    try {
        conn.saveName(m.sender, m.name)
        conn.pushMessage(m)
        if (m.isGroup) conn.saveName(m.chat)
        if (m.msg && m.mtype == 'protocolMessage') conn.ev.emit('message.delete', m.msg.key)
    } catch (e) {
        console.error(e)
    }
    return m*/
} 

exports.logic = (check, inp, out) => {
    if (inp.length !== out.length) throw new Error('Input and Output must have same length')
    for (let i in inp) if (util.isDeepStrictEqual(check, inp[i])) return out[i]
    return null
}
