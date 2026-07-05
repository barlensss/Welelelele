const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const http = require('http');
const crypto = require('crypto');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

// ==================== STORAGE ====================
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = ['.apk', '.js', '.py', '.exe', '.bat', '.sh', '.php', '.jar', '.dll', '.so', '.bin', '.elf'];
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(ext));
    },
    limits: { fileSize: 100 * 1024 * 1024 }
});

// ==================== VIRUS DATABASE ====================
class VirusDB {
    constructor() {
        this.signatures = [
            // Android Malware
            { id: 'AND-001', name: 'Joker Malware', type: 'Android', severity: 'CRITICAL', patterns: ['joker', 'sms_subscription', 'premium_rate', 'wifi_sms'] },
            { id: 'AND-002', name: 'BankBot', type: 'Android', severity: 'CRITICAL', patterns: ['overlay', 'accessibility', 'banking', 'credential'] },
            { id: 'AND-003', name: 'XLoader', type: 'Android', severity: 'HIGH', patterns: ['xloader', 'sms_spam', 'device_info', 'contact_steal'] },
            { id: 'AND-004', name: 'Triada', type: 'Android', severity: 'HIGH', patterns: ['triada', 'root_access', 'system_privilege'] },
            { id: 'AND-005', name: 'Anubis', type: 'Android', severity: 'CRITICAL', patterns: ['anubis', 'banking_trojan', 'keylogger'] },
            { id: 'AND-006', name: 'Cerberus', type: 'Android', severity: 'CRITICAL', patterns: ['cerberus', 'overlay_attack', 'sms_forward'] },
            { id: 'AND-007', name: 'GinMaster', type: 'Android', severity: 'HIGH', patterns: ['ginmaster', 'root_exploit', 'system_app'] },
            
            // JavaScript Malware
            { id: 'JS-001', name: 'CryptoMiner', type: 'JavaScript', severity: 'HIGH', patterns: ['cryptonight', 'coinhive', 'miner', 'webassembly'] },
            { id: 'JS-002', name: 'XSS Injector', type: 'JavaScript', severity: 'MEDIUM', patterns: ['eval(', 'document.cookie', 'xss', 'window.location'] },
            { id: 'JS-003', name: 'Data Stealer', type: 'JavaScript', severity: 'HIGH', patterns: ['localStorage', 'sessionStorage', 'steal', 'credentials'] },
            { id: 'JS-004', name: 'Keylogger JS', type: 'JavaScript', severity: 'CRITICAL', patterns: ['addEventListener', 'keydown', 'keyup', 'keystroke'] },
            { id: 'JS-005', name: 'Drive-By Download', type: 'JavaScript', severity: 'HIGH', patterns: ['window.open', 'download', 'auto_download'] },
            { id: 'JS-006', name: 'WebSocket Sniffer', type: 'JavaScript', severity: 'MEDIUM', patterns: ['WebSocket', 'ws://', 'wss://', 'message_intercept'] },
            
            // Python Malware
            { id: 'PY-001', name: 'Ransomware', type: 'Python', severity: 'CRITICAL', patterns: ['fernet', 'encrypt', 'ransom', 'decrypt', 'cryptography'] },
            { id: 'PY-002', name: 'Keylogger Python', type: 'Python', severity: 'HIGH', patterns: ['pynput', 'keyboard', 'on_press', 'logger'] },
            { id: 'PY-003', name: 'Reverse Shell', type: 'Python', severity: 'CRITICAL', patterns: ['socket.connect', 'subprocess', 'reverse_shell', 'bind_shell'] },
            { id: 'PY-004', name: 'Trojan', type: 'Python', severity: 'HIGH', patterns: ['os.system', 'subprocess.call', 'malware', 'persistence'] },
            { id: 'PY-005', name: 'DDoS Bot', type: 'Python', severity: 'HIGH', patterns: ['socket.socket', 'UDP_flood', 'botnet'] },
            { id: 'PY-006', name: 'Data Exfiltrator', type: 'Python', severity: 'MEDIUM', patterns: ['requests.post', 'upload', 'exfiltrate'] },
            
            // Executable Malware
            { id: 'EXE-001', name: 'WannaCry', type: 'Executable', severity: 'CRITICAL', patterns: ['mssecsvc', 'tasksche', 'wannacry', 'decryptor'] },
            { id: 'EXE-002', name: 'Trojan Downloader', type: 'Executable', severity: 'HIGH', patterns: ['download_payload', 'malware_downloader', 'execute_remote'] },
            { id: 'EXE-003', name: 'SpyAgent', type: 'Executable', severity: 'HIGH', patterns: ['keylog', 'screen_capture', 'clipboard', 'monitor'] },
            { id: 'EXE-004', name: 'Zeus Botnet', type: 'Executable', severity: 'CRITICAL', patterns: ['zeus', 'web_inject', 'banking_trojan'] },
            { id: 'EXE-005', name: 'Mimikatz', type: 'Executable', severity: 'CRITICAL', patterns: ['mimikatz', 'sekurlsa', 'kerberos', 'password_dump'] },
            
            // PHP Malware
            { id: 'PHP-001', name: 'Web Shell', type: 'PHP', severity: 'CRITICAL', patterns: ['eval($_POST', 'base64_decode', 'system($_GET', 'shell_exec'] },
            { id: 'PHP-002', name: 'Backdoor', type: 'PHP', severity: 'HIGH', patterns: ['backdoor', 'remote_access', 'file_manager'] },
            { id: 'PHP-003', name: 'C99 Shell', type: 'PHP', severity: 'CRITICAL', patterns: ['c99shell', 'php_shell', 'web_backdoor'] }
        ];
    }

