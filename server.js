const express = require('express');

const app = express();

app.use('/', express.static('public'));

console.log('Starting');
app.listen(3000);
