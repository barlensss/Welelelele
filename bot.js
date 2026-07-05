// ==========================================
// 💀 BARA BOT - TELEGRAM BOT
// 🔥 3 GAMBAR + MENU JADI SATU!
// ==========================================

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ========== KONFIGURASI ==========
const TOKEN = '8747125708:AAHntTqfu7wRItJbddKFLNAsBZaqL6Vp3aU';
const DEVELOPER_ID = '8329321481';

const bot = new TelegramBot(TOKEN, { 
    polling: {
        timeout: 30,
        limit: 10,
        autoStart: true
    }
});

// ========== 3 GAMBAR ==========
const GAMBAR = [
    path.join(__dirname, 'my.jpg'),
    path.join(__dirname, 'my1.jpg'),
    path.join(__dirname, 'my2.jpg')
];

// ========== GET GAMBAR RANDOM ==========
function getRandomImage() {
    const available = GAMBAR.filter(img => fs.existsSync(img));
    if (available.length === 0) {
        return 'https://files.catbox.moe/wdz5i4.jpg';
    }
    return available[Math.floor(Math.random() * available.length)];
}

// ========== MENU CAPTION ==========
const MENU_CAPTION = `
╔══════════════════════════════════════════╗
║  💀 𝗕𝗔𝗥𝗔 𝗕𝗢𝗧 - 𝗧𝗢𝗢𝗟𝗦 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 ║
║  🔥 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗙𝗘𝗔𝗧𝗨𝗥𝗘𝗦            ║
╚══════════════════════════════════════════╝

📜 *MENU UTAMA:*

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  𝗙𝗜𝗧𝗨𝗥 𝗡𝗬𝗔 𝗠𝗘𝗡                 ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ /jadihitam → Ubah kulit jadi hitam┃
┃ /brat [text] → Buat sticker brat ┃
┃ /menu → Menu ini                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 👑 *DEVELOPER ONLY*              ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ /list → Lihat daftar user        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📋 *INFO*                        ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ /help → Bantuan                  ┃
┃ /status → Status bot             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

💀 *TETAP GAS!*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Credit:* Bara
🤖 *Bot:* @baratrision_bot
📥 *Bot Tools Downloader*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

// ========== FUNGSI KIRIM MENU ==========
async function sendMenu(chatId) {
    const image = getRandomImage();
    
    try {
        await bot.sendPhoto(chatId, image, {
            caption: MENU_CAPTION,
            parse_mode: 'Markdown'
        });
    } catch (error) {
        console.log('Gagal kirim gambar:', error.message);
        await bot.sendMessage(chatId, MENU_CAPTION, { parse_mode: 'Markdown' });
    }
}

// ========== COMMAND: START ==========
bot.onText(/^\/start$/, async (msg) => {
    await sendMenu(msg.chat.id);
});

// ========== COMMAND: MENU ==========
bot.onText(/^\/menu$/, async (msg) => {
    await sendMenu(msg.chat.id);
});

// ========== COMMAND: JADIHITAM ==========
bot.onText(/^\/jadihitam$/i, async (msg) => {
    const chatId = msg.chat.id;
    const reply = msg.reply_to_message;

    if (!reply || !reply.photo) {
        return bot.sendMessage(chatId, "❌ Reply gambar + /jadihitam");
    }

    try {
        const fileId = reply.photo[reply.photo.length - 1].file_id;
        const file = await bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;

        await bot.sendMessage(chatId, "⏳ Processing...");

        const { data } = await axios.get(
            "https://api.ikyyxd.my.id/edit/nanobananav3",
            {
                params: {
                    prompt: "ubahkan kulit nya menjadi hitam",
                    url: fileUrl,
                },
                timeout: 30000
            }
        );

        if (!data.status) {
            return bot.sendMessage(chatId, "❌ Gagal!");
        }

        await bot.sendPhoto(chatId, data.result.result_url, {
            caption: "✅ JADI HITAM!\n\n👤 Bara | @baratrision_bot"
        });
    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, "❌ Error!");
    }
});

// ========== COMMAND: BRAT ==========
bot.onText(/^\/brat(?:\s+(.+))?$/i, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match?.[1];

    if (!text) {
        return bot.sendMessage(chatId, "❌ /brat Halo");
    }

    const loading = await bot.sendMessage(chatId, "⏳ Making sticker...");

    try {
        const url = `https://api-mininxd.vercel.app/brat?txt=${encodeURIComponent(text)}`;
        const res = await axios.get(url, { responseType: "arraybuffer" });
        const buffer = Buffer.from(res.data);

        await bot.sendSticker(chatId, buffer);
        await bot.deleteMessage(chatId, loading.message_id);
    } catch (err) {
        console.error(err);
        try { await bot.deleteMessage(chatId, loading.message_id); } catch (e) {}
        bot.sendMessage(chatId, "❌ Gagal!");
    }
});

// ========== COMMAND: HELP ==========
bot.onText(/^\/help$/, async (msg) => {
    const chatId = msg.chat.id;
    const image = getRandomImage();
    
    const helpCaption = `
📋 *BANTUAN LENGKAP*

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  *COMMAND*                     ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ /start → Mulai bot               ┃
┃ /menu → Menu utama               ┃
┃ /jadihitam → Jadi hitam        ┃
┃ /brat [text] → Sticker brat      ┃
┃ /list → List user (Dev only)     ┃
┃ /help → Bantuan ini              ┃
┃ /status → Status bot             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Credit:* Bara
🤖 *Bot:* @baratrision_bot
📥 *Bot Tools Downloader*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
    
    try {
        await bot.sendPhoto(chatId, image, {
            caption: helpCaption,
            parse_mode: 'Markdown'
        });
    } catch (error) {
        await bot.sendMessage(chatId, helpCaption, { parse_mode: 'Markdown' });
    }
});

// ========== COMMAND: STATUS ==========
bot.onText(/^\/status$/, (msg) => {
    const chatId = msg.chat.id;
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    bot.sendMessage(chatId, `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 📊 *STATUS BOT*                  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ Status: ✅ Online                ┃
┃ Uptime: ${hours}h ${minutes}m        ┃
┃ Developer: ${DEVELOPER_ID}         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Bara | @baratrision_bot
    `, { parse_mode: 'Markdown' });
});

// ========== COMMAND: LIST (DEV ONLY) ==========
bot.onText(/^\/list$/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    if (userId !== DEVELOPER_ID) {
        return bot.sendMessage(chatId, "❌ Akses ditolak!");
    }

    bot.sendMessage(chatId, "👑 LIST USER\nTotal: 0 user");
});

// ========== ERROR ==========
bot.on('polling_error', (error) => {
    console.log('Polling error:', error.code);
});

// ========== START ==========
console.log(`
╔══════════════════════════════════════════╗
║  💀 BARA BOT - TELEGRAM BOT            ║
║  🔥 3 GAMBAR + MENU JADI SATU!         ║
╚══════════════════════════════════════════╝
`);
console.log('✅ BOT RUNNING!');