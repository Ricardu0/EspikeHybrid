/**
 * AreaRatingForm.js — Painel da Zona (UI/UX Premium)
 * Responsivo para mobile e desktop.
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, Alert,
  Dimensions, Platform,
} from "react-native";
import { areaService } from "../services/areaService";

const { width: SCREEN_W } = Dimensions.get("window");
const IS_WIDE = Platform.OS === "web" && SCREEN_W > 640;

// ─── Paleta de cores ──────────────────────────────────────────────────────────
const C = {
  primary:    "#1768C6",
  primarySoft:"#EBF3FF",
  green:      "#22C55E",
  greenSoft:  "#DCFCE7",
  red:        "#EF4444",
  redSoft:    "#FEE2E2",
  amber:      "#F59E0B",
  amberSoft:  "#FEF3C7",
  bg:         "#FFFFFF",
  surface:    "#F8FAFC",
  border:     "#E2E8F0",
  text:       "#1E293B",
  muted:      "#64748B",
  subtle:     "#94A3B8",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ratingColor = (v) => {
  if (v >= 4) return C.green;
  if (v >= 3) return C.amber;
  if (v >= 2) return "#FF9800";
  return C.red;
};

const moralInfo = (score) => {
  if (score === undefined || score === null) return { label: "—", color: C.subtle, bg: C.surface };
  if (score >= 80) return { label: `★ ${score}`, color: C.green, bg: C.greenSoft };
  if (score >= 50) return { label: `◎ ${score}`, color: C.amber, bg: C.amberSoft };
  return { label: `⚠ ${score}`, color: C.red, bg: C.redSoft };
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

// ─── Componente: Avatar ───────────────────────────────────────────────────────
const Avatar = ({ name = "?", size = 36 }) => {
  const initials = getInitials(name) || "?";
  const hue = (name.charCodeAt(0) || 0) * 37 % 360;
  return (
    <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: `hsl(${hue},60%,50%)` }]}>
      <Text style={[s.avatarText, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
};

// ─── Componente: Barra de Rating com Estrelas Interativas ─────────────────────
const RatingRow = ({ label, value, onChange, averageValue, readOnly }) => {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  const color = ratingColor(averageValue ?? value);

  return (
    <View style={s.ratingRow}>
      {/* Label + barra de média */}
      <View style={s.ratingMeta}>
        <Text style={s.ratingLabel}>{label}</Text>
        {averageValue !== undefined && (
          <View style={s.avgBarWrap}>
            <View style={[s.avgBar, { width: `${(averageValue / 5) * 100}%`, backgroundColor: color }]} />
          </View>
        )}
      </View>

      {/* Estrelas */}
      <View style={s.starsWrap}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => !readOnly && onChange?.(star)}
            onPressIn={() => !readOnly && setHover(star)}
            onPressOut={() => setHover(0)}
            activeOpacity={readOnly ? 1 : 0.7}
            style={s.starBtn}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={[s.starGlyph, star <= display ? { color: "#FBBF24" } : { color: C.border }]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Valor numérico */}
      <Text style={[s.ratingNum, { color }]}>
        {value > 0 ? value.toFixed(0) : "—"}
      </Text>
    </View>
  );
};

