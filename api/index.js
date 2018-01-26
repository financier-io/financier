const path = require('path');
const helmet = require('helmet');
const express = require('express');
const app = express();

app.use('/docs', express.static(path.join(__dirname, '../docs')));

app.use(express.static(path.join(__dirname, '../dist')));

// Even though index.html is static, we don't want to cache it
// since the service worker does regardless of the header cache settings
// (otherwise upgrades sometimes require an extra refresh)
app.use(helmet.noCache());

app.all('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(8080, () => {
  console.log('Financier frontend listening on port 8080!');
});
