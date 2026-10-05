"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Trophy,
  Dumbbell,
  CheckCircle2,
  XCircle,
  Plus,
  Flame,
  Search,
  Camera,
  Upload,
  Image as ImageIcon,
  Smile,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { calculateOVR } from "@/components/ui/HoloPlayerCard";
import { compressImageToDataUrl } from "@/lib/imageUtils";
import { sounds } from "@/lib/sound";
import { PlayerStats } from "@/lib/calculations";

interface Player {
  id: string;
  name: string;
  nickname: string | null;
  avatar: string | null;
  active: boolean;
  totalGames: number;
  wins: number;
  losses: number;
  totalPoints: number;
  totalPushups: number;
  completedPushups: number;
  pendingPushups: number;
  winRate: number;
}

const AVATAR_OPTIONS = [
  "🏀", "👑", "⚡", "💪", "🎯", "🔥", "⚓", "🌟",
  "🦁", "🦈", "🚀", "🎩", "💀", "🦖", "🏆", "🦄"
];

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState("🏀");
  const [avatarTab, setAvatarTab] = useState<"photo" | "emoji">("photo");
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/players");
      if (res.ok) {
        const data = await res.json();
        setPlayers(data);
      }
    } catch (err) {
      console.error("Failed to fetch players", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleOpenAdd = () => {
    setName("");
    setNickname("");
    setAvatar("🏀");
    setAvatarTab("photo");
    setActive(true);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Player) => {
    setSelectedPlayer(p);
    setName(p.name);
    setNickname(p.nickname || "");
    const initialAvatar = p.avatar || "🏀";
    setAvatar(initialAvatar);
    setAvatarTab(
      initialAvatar.startsWith("/") ||
        initialAvatar.startsWith("http") ||
        initialAvatar.startsWith("data:image")
        ? "photo"
        : "emoji"
    );
    setActive(p.active);
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Handle Photo File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFormError("Maximum photo size is 10MB.");
      return;
    }

    try {
      setUploadingPhoto(true);
      setFormError(null);

      // Compress client-side into high-quality square 256x256 WebP / JPEG base64 data URL
      const dataUrl = await compressImageToDataUrl(file, 256, 0.88);
      setAvatar(dataUrl);
      sounds.playClick();
    } catch (err) {
      console.error("Upload error", err);
      const msg = err instanceof Error ? err.message : "Failed to process photo";
      setFormError(msg);
    } finally {
      setUploadingPhoto(false);
      // Reset input value so same file can be reselected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setAvatar("🏀");
    sounds.playClick();
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Player name is required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nickname, avatar }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create player");
      }

      sounds.playClick();
      setIsAddModalOpen(false);
      await fetchPlayers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create player";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    if (!name.trim()) {
      setFormError("Player name is required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      const res = await fetch(`/api/players/${selectedPlayer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nickname, avatar, active }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update player");
      }

      sounds.playClick();
      setIsEditModalOpen(false);
      await fetchPlayers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update player";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlayer = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" and all their game records?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
      if (res.ok) {
        sounds.playClick();
        await fetchPlayers();
      }
    } catch (err) {
      console.error("Failed to delete player", err);
    }
  };

  const isPhotoAvatar =
    avatar &&
    (avatar.startsWith("/") ||
      avatar.startsWith("http") ||
      avatar.startsWith("data:image"));

  const filteredPlayers = players.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.nickname && p.nickname.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <span>👥</span> PLAYER ROSTER
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your office shooters, profile pictures, nicknames, and punishment records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-hoop-orange to-hoop-amber px-5 py-3 text-sm font-black text-white uppercase tracking-wider shadow-lg shadow-hoop-orange/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <UserPlus className="w-4 h-4" />
          ADD PLAYER
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by player name or nickname..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-surface/80 pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-hoop-orange focus:outline-none focus:ring-1 focus:ring-hoop-orange"
        />
      </div>

      {/* PLAYERS GRID */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading player roster...</div>
      ) : filteredPlayers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-gray-400 space-y-4">
          <Users className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="font-semibold">No players found matching your search.</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
          >
            <Plus className="w-4 h-4" /> Add New Player
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => {
            const cardData = calculateOVR({
              id: player.id,
              name: player.name,
              nickname: player.nickname,
              avatar: player.avatar,
              active: player.active,
              totalGames: player.totalGames,
              wins: player.wins,
              losses: player.losses,
              winRate: player.winRate,
              lossRate: 100 - player.winRate,
              totalPoints: player.totalPoints,
              averageScore: player.totalGames > 0 ? player.totalPoints / player.totalGames : 0,
              bestScore: 3,
              totalShots: player.totalGames * 3,
              totalHits: player.totalPoints,
              totalMisses: player.totalGames * 3 - player.totalPoints,
              accuracy: player.totalGames > 0 ? (player.totalPoints / (player.totalGames * 3)) * 100 : 50,
              totalPushups: player.totalPushups,
              completedPushups: player.completedPushups,
              pendingPushups: player.pendingPushups,
              avgPushupsPerGame: 0,
              currentWinStreak: 0,
              currentLossStreak: 0,
              maxWinStreak: 0,
            });

            return (
              <motion.div
                key={player.id}
                whileHover={{ y: -2 }}
                className={`rounded-3xl border p-5 backdrop-blur-md transition-all ${
                  player.active
                    ? "border-white/10 bg-surface/80 hover:border-hoop-orange/30"
                    : "border-white/5 bg-surface/40 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <Link
                    href={`/players/${player.id}`}
                    className="flex items-center gap-3.5 group flex-1 min-w-0"
                  >
                    <PlayerAvatar
                      avatar={player.avatar}
                      name={player.name}
                      size="lg"
                      className="group-hover:scale-105 transition-transform ring-1 ring-white/20"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-lg text-white group-hover:text-hoop-orange transition-colors truncate">
                          {player.name}
                        </h3>
                        <span className="flex-shrink-0 rounded-lg bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase text-hoop-amber border border-white/15">
                          {cardData.ovr} OVR
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-400 truncate mt-0.5">
                        {player.nickname ? `"${player.nickname}"` : cardData.archetype}
                      </p>
                    </div>
                  </Link>

                  {/* Card Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(player)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                      title="Edit Player & Photo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePlayer(player.id, player.name)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                      title="Delete Player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              {/* STATS MATRIX */}
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center">
                <div className="rounded-xl bg-white/[0.03] p-2">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Wins</p>
                  <p className="text-sm font-black text-champion-gold">
                    {player.wins} <span className="text-[10px] text-gray-400 font-normal">({player.winRate}%)</span>
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.03] p-2">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Points</p>
                  <p className="text-sm font-black text-white">{player.totalPoints}</p>
                </div>

                <div className="rounded-xl bg-white/[0.03] p-2">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Push-ups</p>
                  <p className="text-sm font-black text-rose-400">
                    {player.totalPushups}
                  </p>
                </div>
              </div>

              {/* VIEW PROFILE LINK */}
              <Link
                href={`/players/${player.id}`}
                className="mt-4 block w-full rounded-xl bg-white/5 py-2 text-center text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                View Full Profile &rarr;
              </Link>
            </motion.div>
            );
          })}
        </div>
      )}

      {/* ADD PLAYER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="🏀 Add New Shooter"
      >
        <form onSubmit={handleCreatePlayer} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Player Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mul, Jessy, Surya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-hoop-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Nickname (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Captain, Sniper, Clutch King"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-hoop-orange focus:outline-none"
            />
          </div>

          {/* AVATAR & PHOTO SELECTION */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Profile Picture / Avatar
            </label>

            {/* TAB SELECTOR: PHOTO vs EMOJI */}
            <div className="grid grid-cols-2 gap-2 mb-3 bg-surface p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setAvatarTab("photo")}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                  avatarTab === "photo"
                    ? "bg-hoop-orange text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Upload Photo
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab("emoji")}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                  avatarTab === "emoji"
                    ? "bg-hoop-orange text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                Choose Emoji
              </button>
            </div>

            {avatarTab === "photo" ? (
              <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-4 text-center space-y-3">
                {isPhotoAvatar ? (
                  <div className="flex flex-col items-center gap-3">
                    <PlayerAvatar avatar={avatar} name={name} size="2xl" ring />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
                      >
                        <Camera className="w-3.5 h-3.5" /> Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-gray-400">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Upload Player Photo</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, WebP (Max 10MB)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="inline-flex items-center gap-2 rounded-xl bg-hoop-orange px-4 py-2 text-xs font-black text-white uppercase tracking-wider shadow-md hover:bg-hoop-amber transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingPhoto ? "Uploading..." : "Choose Photo from Device"}
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setAvatar(em)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${
                      avatar === em
                        ? "bg-hoop-orange ring-2 ring-white scale-110"
                        : "bg-white/5 hover:bg-white/15"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-gray-400 hover:bg-white/5 uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingPhoto}
              className="rounded-xl bg-gradient-to-r from-hoop-orange to-hoop-amber px-5 py-2.5 text-xs font-black text-white uppercase tracking-wider shadow-lg shadow-hoop-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Create Player"}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PLAYER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="✏️ Edit Shooter &amp; Photo"
      >
        <form onSubmit={handleUpdatePlayer} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Player Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2.5 text-sm text-white focus:border-hoop-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface-light px-4 py-2.5 text-sm text-white focus:border-hoop-orange focus:outline-none"
            />
          </div>

          {/* AVATAR & PHOTO SELECTION */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Profile Picture / Avatar
            </label>

            {/* TAB SELECTOR: PHOTO vs EMOJI */}
            <div className="grid grid-cols-2 gap-2 mb-3 bg-surface p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setAvatarTab("photo")}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                  avatarTab === "photo"
                    ? "bg-hoop-orange text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Upload Photo
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab("emoji")}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                  avatarTab === "emoji"
                    ? "bg-hoop-orange text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                Choose Emoji
              </button>
            </div>

            {avatarTab === "photo" ? (
              <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-4 text-center space-y-3">
                {isPhotoAvatar ? (
                  <div className="flex flex-col items-center gap-3">
                    <PlayerAvatar avatar={avatar} name={name} size="2xl" ring />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
                      >
                        <Camera className="w-3.5 h-3.5" /> Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-gray-400">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Upload Player Photo</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, WebP (Max 10MB)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="inline-flex items-center gap-2 rounded-xl bg-hoop-orange px-4 py-2 text-xs font-black text-white uppercase tracking-wider shadow-md hover:bg-hoop-amber transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingPhoto ? "Uploading..." : "Choose Photo from Device"}
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setAvatar(em)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${
                      avatar === em
                        ? "bg-hoop-orange ring-2 ring-white scale-110"
                        : "bg-white/5 hover:bg-white/15"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="activeCheckbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-surface text-hoop-orange focus:ring-hoop-orange"
            />
            <label htmlFor="activeCheckbox" className="text-xs font-semibold text-gray-300">
              Active (Available for new games)
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-gray-400 hover:bg-white/5 uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingPhoto}
              className="rounded-xl bg-gradient-to-r from-hoop-orange to-hoop-amber px-5 py-2.5 text-xs font-black text-white uppercase tracking-wider shadow-lg shadow-hoop-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
