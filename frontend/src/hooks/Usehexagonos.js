/**
 * useHexagonos.js
 * Hook para gerenciar carregamento, cache e filtragem dos hexágonos de criminalidade.
 *
 * Fonte dos dados: assets/areas_gravidade.json (arquivo local do bundle)
 * Na primeira execução, parseia o JSON e salva no AsyncStorage.
 * Nas execuções seguintes, lê direto do cache (mais rápido para arquivos grandes).
 *
 * Estrutura esperada do JSON:
 *   {
 *     "areas": [
 *       {
 *         "id": 1,
 *         "severity": "extreme",
 *         "color": "#B71C1C",
 *         "fill_opacity": 0.65,
 *         "centroid": { "lat": -23.547231, "lng": -46.664075 },
 *         "coordinates": [[-23.547, -46.664], ...]
 *       }
 *     ]
 *   }
 *
 * MUDANÇAS DE PERFORMANCE:
 *   - Removido filtro de bounding box do viewport: os dados são locais (~10k hex)
 *     e o Leaflet já faz culling nativo de SVG. Filtrar no JS causava hexágonos
 *     sumindo/aparecendo ao arrastar o mapa (efeito de "carga progressiva indesejada").
 *   - Mantido apenas LOD (zoom muito afastado → só extreme/high).
 *   - Removido debounce de atualizarRegiao: sem filtro de viewport, a função
 *     só serve para o LOD, que não precisa de atraso.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Configurações
// ---------------------------------------------------------------------------
const HEXAGONOS_CACHE_KEY = '@espike_hexagonos_v3'; // bumped: força recarga do asset

// Região inicial: cobre toda a Grande São Paulo.
const REGIAO_INICIAL = {
    latitude:       -23.5505,
    longitude:      -46.6333,
    latitudeDelta:   0.4,
    longitudeDelta:  0.4,
};

// Severidades exibidas em zoom muito afastado (LOD)
const SEVERIDADES_LOD = ['extreme', 'high'];

// Limiar de latitudeDelta para ativar LOD
const LOD_DELTA_LIMIAR = 3.0;  // ~330km norte-sul: só ativa em zoom quase estadual

// ---------------------------------------------------------------------------
// Carregamento do asset local
// ---------------------------------------------------------------------------

function carregarDoAsset() {
    const data = require('../../assets/areas_count.json');
    return Array.isArray(data) ? data : (data.areas ?? []);
}

async function carregarDoCache() {
    try {
        const cached = await AsyncStorage.getItem(HEXAGONOS_CACHE_KEY);
        if (cached) return JSON.parse(cached);
    } catch (e) {
        console.warn('[useHexagonos] Erro ao ler cache:', e);
    }
    return null;
}

async function salvarNoCache(areas) {
    try {
        await AsyncStorage.setItem(HEXAGONOS_CACHE_KEY, JSON.stringify(areas));
    } catch (e) {
        console.warn('[useHexagonos] Erro ao salvar cache:', e);
    }
}

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------

/**
 * @returns {{
 *   hexagonosVisiveis: Array,
 *   carregando: boolean,
 *   erro: string | null,
 *   atualizarRegiao: (regiao: object) => void,
 *   limparCache: () => Promise<void>
 * }}
 */
export function useHexagonos() {
    const [todosHexagonos, setTodosHexagonos] = useState([]);
    const [regiao, setRegiao]                 = useState(REGIAO_INICIAL);
    const [carregando, setCarregando]         = useState(false);
    const [erro, setErro]                     = useState(null);

    // -------------------------------------------------------------------------
    // Carrega dados ao montar: AsyncStorage → asset local
    // -------------------------------------------------------------------------
    useEffect(() => {
        let cancelado = false;

        async function inicializar() {
            setCarregando(true);
            setErro(null);

            try {
                // 1. Tenta o cache do AsyncStorage (leituras subsequentes)
                const cached = await carregarDoCache();
                if (cached && cached.length > 0) {
                    if (!cancelado) setTodosHexagonos(cached);
                    return;
                }

                // 2. Primeira abertura: lê do asset local e popula o cache
                const areas = carregarDoAsset();
                if (!cancelado) {
                    setTodosHexagonos(areas);
                    await salvarNoCache(areas);
                }
            } catch (e) {
                if (!cancelado) {
                    console.error('[useHexagonos] Erro ao carregar areas_count.json:', e);
                    setErro('Não foi possível carregar os dados de criminalidade.');
                }
            } finally {
                if (!cancelado) setCarregando(false);
            }
        }

        inicializar();
        return () => { cancelado = true; };
    }, []);

    // -------------------------------------------------------------------------
    // Filtro: APENAS LOD por zoom (sem corte de viewport)
    //
    // Por que não filtrar por viewport?
    //   Os ~10k hexágonos são dados locais já em memória. O Leaflet renderiza
    //   somente o que está visível via culling de SVG — filtrar no JS seria
    //   trabalho duplicado e causaria o efeito de hexágonos sumindo ao arrastar.
    // -------------------------------------------------------------------------
    const hexagonosVisiveis = useMemo(() => {
        if (todosHexagonos.length === 0) return [];

        const { latitudeDelta } = regiao;

        // LOD: zoom muito afastado → exibe apenas severidades críticas
        if (latitudeDelta > LOD_DELTA_LIMIAR) {
            return todosHexagonos.filter(h => SEVERIDADES_LOD.includes(h.severity));
        }

        // Zoom normal → todos os hexágonos
        return todosHexagonos;
    }, [regiao, todosHexagonos]);

    // -------------------------------------------------------------------------
    // Atualização de região — sem debounce (só afeta o LOD, não o viewport)
    // -------------------------------------------------------------------------
    const atualizarRegiao = useCallback((r) => setRegiao(r), []);

    // -------------------------------------------------------------------------
    // Utilitário: limpar cache
    // -------------------------------------------------------------------------
    const limparCache = useCallback(async () => {
        try {
            await AsyncStorage.removeItem(HEXAGONOS_CACHE_KEY);
        } catch (e) {
            console.warn('[useHexagonos] Erro ao limpar cache:', e);
        }
    }, []);

    return { hexagonosVisiveis, carregando, erro, atualizarRegiao, limparCache };
}

export default useHexagonos;