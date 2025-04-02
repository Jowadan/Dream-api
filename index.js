const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Criar esquema e modelo de sonhos
const dreamSchema = new mongoose.Schema({
    keyword: { type: String, unique: true, required: true },
    meaning: { type: String, required: true }
});
const Dream = mongoose.model('Dream', dreamSchema);

// Endpoint para interpretar sonhos
app.post('/interpretar', async (req, res) => {
    const { texto } = req.body;
    if (!texto) return res.status(400).json({ error: 'Texto do sonho é obrigatório' });

    try {
        const dream = await Dream.findOne({ keyword: texto.toLowerCase() });
        if (!dream) return res.status(404).json({ message: 'Nenhuma interpretação encontrada' });
        res.json({ significado: dream.meaning });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para adicionar significados
app.post('/significados', async (req, res) => {
    const { keyword, meaning } = req.body;
    if (!keyword || !meaning) return res.status(400).json({ error: 'Palavra-chave e significado são obrigatórios' });

    try {
        const newDream = new Dream({ keyword: keyword.toLowerCase(), meaning });
        await newDream.save();
        res.json(newDream);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
