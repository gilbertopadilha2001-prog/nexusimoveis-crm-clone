"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Smartphone, Lock, User as UserIcon, Mail, Phone as PhoneIcon, FileText, LogOut } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  creci: string | null;
  role: string;
  avatar: string | null;
  whatsappInstanceId: string | null;
  whatsappPhone: string | null;
  whatsappStatus: string;
}

type ModalType = "edit-profile" | "change-password" | "whatsapp-qr" | null;

const inputClass = "w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
const labelClass = "text-sm font-medium text-muted-foreground";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form states
  const [editData, setEditData] = useState({ name: "", email: "", phone: "", creci: "" });
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  // WhatsApp states
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  useEffect(() => {
    if (modal === "whatsapp-qr" && profile?.whatsappStatus === "scanning") {
      const interval = setInterval(() => {
        checkWhatsappStatus();
        setRefreshCount((c) => c + 1);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [modal, profile?.whatsappStatus]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditData({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          creci: data.creci || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setFeedback({ type: "error", message: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsappQR = async () => {
    try {
      setWhatsappLoading(true);
      const response = await fetch("/api/evolution/qrcode", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrcode);
        setModal("whatsapp-qr");

        // Update profile to show scanning status
        await fetchProfile();
      } else {
        setFeedback({ type: "error", message: "Failed to generate QR code" });
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      setFeedback({ type: "error", message: "Error generating QR code" });
    } finally {
      setWhatsappLoading(false);
    }
  };

  const checkWhatsappStatus = async () => {
    try {
      const response = await fetch("/api/evolution/status");
      if (response.ok) {
        const data = await response.json();
        setProfile((prev) => (prev ? { ...prev, whatsappStatus: data.status, whatsappPhone: data.phone } : null));

        if (data.status === "connected") {
          setFeedback({ type: "success", message: "WhatsApp connected successfully!" });
          setModal(null);
          setQrCode(null);
        }
      }
    } catch (error) {
      console.error("Error checking WhatsApp status:", error);
    }
  };

  const disconnectWhatsapp = async () => {
    try {
      setWhatsappLoading(true);
      const response = await fetch("/api/evolution/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        await fetchProfile();
        setFeedback({ type: "success", message: "WhatsApp disconnected" });
      } else {
        setFeedback({ type: "error", message: "Failed to disconnect WhatsApp" });
      }
    } catch (error) {
      console.error("Error disconnecting WhatsApp:", error);
      setFeedback({ type: "error", message: "Error disconnecting WhatsApp" });
    } finally {
      setWhatsappLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setFeedback({ type: "success", message: "Profile updated successfully" });
        setModal(null);
      } else {
        const error = await response.json();
        setFeedback({ type: "error", message: error.error || "Failed to update profile" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setFeedback({ type: "error", message: "Error updating profile" });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new !== passwordData.confirm) {
      setFeedback({ type: "error", message: "Passwords do not match" });
      return;
    }

    if (passwordData.new.length < 6) {
      setFeedback({ type: "error", message: "Password must be at least 6 characters" });
      return;
    }

    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new,
        }),
      });

      if (response.ok) {
        setFeedback({ type: "success", message: "Password changed successfully" });
        setPasswordData({ current: "", new: "", confirm: "" });
        setModal(null);
      } else {
        const error = await response.json();
        setFeedback({ type: "error", message: error.error || "Failed to change password" });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setFeedback({ type: "error", message: "Error changing password" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Meu Perfil</h1>
          <p className="text-muted-foreground mt-2">{profile.role === "ADMIN" ? "Administrador" : "Corretor"}</p>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              feedback.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="grid gap-6">
          {/* Personal Information */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Informações Pessoais</h2>
              </div>
              <button
                onClick={() => {
                  setEditData({
                    name: profile.name,
                    email: profile.email,
                    phone: profile.phone || "",
                    creci: profile.creci || "",
                  });
                  setModal("edit-profile");
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition"
              >
                Editar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={labelClass}>Nome</p>
                <p className="text-foreground font-medium">{profile.name}</p>
              </div>
              <div>
                <p className={labelClass}>Email</p>
                <p className="text-foreground font-medium">{profile.email}</p>
              </div>
              {profile.phone && (
                <div>
                  <p className={labelClass}>Telefone</p>
                  <p className="text-foreground font-medium">{profile.phone}</p>
                </div>
              )}
              {profile.creci && (
                <div>
                  <p className={labelClass}>CRECI</p>
                  <p className="text-foreground font-medium">{profile.creci}</p>
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp Section */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">WhatsApp</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-background">
                <div>
                  <p className={labelClass}>Status</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        profile.whatsappStatus === "connected"
                          ? "bg-green-500"
                          : profile.whatsappStatus === "scanning"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                      }`}
                    />
                    <span className="font-medium">
                      {profile.whatsappStatus === "connected"
                        ? "Conectado"
                        : profile.whatsappStatus === "scanning"
                        ? "Conectando..."
                        : "Desconectado"}
                    </span>
                  </div>
                </div>

                {profile.whatsappStatus === "connected" && profile.whatsappPhone ? (
                  <div className="text-right">
                    <p className={labelClass}>Número</p>
                    <p className="font-medium">{profile.whatsappPhone}</p>
                  </div>
                ) : null}
              </div>

              {profile.whatsappStatus === "disconnected" ? (
                <button
                  onClick={generateWhatsappQR}
                  disabled={whatsappLoading}
                  className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition"
                >
                  {whatsappLoading ? "Gerando QR Code..." : "Conectar WhatsApp"}
                </button>
              ) : (
                <button
                  onClick={disconnectWhatsapp}
                  disabled={whatsappLoading}
                  className="w-full px-4 py-2 rounded-lg bg-red-600 text-white hover:opacity-90 disabled:opacity-50 transition"
                >
                  {whatsappLoading ? "Desconectando..." : "Desconectar WhatsApp"}
                </button>
              )}
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Segurança</h2>
            </div>

            <button
              onClick={() => {
                setPasswordData({ current: "", new: "", confirm: "" });
                setModal("change-password");
              }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition"
            >
              Alterar Senha
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}

      {/* Edit Profile Modal */}
      {modal === "edit-profile" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Editar Perfil</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className={labelClass}>Nome</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Telefone</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className={inputClass}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className={labelClass}>CRECI</label>
                <input
                  type="text"
                  value={editData.creci}
                  onChange={(e) => setEditData({ ...editData, creci: e.target.value })}
                  className={inputClass}
                  placeholder="Opcional"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {modal === "change-password" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Alterar Senha</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className={labelClass}>Senha Atual</label>
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Confirmar Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp QR Modal */}
      {modal === "whatsapp-qr" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Conectar WhatsApp</h3>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Escaneie este código QR com seu celular para conectar sua conta do WhatsApp.
              </p>

              {qrCode ? (
                <div className="flex justify-center p-4 bg-background rounded-lg">
                  <img
                    src={qrCode}
                    alt="WhatsApp QR Code"
                    className="w-64 h-64"
                  />
                </div>
              ) : (
                <div className="flex justify-center p-4 bg-background rounded-lg">
                  <div className="text-muted-foreground">Gerando QR Code...</div>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Atualizando a cada 3 segundos... (Tentativa {refreshCount})
              </p>

              <button
                type="button"
                onClick={() => {
                  setModal(null);
                  setQrCode(null);
                }}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