    scan(content, filename) {
        const results = [];
        const str = content.toString().toLowerCase();
        const type = path.extname(filename).toLowerCase();

        // Pattern matching
        for (const sig of this.signatures) {
            const sigType = sig.type.toLowerCase();
            if (type.includes(sigType) || sigType === type.replace('.', '')) {
                let matches = 0;
                for (const p of sig.patterns) {
                    if (str.includes(p.toLowerCase())) matches++;
                }
                if (matches > 0) {
                    const confidence = Math.min(100, (matches / sig.patterns.length) * 100 + 30);
                    results.push({ 
                        ...sig, 
                        detection: 'Pattern Match', 
                        confidence: Math.round(confidence),
                        matches: matches,
                        totalPatterns: sig.patterns.length
                    });
                }
            }
        }

        // Heuristic - JavaScript
        if (type === '.js') {
            let score = 0;
            const jsPatterns = [
                { p: 'eval\\s*\\(', w: 20 },
                { p: 'base64_decode', w: 15 },
                { p: 'document\\.write', w: 10 },
                { p: 'unescape\\s*\\(', w: 10 },
                { p: 'String\\.fromCharCode', w: 15 },
                { p: 'window\\[.*\\]\\s*=', w: 10 },
                { p: 'constructor\\s*\\(', w: 10 },
                { p: 'prototype\\s*=', w: 10 },
                { p: 'while\\s*\\(true\\)', w: 10 },
                { p: 'atob\\s*\\(', w: 15 }
            ];
            for (const p of jsPatterns) {
                if (new RegExp(p.p, 'i').test(str)) score += p.w;
            }
            if (score > 50) {
                results.push({
                    id: 'HEUR-JS-001',
                    name: 'Suspicious JavaScript',
                    type: 'JavaScript',
                    severity: score > 80 ? 'HIGH' : 'MEDIUM',
                    detection: 'Heuristic Analysis',
                    confidence: Math.min(100, score),
                    details: 'Contains obfuscated or suspicious JS patterns'
                });
            }
        }

        // Heuristic - Python
        if (type === '.py') {
            let score = 0;
            const pyPatterns = [
                { p: 'exec\\s*\\(', w: 20 },
                { p: 'eval\\s*\\(', w: 20 },
                { p: '__import__\\s*\\(', w: 15 },
                { p: 'subprocess\\.', w: 15 },
                { p: 'os\\.system', w: 15 },
                { p: 'socket\\.connect', w: 15 },
                { p: 'pickle\\.loads', w: 10 },
                { p: 'compile\\s*\\(', w: 10 }
            ];
            for (const p of pyPatterns) {
                if (new RegExp(p.p, 'i').test(str)) score += p.w;
            }
            if (score > 50) {
                results.push({
                    id: 'HEUR-PY-001',
                    name: 'Suspicious Python Script',
                    type: 'Python',
                    severity: score > 80 ? 'HIGH' : 'MEDIUM',
                    detection: 'Heuristic Analysis',
                    confidence: Math.min(100, score),
                    details: 'Contains suspicious Python patterns'
                });
            }
        }

        return results;
    }
}

const virusDB = new VirusDB();

// ==================== WEBSOCKET ====================
wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to Virus Scanner' }));

    ws.on('message', async (msg) => {
        try {
            const data = JSON.parse(msg);
            if (data.type === 'scan') {
                ws.send(JSON.stringify({ type: 'scan_started', message: `Scanning ${data.filename}...` }));
                
                // Simulate progress
                for (let i = 0; i <= 100; i += 10) {
                    await new Promise(r => setTimeout(r, 80));
                    ws.send(JSON.stringify({ type: 'scan_progress', progress: i }));
                }
                
                const results = virusDB.scan(Buffer.from(data.content, 'base64'), data.filename);
                ws.send(JSON.stringify({
                    type: 'scan_complete',
                    filename: data.filename,
                    results,
                    totalThreats: results.length,
                    timestamp: new Date().toISOString()
                }));
            }
        } catch (e) {
            ws.send(JSON.stringify({ type: 'error', message: e.message }));
        }
    });
});

// ==================== API ENDPOINTS ====================

// Scan URL
app.post('/api/scan-url', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });
    
    try {
        const response = await fetch(url);
        const content = await response.text();
        const filename = url.split('/').pop() || 'unknown';
        const results = virusDB.scan(Buffer.from(content), filename);
        res.json({ 
            success: true, 
            filename, 
            results, 
            totalThreats: results.length, 
            timestamp: new Date().toISOString() 
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch URL', details: e.message });
    }
});

// Scan File
app.post('/api/scan-file', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    try {
        const content = fs.readFileSync(req.file.path);
        const results = virusDB.scan(content, req.file.originalname);
        fs.unlinkSync(req.file.path);
        res.json({ 
            success: true, 
            filename: req.file.originalname, 
            size: req.file.size,
            results, 
            totalThreats: results.length,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ error: 'Scan failed', details: e.message });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== START SERVER ====================
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n╔═══════════════════════════════════════╗`);
    console.log(`║  🛡️  VirusDetect Pro Server        ║`);
    console.log(`║  📡 Port: ${PORT}                      ║`);
    console.log(`║  🔒 WebSocket: Active               ║`);
    console.log(`║  🧬 Signatures: ${virusDB.signatures.length}   ║`);
    console.log(`╚═══════════════════════════════════════╝\n`);
});
