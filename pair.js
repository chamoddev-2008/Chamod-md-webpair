const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function WHITESHADOW_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            const items = ["Safari"];
            function selectRandomItem(array) {
                const randomIndex = Math.floor(Math.random() * array.length);
                return array[randomIndex];
            }
            const randomItem = selectRandomItem(items);

            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS(randomItem)
            });

            // --- CUSTOM PAIRING CODE ---
            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const customCode = "CHAMODMD"; // Fixed 8-character pairing code
                const code = await sock.requestPairingCode(num, customCode);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    await delay(5000);
                    const rf = __dirname + `/temp/${id}/creds.json`;

                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        const md = "CHAMOD~MD=" + string_session;

                        const codeMsg = await sock.sendMessage(sock.user.id, { text: md });

                        const desc = `*🧚 𝗖𝗛𝗔𝗠𝗢𝗗-𝗠𝗗 𝐕 1.0.0 🧚 New Update.....🇦🇴*
                        
* SESION SUCCESSFUL ✅
                        
*උඩ ආපු Sesion Id එක ශෙයා කරන්න එපා හොදද 😩🪄💐*
                        
+ ┉┉┉┉┉┉┉┉[ ❤️‍🩹 ]┉┉┉┉┉┉┉┉ +
*❗𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 𝐆𝐑𝐎𝐔𝐏*
* https://chat.whatsapp.com/HsGBHJlfds4IyH1jKgdQ0V?mode=hqrt2
                        
*❗𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 𝐂𝐇𝐀𝐍𝐍𝐄𝐋*
* https://whatsapp.com/channel/0029Vb6xMopEQIapiWyp4L1w
                        
*❗𝐑𝐀𝐒𝐇𝐔 𝐂𝐎𝐍𝐓𝐀𝐂𝐓*
* https://wa.me/+94761480834/?text=💙🅷🅴🆈_🅲🅷🅰🅼🅾🅳_🅳🅴🆅💙
                
> 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐃 𝐁𝐘 𝐂𝐇𝐀𝐌𝐎𝐃 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 💙`;

                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "CHAMOD-MD",
                                    thumbnailUrl: "https://i.ibb.co/7Jb04K7P/tourl-1765562658810.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029Vb6xMopEQIapiWyp4L1w",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }
                            }
                        }, { quoted: codeMsg });

                    } catch (e) {
                        console.log("Error sending session:", e);
                        if (!res.headersSent) {
                            await res.send({ code: "❗ Service Unavailable" });
                        }
                    }

                    await delay(10);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);

                    console.log(`👤 ${sock.user.id} 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 ✅ 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀...`);
                    await delay(10);
                    process.exit();
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10);
                    WHITESHADOW_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log("Service restarted due to error:", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "❗ Service Unavailable" });
            }
        }
    }

    return await WHITESHADOW_PAIR_CODE();
});

module.exports = router;
