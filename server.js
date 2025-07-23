const express = require('express');
const app = express();
const PORT = 3000; 

app.use(express.json())

app.get('/', (req, res) => {
    res.json('Hello Eyego');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});