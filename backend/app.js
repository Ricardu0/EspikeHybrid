const dotenv = require("dotenv");
dotenv.config();

// Inicializa o Azure Monitor Application Insights
if (process.env.AZURE_APPINSIGHTS_CONNECTION_STRING) {
  const { useAzureMonitor } = require("@azure/monitor-opentelemetry");
  useAzureMonitor({
    azureMonitorExporterOptions: {
      connectionString: process.env.AZURE_APPINSIGHTS_CONNECTION_STRING,
    },
  });
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { router: userRouter } = require("./controller/UserController");
const authRoutes = require("./controller/AuthController");
const alertRoutes = require("./controller/AlertController");
const { authenticate } = require("./middleware/authenticate");
const occurrenceRoutes = require("./controller/OcurrenceController");
const areaRoutes = require("./controller/AreaController");
const markerRoutes = require("./controller/MarkerController");
const corsConfig = require("./config/CorsConfig");
const photoReportController = require("./controller/PhotoReportController");

const app = express();

app.use(corsConfig);

// Middleware para interpretar JSON
app.use(express.json());

// Conexão com o banco de dados MongoDB
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/MeuBanco";
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB conectado!"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err.message));

// Rotas públicas
app.get("/", (req, res) => {
  res.send("Servidor Express rodando!");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await mongoose.connection.db.collection("a").findOne({});
    res.json(result);
  } catch (error) {
    res.status(500).send("Erro ao conectar ao banco de dados");
  }
});

// Rotas de autenticação
app.use("/auth", authRoutes);

// Rotas protegidas (necessitam autenticação)
app.use("/api/users", authenticate, userRouter);
app.use("/api/alerts", authenticate, alertRoutes);

// Rota de teste protegida
app.use("/protected", authenticate, (req, res) => {
  res.send("Rota protegida, você está autenticado!");
});

// Rota para ocorrencias (Protegida)
app.use("/api/occurrences", authenticate, occurrenceRoutes);

// Rota para marcadores (Protegida)
app.use("/api/markers", authenticate, markerRoutes);

// Rota para areas (zonas) (Protegida)
app.use("/api/areas", authenticate, areaRoutes);

// Rota para reportes de foto (nova funcionalidade Azure)
const photoReportRoutes = require("./controller/PhotoReportController");
app.use("/api/photo-reports", photoReportRoutes);

// Iniciar o servidor
const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
