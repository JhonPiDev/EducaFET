const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { sequelize } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Seguridad
app.use(helmet());
app.use(cors());
app.use(express.json());

// Límite de peticiones
const limiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
app.use(limiter);

// Test DB
sequelize.authenticate()
  .then(() => console.log("📦 Conectado a MySQL con Sequelize"))
  .catch(err => console.error("❌ Error de conexión:", err));

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ msg: "EducaFET API con MySQL funcionando 🚀" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en puerto ${PORT}`);
});
