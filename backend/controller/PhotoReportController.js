const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// ==========================================
// CONFIGURAÇÕES GLOBAIS (AJUSTE AQUI)
// ==========================================
const AZURE_CONTAINER = 'teste';
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'uploads/photo-reports');

// Validade das SAS URLs geradas (em horas). Aumente se quiser URLs mais duradouras.
const SAS_EXPIRY_HOURS = 24;

const upload = multer({ storage: multer.memoryStorage() });

let BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions;
const AZURE_ENABLED = process.env.PHOTO_REPORT_AZURE_ENABLED === 'true';

if (AZURE_ENABLED) {
    try {
        const azureBlob = require('@azure/storage-blob');
        BlobServiceClient               = azureBlob.BlobServiceClient;
        StorageSharedKeyCredential      = azureBlob.StorageSharedKeyCredential;
        generateBlobSASQueryParameters  = azureBlob.generateBlobSASQueryParameters;
        BlobSASPermissions              = azureBlob.BlobSASPermissions;
    } catch (e) {
        console.error("❌ SDK do Azure não instalado. Rode: npm install @azure/storage-blob");
    }
}

// ---------------------------------------------------------------------------
// Cria uma SAS URL com validade configurável para um blob específico.
// Isso dispensa a necessidade de deixar o container público.
// ---------------------------------------------------------------------------
function _generateSasUrl(containerClient, blobName) {
    try {
        const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
        if (!connStr) throw new Error('Sem connection string');

        // Extrai AccountName e AccountKey da connection string
        const accountNameMatch = connStr.match(/AccountName=([^;]+)/);
        const accountKeyMatch  = connStr.match(/AccountKey=([^;]+)/);
        if (!accountNameMatch || !accountKeyMatch) throw new Error('Connection string inválida');

        const accountName = accountNameMatch[1];
        const accountKey  = accountKeyMatch[1];
        const sharedKey   = new StorageSharedKeyCredential(accountName, accountKey);

        const expiresOn = new Date();
        expiresOn.setHours(expiresOn.getHours() + SAS_EXPIRY_HOURS);

        const sasQuery = generateBlobSASQueryParameters(
            {
                containerName: AZURE_CONTAINER,
                blobName:      blobName,
                permissions:   BlobSASPermissions.parse('r'), // somente leitura
                expiresOn,
            },
            sharedKey
        );

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        return `${blockBlobClient.url}?${sasQuery.toString()}`;
    } catch (err) {
        console.warn('⚠️  Não foi possível gerar SAS URL, usando URL pública:', err.message);
        // Fallback para URL pública (funciona se o container for público)
        return containerClient.getBlockBlobClient(blobName).url;
    }
}

// ---------------------------------------------------------------------------
// Garante que o container exista E esteja com acesso público a blobs.
// Isso corrige o caso em que o container já existia mas era privado.
// ---------------------------------------------------------------------------
async function _ensureContainerPublic(containerClient) {
    const created = await containerClient.createIfNotExists({ access: 'blob' });
    if (!created.succeeded) {
        // Container já existia — força o acesso público caso esteja privado
        try {
            await containerClient.setAccessPolicy('blob');
            console.log('✅ Acesso público forçado no container existente.');
        } catch (err) {
            // Algumas contas Azure bloqueiam acesso anônimo no nível da conta.
            // Nesse caso, SAS URLs são obrigatórias.
            console.warn('⚠️  Não foi possível definir acesso público no container:', err.message);
            console.warn('   → As imagens serão servidas via SAS URLs com expiração.');
        }
    }
}

/**
 * LISTAGEM: GET /api/photo-reports
 */
