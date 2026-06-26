const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Route utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API scan
app.post('/api/scan', async (req, res) => {
  const { target } = req.body;
  
  if (!target || !target.startsWith('http')) {
    return res.status(400).json({ error: 'URL tidak valid. Masukkan format https://...' });
  }

  try {
    const domain = new URL(target).hostname.replace(/^www\./, '');
    
    // Simulasi proses scan (5 detik)
    await new Promise(r => setTimeout(r, 5000));

    const files = [
      {
        name: `config_${domain}.json`,
        size: '3.2 KB',
        content: JSON.stringify({
          server: domain,
          backend: ['Node.js', 'Express'],
          db: 'MongoDB',
          env: { NODE_ENV: 'production', PORT: 3000 },
          admin: true,
          vuln: ['CVE-2021-44228', 'CVE-2022-22965']
        }, null, 2)
      },
      {
        name: `database_dump_${domain}.sql`,
        size: '122 KB',
        content: `-- Auto dumped dari ${domain}\nCREATE TABLE users (id INT, name VARCHAR(255), email VARCHAR(255), password_hash VARCHAR(255));\nINSERT INTO users VALUES (1,'admin','admin@${domain}','$2y$10$...');\n-- + 142 baris lainnya`
      },
      {
        name: `env_backup_${domain}.txt`,
        size: '0.8 KB',
        content: `DB_HOST=localhost\nDB_USER=root\nDB_PASS=admin123\nAPI_KEY=sk_live_4eC39HqLyjWDarjtT1zdp7dc\nSECRET=supersecretkey`
      },
      {
        name: `payload_${domain}.js`,
        size: '7.4 KB',
        content: `// Reverse shell payload for ${domain}\nconst net = require('net');\nconst spawn = require('child_process').spawn;\n// ...`
      },
      {
        name: `logs_${new Date().toISOString().slice(0,10)}.zip`,
        size: '2.1 MB',
        content: 'zip content (simulated)'
      }
    ];

    res.json({ 
      status: 'success', 
      message: `Scan selesai! Ditemukan ${files.length} file dari ${domain}`,
      files: files
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check untuk Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('404 - Halaman tidak ditemukan');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('500 - Terjadi error internal');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ WebCracker Pro jalan di port ${PORT}`);
  console.log(`🌐 Akses: http://localhost:${PORT}`);
});
