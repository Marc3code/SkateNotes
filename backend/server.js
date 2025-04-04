const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
require('./database');
const Obstacle = require('./models/obstacle');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Rotas para Obstáculos
app.get('/obstacles', async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        
        if (status) {
            query = { 'tricks.status': status };
        }
        
        const obstacles = await Obstacle.find(query);
        res.json(obstacles);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar obstáculos', details: error.message });
    }
});

app.get('/obstacles/:id', async (req, res) => {
    try {
        const obstacle = await Obstacle.findById(req.params.id);
        if (!obstacle) {
            return res.status(404).json({ error: 'Obstáculo não encontrado' });
        }
        res.json(obstacle);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar obstáculo', details: error.message });
    }
});

app.post('/obstacles', async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Nome do obstáculo é obrigatório' });
        }
        
        const existingObstacle = await Obstacle.findOne({ name });
        if (existingObstacle) {
            return res.status(400).json({ error: 'Já existe um obstáculo com este nome' });
        }
        
        const newObstacle = new Obstacle({ name });
        await newObstacle.save();
        res.status(201).json(newObstacle);
    } catch (error) {
        res.status(500).json({ 
            error: 'Erro ao criar obstáculo', 
            details: error.message 
        });
    }
});

app.put('/obstacles/:id', async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Nome do obstáculo é obrigatório' });
        }
        
        const updatedObstacle = await Obstacle.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true, runValidators: true }
        );
        
        if (!updatedObstacle) {
            return res.status(404).json({ error: 'Obstáculo não encontrado' });
        }
        
        res.json(updatedObstacle);
    } catch (error) {
        res.status(500).json({ 
            error: 'Erro ao atualizar obstáculo', 
            details: error.message 
        });
    }
});

app.delete('/obstacles/:id', async (req, res) => {
    try {
        const deletedObstacle = await Obstacle.findByIdAndDelete(req.params.id);
        
        if (!deletedObstacle) {
            return res.status(404).json({ error: 'Obstáculo não encontrado' });
        }
        
        res.json({ message: 'Obstáculo removido com sucesso' });
    } catch (error) {
        res.status(500).json({ 
            error: 'Erro ao remover obstáculo', 
            details: error.message 
        });
    }
});

// Rotas para Manobras (Tricks)
app.post('/obstacles/:obstacleId/tricks', async (req, res) => {
    try {
        const { name, status, observations, difficulty } = req.body;
        
        if (!name || !status) {
            return res.status(400).json({ 
                error: 'Nome e status da manobra são obrigatórios' 
            });
        }
        
        const obstacle = await Obstacle.findById(req.params.obstacleId);
        if (!obstacle) {
            return res.status(404).json({ error: 'Obstáculo não encontrado' });
        }
        
        const newTrick = {
            name,
            status,
            observations: observations || '',
            difficulty: difficulty || 3
        };
        
        obstacle.tricks.push(newTrick);
        await obstacle.save();
        
        res.status(201).json(obstacle);
    } catch (error) {
        res.status(500).json({ 
            error: 'Erro ao adicionar manobra', 
            details: error.message 
        });
    }
});

app.put('/obstacles/:obstacleId/tricks/:trickId', async (req, res) => {
    try {
        const { name, status, observations, difficulty } = req.body;
        const { obstacleId, trickId } = req.params;
        
        const obstacle = await Obstacle.findById(obstacleId);
        if (!obstacle) {
            return res.status(404).json({ error: 'Obstáculo não encontrado' });
        }
        
        const trickIndex = obstacle.tricks.findIndex(t => t._id.toString() === trickId);
        if (trickIndex === -1) {
            return res.status(404).json({ error: 'Manobra não encontrada' });
        }
        
        if (name) obstacle.tricks[trickIndex].name = name;
        if (status) obstacle.tricks[trickIndex].status = status;
        if (observations !== undefined) obstacle.tricks[trickIndex].observations = observations;
        if (difficulty) obstacle.tricks[trickIndex].difficulty = difficulty;
        
        obstacle.tricks[trickIndex].lastPracticed = new Date();
        await obstacle.save();
        
        res.json(obstacle.tricks[trickIndex]);
    } catch (error) {
        res.status(500).json({ 
            error: 'Erro ao atualizar manobra', 
            details: error.message 
        });
    }
});

app.delete('/obstacles/:obstacleId/tricks/:trickId', async (req, res) => {
    try {
        const { obstacleId, trickId } = req.params;
        
        const obstacle = await Obstacle.findById(obstacleId);
        if (!obstacle) {
            return res.status(404).json({ error: 'Obstáculo não encontrado' });
        }
        
        const trickIndex = obstacle.tricks.findIndex(t => t._id.toString() === trickId);
        if (trickIndex === -1) {
            return res.status(404).json({ error: 'Manobra não encontrada' });
        }
        
        obstacle.tricks.splice(trickIndex, 1);
        await obstacle.save();
        
        res.json({ message: 'Manobra removida com sucesso' });
    } catch (error) {
        res.status(500).json({ 
            error: 'Erro ao remover manobra', 
            details: error.message 
        });
    }
});

// Rota para filtrar manobras por status
app.get('/tricks', async (req, res) => {
    try {
        const { status } = req.query;
        
        if (!status) {
            return res.status(400).json({ error: 'Parâmetro status é obrigatório' });
        }
        
        const obstacles = await Obstacle.find({ 'tricks.status': status });
        const tricks = obstacles.flatMap(obstacle => 
            obstacle.tricks
                .filter(trick => trick.status === status)
                .map(trick => ({
                    ...trick.toObject(),
                    obstacleName: obstacle.name,
                    obstacleId: obstacle._id
                }))
        );
        
        res.json(tricks);
    } catch (error) {
        res.status(500).json({ 
            error: 'Erro ao buscar manobras', 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));