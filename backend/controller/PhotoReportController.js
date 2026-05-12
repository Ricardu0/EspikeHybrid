const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Pegando as configurações do seu .env
const AZURE_CONTAINER = "teste"; // Nome do container que você criou no portal
const SAS_EXPIRY_HOURS = 24;

const upload = multer({ storage: multer.memoryStorage() });

const azureBlob = require("@azure/storage-blob");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} = azureBlob;

// Função para gerar a URL de acesso (SAS)
function _generateSasUrl(containerClient, blobName) {
  try {
    const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const accountName = connStr.match(/AccountName=([^;]+)/)[1];
    const accountKey = connStr.match(/AccountKey=([^;]+)/)[1];
    const sharedKey = new StorageSharedKeyCredential(accountName, accountKey);

    const expiresOn = new Date();
    expiresOn.setHours(expiresOn.getHours() + SAS_EXPIRY_HOURS);

    const sasQuery = generateBlobSASQueryParameters(
      {
        containerName: AZURE_CONTAINER,
        blobName: blobName,
        permissions: BlobSASPermissions.parse("r"),
        expiresOn,
      },
      sharedKey,
    );

    return `${containerClient.getBlockBlobClient(blobName).url}?${sasQuery.toString()}`;
  } catch (err) {
    return containerClient.getBlockBlobClient(blobName).url;
  }
}

/**
 * LISTAGEM DIRETA DO AZURE: GET /api/photo-reports
 */
router.get("/", async (req, res) => {
  try {
    const photos = [];
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    );
    const containerClient =
      blobServiceClient.getContainerClient(AZURE_CONTAINER);

    // Verifica se o container existe antes de tentar listar
    const exists = await containerClient.exists();
    if (!exists) {
      console.log(`⚠️ Container '${AZURE_CONTAINER}' não encontrado.`);
      return res.json({ data: [] });
    }

    // Lista os arquivos diretamente do Azure
    for await (const blob of containerClient.listBlobsFlat({
      includeMetadata: true,
    })) {
      const url = _generateSasUrl(containerClient, blob.name);

      photos.push({
        url,
        latitude: blob.metadata?.latitude || "0",
        longitude: blob.metadata?.longitude || "0",
        description: blob.metadata?.description
          ? decodeURIComponent(blob.metadata.description)
          : "Reporte Azure",
        capturedAt: blob.properties.createdOn || new Date().toISOString(),
      });
    }

    // Retorna para o frontend (invertido para as fotos novas aparecerem primeiro)
    return res.json({ data: photos.reverse() });
  } catch (error) {
    console.error("❌ Erro Azure List:", error.message);
    res.status(500).json({ message: "Erro ao conectar com Azure" });
  }
});

/**
 * UPLOAD DIRETO PARA AZURE: POST /api/photo-reports
 */
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Nenhuma imagem recebida." });

    const { latitude, longitude, description } = req.body;
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    );
    const containerClient =
      blobServiceClient.getContainerClient(AZURE_CONTAINER);

    // Cria o container se não existir
    await containerClient.createIfNotExists();

    const blobName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, "_")}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Sobe a foto com os metadados (GPS e Descrição)
    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype || "image/jpeg" },
      metadata: {
        latitude: String(latitude),
        longitude: String(longitude),
        description: encodeURIComponent(description || "Reporte App"),
      },
    });

    return res.status(201).json({ message: "Enviado para Azure!" });
  } catch (error) {
    console.error("❌ Erro Azure Upload:", error.message);
    res.status(500).json({ message: "Erro no upload Azure" });
  }
});

module.exports = router;
