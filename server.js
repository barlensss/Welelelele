const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware biar gak error
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Route utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback 404
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
});