router.get('/', async (req, res) => {
    try {
        let photos = [];

        if (AZURE_ENABLED && process.env.AZURE_STORAGE_CONNECTION_STRING) {
            const blobServiceClient = BlobServiceClient.fromConnectionString(
                process.env.AZURE_STORAGE_CONNECTION_STRING
            );
            const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER);

            if (await containerClient.exists()) {
                for await (const blob of containerClient.listBlobsFlat({ includeMetadata: true })) {
                    // ✅ CORREÇÃO: usa SAS URL em vez de URL pública direta
                    const url = _generateSasUrl(containerClient, blob.name);

                    photos.push({
                        url,
                        latitude:    blob.metadata?.latitude,
                        longitude:   blob.metadata?.longitude,
                        description: blob.metadata?.description
                            ? decodeURIComponent(blob.metadata.description)
                            : 'Reporte Espike',
                        capturedAt:  blob.metadata?.capturedAt || new Date().toISOString(),
                    });
                }
            }
        } else {
            // Fallback local
            try {
                const files    = await fs.readdir(LOCAL_UPLOAD_DIR);
                const jsonFiles = files.filter(f => f.endsWith('.meta.json'));

                for (const jsonFile of jsonFiles) {
                    const metaPath = path.join(LOCAL_UPLOAD_DIR, jsonFile);
                    const metaData = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
                    const imgFile  = jsonFile.replace('.meta.json', '');

                    photos.push({
                        url: `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5174'}/uploads/photo-reports/${imgFile}`,
                        latitude:    metaData.latitude,
                        longitude:   metaData.longitude,
                        description: metaData.description,
                        capturedAt:  metaData.capturedAt,
                    });
                }
            } catch (e) { /* Sem arquivos locais */ }
        }

        return res.json({ data: photos.reverse() });
    } catch (error) {
        console.error('❌ Erro ao listar fotos:', error.message);
        res.status(500).json({ message: 'Erro ao carregar galeria' });
    }
});

/**
 * UPLOAD: POST /api/photo-reports
 */
router.post('/', upload.single('photo'), async (req, res) => {
    console.log('--- REQUISIÇÃO DE UPLOAD ---');
    try {
        if (!req.file) return res.status(400).json({ message: 'Nenhuma imagem recebida.' });

        const { latitude, longitude, description } = req.body;
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) return res.status(400).json({ message: 'GPS inválido.' });

        const result = await _savePhotoWithLocation(
            req.file.buffer,
            req.file.originalname,
            lat, lng, description,
            req.file.mimetype
        );

        return res.status(201).json({ message: 'Sucesso', data: result });
    } catch (error) {
        console.error('❌ Erro no upload:', error.message);
        res.status(500).json({ message: 'Falha interna no upload' });
    }
});

/**
 * Função auxiliar de salvamento
 */
async function _savePhotoWithLocation(fileBuffer, originalName, latitude, longitude, description, mimetype) {
    const timestamp   = Date.now();
    const safeName    = `${timestamp}-${originalName.replace(/\s+/g, '_')}`;
    const safeDesc    = description ? encodeURIComponent(description) : 'Reporte_Espike';

    const meta = {
        latitude:    latitude.toString(),
        longitude:   longitude.toString(),
        description: safeDesc,
        capturedAt:  new Date().toISOString(),
    };

    if (!AZURE_ENABLED || !process.env.AZURE_STORAGE_CONNECTION_STRING) {
        return _saveToLocal(fileBuffer, safeName, meta);
    }

    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(
            process.env.AZURE_STORAGE_CONNECTION_STRING
        );
        const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER);

        // ✅ CORREÇÃO: garante acesso público no container (mesmo que já existisse)
        await _ensureContainerPublic(containerClient);

        const blockBlobClient = containerClient.getBlockBlobClient(safeName);

        await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: mimetype || 'image/jpeg' },
            metadata: meta,
        });

        // ✅ Retorna SAS URL para uso imediato no frontend
        const url = _generateSasUrl(containerClient, safeName);
        return { url, provider: 'azure', meta };
    } catch (err) {
        console.warn('⚠️ Azure falhou, usando local:', err.message);
        return _saveToLocal(fileBuffer, safeName, meta);
    }
}

async function _saveToLocal(fileBuffer, safeName, meta) {
    await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
    const filePath = path.join(LOCAL_UPLOAD_DIR, safeName);
    await fs.writeFile(filePath, fileBuffer);
    await fs.writeFile(`${filePath}.meta.json`, JSON.stringify(meta, null, 2));
    return { url: `/uploads/photo-reports/${safeName}`, provider: 'local', meta };
}

module.exports = router;