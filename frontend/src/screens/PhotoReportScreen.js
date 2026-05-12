import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  Dimensions,
  FlatList,
  Animated,
  StatusBar,
  TouchableWithoutFeedback,
  RefreshControl,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5174";
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const CARD_W = (SCREEN_W - 48) / 2;
const NEARBY_KM = 5;

// ─── utils ────────────────────────────────────────────────────────────────────

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

async function reverseGeocode(lat, lng) {
  try {
    const [geo] = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });
    if (!geo) return null;
    const parts = [geo.district || geo.subregion, geo.city, geo.region].filter(
      Boolean,
    );
    return parts.length > 0 ? parts.join(", ") : null;
  } catch {
    return null;
  }
}

const GENERIC = ["reporte espike", "reporte_espike", "reporte via app espike"];
function isGeneric(desc) {
  return !desc || GENERIC.includes(desc.trim().toLowerCase());
}

// ─── PhotoCard ────────────────────────────────────────────────────────────────

function PhotoCard({ item, onPress, distKm }) {
  const lat = parseFloat(item.latitude);
  const lng = parseFloat(item.longitude);

  const [label, setLabel] = useState(
    isGeneric(item.description) ? null : item.description,
  );

  useEffect(() => {
    if (!label && !isNaN(lat) && !isNaN(lng)) {
      reverseGeocode(lat, lng).then((p) =>
        setLabel(p || `${lat.toFixed(3)}, ${lng.toFixed(3)}`),
      );
    }
  }, []);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, { width: CARD_W }]}
    >
      <Image source={{ uri: item.url }} style={styles.cardImg} />
      {distKm != null && (
        <View style={styles.distBadge}>
          <Text style={styles.distBadgeText}>
            {distKm < 1
              ? `${Math.round(distKm * 1000)}m`
              : `${distKm.toFixed(1)}km`}
          </Text>
        </View>
      )}
      <View style={styles.cardFooter}>
        <Text style={styles.cardLabel} numberOfLines={2}>
          📍 {label ?? "…"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── ExpandedModal ────────────────────────────────────────────────────────────

function ExpandedModal({ item, onClose }) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const close = () => {
    Animated.timing(fade, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(onClose);
  };

  const lat = parseFloat(item.latitude);
  const lng = parseFloat(item.longitude);

  return (
    <Modal transparent animationType="none" onRequestClose={close}>
      <StatusBar hidden />
      <TouchableWithoutFeedback onPress={close}>
        <Animated.View style={[styles.modalBg, { opacity: fade }]}>
          <TouchableWithoutFeedback>
            <View style={styles.modalBox}>
              <TouchableOpacity style={styles.modalClose} onPress={close}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              <Image
                source={{ uri: item.url }}
                style={styles.modalImg}
                resizeMode="contain"
              />
              <View style={styles.modalInfo}>
                <Text style={styles.modalDesc} numberOfLines={2}>
                  {isGeneric(item.description)
                    ? "📍 Reporte comunitário"
                    : `📍 ${item.description}`}
                </Text>
                <Text style={styles.modalMeta}>
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </Text>
                <Text style={styles.modalMeta}>
                  🕐 {new Date(item.capturedAt).toLocaleString("pt-BR")}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── UploadSheet ──────────────────────────────────────────────────────────────

function UploadSheet({ userLocation, onSuccess, onClose }) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const slideY = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    Animated.spring(slideY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  }, []);

  const dismiss = (cb) => {
    Animated.timing(slideY, {
      toValue: SCREEN_H,
      duration: 220,
      useNativeDriver: true,
    }).start(cb);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted")
      return Alert.alert("Permissão", "Precisamos da câmera.");
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!image) return Alert.alert("Atenção", "Tire uma foto primeiro.");
    if (!userLocation)
      return Alert.alert("Atenção", "Aguarde a localização ser detectada.");

    setUploading(true);
    try {
      const formData = new FormData();

      if (Platform.OS === "web") {
        const r = await fetch(image);
        const blob = await r.blob();
        formData.append("photo", blob, `report_${Date.now()}.jpg`);
      } else {
        const uri =
          Platform.OS === "android" ? image : image.replace("file://", "");
        formData.append("photo", {
          uri,
          name: `report_${Date.now()}.jpg`,
          type: "image/jpeg",
        });
      }

      formData.append("latitude", String(userLocation.lat));
      formData.append("longitude", String(userLocation.lng));
      formData.append(
        "description",
        userLocation.placeName || "Reporte via app Espike",
      );

      const response = await fetch(`${API_URL}/api/photo-reports`, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || "Erro no servidor");

      dismiss(() => onSuccess());
    } catch (err) {
      Alert.alert("❌ Falha no envio", err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      transparent
      animationType="none"
      onRequestClose={() => dismiss(onClose)}
    >
      <TouchableWithoutFeedback onPress={() => dismiss(onClose)}>
        <View style={styles.sheetOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[styles.sheet, { transform: [{ translateY: slideY }] }]}
            >
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Novo Reporte</Text>

              <View style={styles.locationRow}>
                <Text style={styles.locationPin}>📍</Text>
                <Text style={styles.locationText} numberOfLines={1}>
                  {userLocation?.placeName ?? "Detectando localização…"}
                </Text>
              </View>

              {image ? (
                <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
                  <Image source={{ uri: image }} style={styles.sheetPreview} />
                  <Text style={styles.changePhoto}>
                    Toque para trocar a foto
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.sheetCamera}
                  onPress={pickImage}
                >
                  <Text style={styles.sheetCameraIcon}>📷</Text>
                  <Text style={styles.sheetCameraLabel}>Tirar foto</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (!image || uploading) && styles.sendBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!image || uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.sendBtnText}>Enviar reporte</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PhotoReportScreen() {
  const [tab, setTab] = useState("nearby");
  const [allPhotos, setAllPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locStatus, setLocStatus] = useState("loading"); // 'loading' | 'ok' | 'denied'
  const [expanded, setExpanded] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  // Localização automática no mount — sem precisar apertar nada
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocStatus("denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude: lat, longitude: lng } = loc.coords;
      const placeName =
        (await reverseGeocode(lat, lng)) ??
        `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setUserLocation({ lat, lng, placeName });
      setLocStatus("ok");
    })();
  }, []);

  const fetchPhotos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/photo-reports`);
      const data = await res.json();
      if (res.ok) setAllPhotos(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const photos =
    tab === "nearby" && userLocation
      ? allPhotos
          .map((p) => ({
            ...p,
            _dist: haversineKm(
              userLocation.lat,
              userLocation.lng,
              parseFloat(p.latitude),
              parseFloat(p.longitude),
            ),
          }))
          .filter((p) => !isNaN(p._dist) && p._dist <= NEARBY_KM)
          .sort((a, b) => a._dist - b._dist)
      : allPhotos;

  const renderItem = ({ item }) => (
    <PhotoCard
      item={item}
      onPress={() => setExpanded(item)}
      distKm={tab === "nearby" ? item._dist : null}
    />
  );

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.headerTitle}>Reportes</Text>
          {locStatus === "loading" && (
            <View style={styles.headerSubRow}>
              <ActivityIndicator
                size="small"
                color="#007AFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.headerSub}>Detectando localização…</Text>
            </View>
          )}
          {locStatus === "ok" && (
            <Text style={styles.headerSub} numberOfLines={1}>
              📍 {userLocation?.placeName}
            </Text>
          )}
          {locStatus === "denied" && (
            <Text style={styles.headerSubWarn}>⚠️ GPS sem permissão</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.fabSmall}
          onPress={() => setShowUpload(true)}
        >
          <Text style={styles.fabSmallText}>+ Reportar</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "nearby" && styles.tabActive]}
          onPress={() => setTab("nearby")}
        >
          <Text
            style={[styles.tabText, tab === "nearby" && styles.tabTextActive]}
          >
            {locStatus === "ok" ? `Próximos (${photos.length})` : "Próximos"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "all" && styles.tabActive]}
          onPress={() => setTab("all")}
        >
          <Text style={[styles.tabText, tab === "all" && styles.tabTextActive]}>
            Todos ({allPhotos.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid de fotos */}
      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 48 }}
          size="large"
          color="#007AFF"
        />
      ) : (
        <FlatList
          data={photos}
          renderItem={renderItem}
          keyExtractor={(_, i) => String(i)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPhotos(true)}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              {tab === "nearby" && locStatus === "denied" ? (
                <Text style={styles.emptyText}>
                  Ative o GPS para ver reportes próximos.
                </Text>
              ) : tab === "nearby" ? (
                <Text style={styles.emptyText}>
                  Nenhum reporte num raio de {NEARBY_KM} km de você.
                </Text>
              ) : (
                <Text style={styles.emptyText}>
                  Nenhum reporte ainda. Seja o primeiro!
                </Text>
              )}
            </View>
          }
        />
      )}

      {/* FAB flutuante */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowUpload(true)}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {expanded && (
        <ExpandedModal item={expanded} onClose={() => setExpanded(null)} />
      )}
      {showUpload && (
        <UploadSheet
          userLocation={userLocation}
          onSuccess={() => {
            setShowUpload(false);
            fetchPhotos(true);
          }}
          onClose={() => setShowUpload(false)}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f5f5f7" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111" },
  headerSubRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  headerSub: { fontSize: 12, color: "#666", marginTop: 2 },
  headerSubWarn: { fontSize: 12, color: "#f57c00", marginTop: 2 },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 4,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#007AFF" },
  tabText: { fontSize: 14, fontWeight: "500", color: "#999" },
  tabTextActive: { color: "#007AFF", fontWeight: "600" },

  grid: { padding: 12, paddingBottom: 100 },
  row: { justifyContent: "space-between", marginBottom: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardImg: { width: "100%", aspectRatio: 1 },
  cardFooter: { padding: 8 },
  cardLabel: { fontSize: 11, color: "#555", lineHeight: 15 },
  distBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  distBadgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },

  empty: { flex: 1, alignItems: "center", paddingTop: 60 },
  emptyText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 34 },
  fabSmall: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  fabSmallText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: { width: SCREEN_W, alignItems: "center", paddingHorizontal: 16 },
  modalImg: { width: SCREEN_W - 32, height: SCREEN_H * 0.58, borderRadius: 14 },
  modalInfo: { marginTop: 16, width: "100%" },
  modalDesc: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  modalMeta: { color: "#aaa", fontSize: 13, marginBottom: 3 },
  modalClose: {
    alignSelf: "flex-end",
    marginBottom: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: { color: "#fff", fontSize: 16 },

  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 14,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  locationPin: { fontSize: 16, marginRight: 6 },
  locationText: { fontSize: 13, color: "#007AFF", fontWeight: "500", flex: 1 },
  sheetCamera: {
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    backgroundColor: "#fafafa",
  },
  sheetCameraIcon: { fontSize: 36, marginBottom: 8 },
  sheetCameraLabel: { fontSize: 15, color: "#888" },
  sheetPreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 6,
  },
  changePhoto: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginBottom: 14,
  },
  sendBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  sendBtnDisabled: { backgroundColor: "#b0c8f0" },
  sendBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
//1. Acesse portal.azure.com
// 2. Criar "Storage account" → Nome: espikeXXX, Região: Brazil South, Redundancy: GRS
// 3. Em "Containers" → Criar container: photo-reports (acesso: Blob)
// 4. Em "Access keys" → Copiar "Connection string" 🔐

//# No Render Dashboard → Seu backend → Environment Variables:
//
// PHOTO_REPORT_AZURE_ENABLED=true
// AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=espikeXXX;AccountKey=xxx;EndpointSuffix=core.windows.net

//# No frontend/app.json ou .env:
// EXPO_PUBLIC_AZURE_PHOTO_REPORT_ENABLED=true