// ─── Componente: Card de Relato ───────────────────────────────────────────────
const ReportCard = ({ report, areaId, onVoteUpdate, myUserId }) => {
  const [voting, setVoting] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(report.upvotes || 0);
  const [localDownvotes, setLocalDownvotes] = useState(report.downvotes || 0);
  const [myVote, setMyVote] = useState(report.myVote || null); // 'up' | 'down' | null

  const moral = moralInfo(report.user_id?.moralScore);
  const isOwn = myUserId && report.user_id?._id?.toString() === myUserId?.toString();

  const handleVote = async (isUpvote) => {
    if (isOwn) {
      Alert.alert("Ops", "Você não pode votar no seu próprio relato.");
      return;
    }
    if (voting) return;
    setVoting(true);

    // Optimistic UI
    const voteKey = isUpvote ? "up" : "down";
    const prevVote = myVote;
    const prevUp = localUpvotes;
    const prevDown = localDownvotes;

    if (prevVote === voteKey) {
      // Toggle off
      setMyVote(null);
      isUpvote ? setLocalUpvotes(v => v - 1) : setLocalDownvotes(v => v - 1);
    } else {
      if (prevVote) {
        // Mudou de voto
        isUpvote ? setLocalDownvotes(v => v - 1) : setLocalUpvotes(v => v - 1);
      }
      setMyVote(voteKey);
      isUpvote ? setLocalUpvotes(v => v + 1) : setLocalDownvotes(v => v + 1);
    }

    try {
      const res = await areaService.voteOnReport(areaId, report._id, isUpvote);
      setLocalUpvotes(res.upvotes);
      setLocalDownvotes(res.downvotes);
      setMyVote(res.myVote);
      onVoteUpdate?.();
    } catch (e) {
      // Reverte em caso de erro
      setLocalUpvotes(prevUp);
      setLocalDownvotes(prevDown);
      setMyVote(prevVote);
      Alert.alert("Erro", e.message || "Não foi possível registrar o voto.");
    } finally {
      setVoting(false);
    }
  };

  return (
    <View style={s.reportCard}>
      {/* Header do card */}
      <View style={s.reportHeader}>
        <Avatar name={report.user_id?.name || "?"} size={38} />
        <View style={s.reportMeta}>
          <Text style={s.reportName} numberOfLines={1}>
            {report.user_id?.name || "Usuário"}
          </Text>
          <View style={[s.moralPill, { backgroundColor: moral.bg }]}>
            <Text style={[s.moralPillText, { color: moral.color }]}>{moral.label}</Text>
          </View>
        </View>
        <Text style={s.reportTime}>{timeAgo(report.createdAt)}</Text>
      </View>

      {/* Texto do relato */}
      <Text style={s.reportText}>{report.comment}</Text>

      {/* Botões de voto */}
      <View style={s.voteRow}>
        <TouchableOpacity
          style={[s.voteBtn, myVote === "up" && s.voteBtnActiveUp]}
          onPress={() => handleVote(true)}
          disabled={voting || isOwn}
          activeOpacity={0.75}
        >
          {voting ? (
            <ActivityIndicator size="small" color={myVote === "up" ? C.green : C.muted} />
          ) : (
            <>
              <Text style={[s.voteIcon, myVote === "up" && { color: C.green }]}>▲</Text>
              <Text style={[s.voteCount, myVote === "up" && { color: C.green }]}>{localUpvotes}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.voteBtn, myVote === "down" && s.voteBtnActiveDown]}
          onPress={() => handleVote(false)}
          disabled={voting || isOwn}
          activeOpacity={0.75}
        >
          {voting ? (
            <ActivityIndicator size="small" color={myVote === "down" ? C.red : C.muted} />
          ) : (
            <>
              <Text style={[s.voteIcon, myVote === "down" && { color: C.red }]}>▼</Text>
              <Text style={[s.voteCount, myVote === "down" && { color: C.red }]}>{localDownvotes}</Text>
            </>
          )}
        </TouchableOpacity>

        {isOwn && <Text style={s.ownLabel}>Seu relato</Text>}
      </View>
    </View>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
const AreaRatingForm = ({ visible, onClose, areaRatingData, setAreaRatingData, selectedArea, onSubmit }) => {
  const [tab, setTab] = useState("ratings");
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [myUserId, setMyUserId] = useState(null);

  // Carrega userId do AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const AsyncStorage = require("@react-native-async-storage/async-storage").default;
        const raw = await AsyncStorage.getItem("userData");
        if (raw) {
          const u = JSON.parse(raw);
          setMyUserId(u.id || u._id);
        }
      } catch (_) {}
    };
    loadUser();
  }, []);

  const areaId = selectedArea?._id || selectedArea?.id;

  const fetchReports = useCallback(async () => {
    if (!areaId || typeof areaId !== "string") return;
    setLoadingReports(true);
    try {
      const data = await areaService.getReports(areaId);
      setReports(Array.isArray(data) ? data : []);
    } catch (_) {
      setReports([]);
    } finally {
      setLoadingReports(false);
    }
  }, [areaId]);

  useEffect(() => {
    if (visible) {
      setTab("ratings");
      setComment("");
      fetchReports();
    }
  }, [visible, fetchReports]);

  const handleAddReport = async () => {
    if (!comment.trim()) {
      Alert.alert("Atenção", "Escreva algo antes de enviar.");
      return;
    }
    if (!areaId || typeof areaId !== "string") {
      Alert.alert("Erro", "Esta zona ainda não foi salva no banco. Crie a zona primeiro.");
      return;
    }
    setSubmitting(true);
    try {
      await areaService.addReport(areaId, comment.trim());
      setComment("");
      await fetchReports();
    } catch (e) {
      Alert.alert("Erro", e.message || "Não foi possível publicar o relato.");
    } finally {
      setSubmitting(false);
    }
  };

  const overall = selectedArea?.ratings?.overall || 0;
  const headerColor = ratingColor(overall);
  const ratingLabels = {
    overall: "Geral", risk: "Risco", lighting: "Iluminação",
    infrastructure: "Infra", policing: "Policiamento",
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={[s.sheet, IS_WIDE && s.sheetWide]}>

          {/* ── Header ── */}
          <View style={[s.header, { borderLeftColor: headerColor }]}>
            <View style={{ flex: 1 }}>
              <Text style={s.zoneName} numberOfLines={1}>
                🗺 {selectedArea?.name || "Zona"}
              </Text>
              <View style={s.headerMeta}>
                {overall > 0 ? (
                  <View style={[s.ratingBadge, { backgroundColor: headerColor }]}>
                    <Text style={s.ratingBadgeText}>★ {overall.toFixed(1)}</Text>
                  </View>
                ) : (
                  <View style={[s.ratingBadge, { backgroundColor: C.border }]}>
                    <Text style={[s.ratingBadgeText, { color: C.muted }]}>Sem avaliação</Text>
                  </View>
                )}
                {selectedArea?.ratingCount > 0 && (
                  <Text style={s.ratingCountText}>{selectedArea.ratingCount} avaliação(ões)</Text>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── Tabs ── */}
          <View style={s.tabBar}>
            {[
              { key: "ratings", label: "⭐ Avaliar" },
              { key: "reports", label: `💬 Relatos (${reports.length})` },
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[s.tabBtn, tab === key && s.tabBtnActive]}
                onPress={() => setTab(key)}
                activeOpacity={0.8}
              >
                <Text style={[s.tabLabel, tab === key && s.tabLabelActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Tab: Avaliações ── */}
          {tab === "ratings" && (
            <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
              {/* Médias atuais da zona */}
              {selectedArea?.ratings && (
                <View style={s.avgSection}>
                  <Text style={s.sectionTitle}>Média da zona</Text>
                  {Object.entries(ratingLabels).map(([key, label]) => (
                    <RatingRow
                      key={key}
                      label={label}
                      value={selectedArea.ratings[key] || 0}
                      averageValue={selectedArea.ratings[key] || 0}
                      readOnly
                    />
                  ))}
                </View>
              )}

              {/* Divider */}
              <View style={s.divider} />

              {/* Avaliação do usuário */}
              <Text style={s.sectionTitle}>Sua avaliação</Text>
              <Text style={s.sectionSub}>Selecione as estrelas para cada critério:</Text>
              {Object.entries(ratingLabels).map(([key, label]) => (
                <RatingRow
                  key={key}
                  label={label}
                  value={areaRatingData[key] || 0}
                  onChange={(v) => setAreaRatingData({ ...areaRatingData, [key]: v })}
                />
              ))}

              <TouchableOpacity
                style={[s.submitBtn, !areaRatingData.overall && s.submitBtnDisabled]}
                onPress={onSubmit}
                disabled={!areaRatingData.overall}
                activeOpacity={0.85}
              >
                <Text style={s.submitBtnText}>Salvar Avaliação</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ── Tab: Relatos ── */}
          {tab === "reports" && (
            <ScrollView style={s.body} keyboardShouldPersistTaps="handled">
              {/* Input de novo relato */}
              <View style={s.newReportBox}>
                <TextInput
                  style={s.newReportInput}
                  placeholder="Compartilhe sua experiência nesta zona…"
                  placeholderTextColor={C.subtle}
                  multiline
                  value={comment}
                  onChangeText={setComment}
                  maxLength={400}
                />
                <View style={s.newReportFooter}>
                  <Text style={s.charCount}>{comment.length}/400</Text>
                  <TouchableOpacity
                    style={[s.postBtn, (!comment.trim() || submitting) && s.postBtnDisabled]}
                    onPress={handleAddReport}
                    disabled={!comment.trim() || submitting}
                    activeOpacity={0.85}
                  >
                    {submitting
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={s.postBtnText}>Publicar</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>

              {/* Lista de relatos */}
              {loadingReports ? (
                <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 32 }} />
              ) : reports.length === 0 ? (
                <View style={s.emptyState}>
                  <Text style={s.emptyEmoji}>💬</Text>
                  <Text style={s.emptyTitle}>Nenhum relato ainda</Text>
                  <Text style={s.emptySubtitle}>Seja o primeiro a compartilhar como é esta zona!</Text>
                </View>
              ) : (
                reports.map((report, i) => (
                  <ReportCard
                    key={report._id || i}
                    report={report}
                    areaId={areaId}
                    myUserId={myUserId}
                    onVoteUpdate={fetchReports}
                  />
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  sheet: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  sheetWide: {
    maxWidth: 600,
    borderRadius: 20,
    marginBottom: 40,
    maxHeight: "85%",
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderLeftWidth: 5,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  zoneName: { fontSize: 17, fontWeight: "800", color: C.text, marginBottom: 6 },
  headerMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  ratingBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  ratingBadgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  ratingCountText: { fontSize: 11, color: C.muted },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: C.border, alignItems: "center", justifyContent: "center",
  },
  closeBtnText: { fontSize: 13, fontWeight: "700", color: C.muted },

  // ── Tabs ──
  tabBar: { flexDirection: "row", borderBottomWidth: 1, borderColor: C.border },
  tabBtn: { flex: 1, paddingVertical: 13, alignItems: "center" },
  tabBtnActive: { borderBottomWidth: 2, borderColor: C.primary },
  tabLabel: { fontSize: 13, fontWeight: "600", color: C.subtle },
  tabLabelActive: { color: C.primary },

  // ── Body ──
  body: { maxHeight: 480, paddingHorizontal: 18, paddingTop: 16 },

  // ── Sections ──
  sectionTitle: { fontSize: 13, fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  sectionSub: { fontSize: 12, color: C.subtle, marginBottom: 14, marginTop: -8 },
  avgSection: { marginBottom: 4 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 18 },

  // ── Rating Row ──
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  ratingMeta: { flex: 2 },
  ratingLabel: { fontSize: 13, fontWeight: "600", color: C.text, marginBottom: 4 },
  avgBarWrap: {
    height: 4, backgroundColor: C.border, borderRadius: 2, overflow: "hidden",
  },
  avgBar: { height: 4, borderRadius: 2 },
  starsWrap: { flex: 2, flexDirection: "row", justifyContent: "center", gap: 2 },
  starBtn: { padding: 4 },
  starGlyph: { fontSize: IS_WIDE ? 26 : 22, lineHeight: IS_WIDE ? 30 : 26 },
  ratingNum: { width: 28, textAlign: "right", fontSize: 13, fontWeight: "700" },

  // ── Submit rating ──
  submitBtn: {
    backgroundColor: C.primary, paddingVertical: 14, borderRadius: 12,
    alignItems: "center", marginTop: 8, marginBottom: 24,
  },
  submitBtnDisabled: { backgroundColor: C.border },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // ── New report ──
  newReportBox: {
    backgroundColor: C.surface, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 14, marginBottom: 18,
  },
  newReportInput: {
    fontSize: 14, color: C.text, minHeight: 72,
    textAlignVertical: "top", lineHeight: 20,
  },
  newReportFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  charCount: { fontSize: 11, color: C.subtle },
  postBtn: {
    backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 9,
    borderRadius: 10, minWidth: 90, alignItems: "center",
  },
  postBtnDisabled: { backgroundColor: C.border },
  postBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // ── Empty state ──
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.text, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: C.muted, textAlign: "center", lineHeight: 18 },

  // ── Report card ──
  reportCard: {
    backgroundColor: C.bg, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 14, marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  reportHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 10 },
  reportMeta: { flex: 1 },
  reportName: { fontSize: 14, fontWeight: "700", color: C.text },
  reportTime: { fontSize: 11, color: C.subtle },
  reportText: { fontSize: 14, color: C.text, lineHeight: 21, marginBottom: 12 },

  // Moral pill
  moralPill: {
    alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8, marginTop: 3,
  },
  moralPillText: { fontSize: 10, fontWeight: "700" },

  // ── Vote row ──
  voteRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  voteBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surface, minWidth: 56, justifyContent: "center",
  },
  voteBtnActiveUp: {
    backgroundColor: C.greenSoft, borderColor: C.green,
  },
  voteBtnActiveDown: {
    backgroundColor: C.redSoft, borderColor: C.red,
  },
  voteIcon: { fontSize: 11, color: C.muted, fontWeight: "700" },
  voteCount: { fontSize: 13, fontWeight: "700", color: C.muted },
  ownLabel: { fontSize: 11, color: C.subtle, fontStyle: "italic", marginLeft: 4 },

  // ── Avatar ──
  avatar: { justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontWeight: "700" },
});

export default AreaRatingForm;