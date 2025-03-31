const mongoose = require("mongoose");

const trickSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "O nome da manobra é obrigatório"],
    trim: true,
    maxlength: [50, "O nome da manobra não pode exceder 50 caracteres"]
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ["Aprender", "Aprimorar", "Na Base"],
      message: "Status inválido para a manobra"
    },
    default: "Aprender"
  },
  observations: {
    type: String,
    trim: true,
    maxlength: [500, "As observações não podem exceder 500 caracteres"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastPracticed: {
    type: Date
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

const obstacleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "O nome do obstáculo é obrigatório"],
    trim: true,
    unique: true,
    maxlength: [50, "O nome do obstáculo não pode exceder 50 caracteres"]
  },
  tricks: [trickSchema],
}, {
  timestamps: true
});

// Índices para melhorar performance nas consultas frequentes
obstacleSchema.index({ name: 1 }); // Índice no nome do obstáculo
obstacleSchema.index({ "tricks.status": 1 }); // Índice no status das manobras

const Obstacle = mongoose.model("Obstacle", obstacleSchema);

module.exports = Obstacle;