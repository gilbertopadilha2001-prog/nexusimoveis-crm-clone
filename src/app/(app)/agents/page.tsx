"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Phone,
  Mail,
  Edit2,
  Trash2,
  MessageSquare,
  X,
  Loader2,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  creci: string | null;
  active: boolean;
  avatar: string | null;
  createdAt: string;
}

type ModalType = "create" | "edit" | "delete" | "password" | null;

const inputClass =
  "w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  // Modal state
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCreci, setFormCreci] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"AGENT" | "ADMIN">("AGENT");
  const [showPassword, setShowPassword] = useState(false);

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (err) {
      console.error("Erro ao carregar corretores:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const clearForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormCreci("");
    setFormPassword("");
    setFormRole("AGENT");
    setShowPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPw(false);
    setShowNewPw(false);
    setFeedback(null);
  };

  const openModal = (type: ModalType, agent?: Agent) => {
    clearForm();
    if (agent) {
      setSelectedAgent(agent);
      if (type === "edit") {
        setFormName(agent.name);
        setFormEmail(agent.email);
        setFormPhone(agent.phone || "");
        setFormCreci(agent.creci || "");
        setFormRole(agent.role as "AGENT" | "ADMIN");
      }
    }
    setModal(type);
  };

  const closeModal = () => {
    setModal(null);
    setSelectedAgent(null);
    clearForm();
  };

  // CREATE
  const handleCreate = async () => {
    if (!formName || !formEmail || !formPassword) {
      setFeedback({ type: "error", msg: "Nome, email e senha são obrigatórios" });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          phone: formPhone || null,
          creci: formCreci || null,
          role: formRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", msg: data.error || "Erro ao criar" });
        return;
      }
      await fetchAgents();
      closeModal();
    } catch {
      setFeedback({ type: "error", msg: "Erro de conexão" });
    } finally {
      setSaving(false);
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!selectedAgent || !formName || !formEmail) {
      setFeedback({ type: "error", msg: "Nome e email são obrigatórios" });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const body: Record<string, unknown> = {
        name: formName,
        email: formEmail,
        phone: formPhone || null,
        creci: formCreci || null,
        role: formRole,
      };
      if (formPassword) body.password = formPassword;

      const res = await fetch(`/api/users/${selectedAgent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", msg: data.error || "Erro ao atualizar" });
        return;
      }
      await fetchAgents();
      closeModal();
    } catch {
      setFeedback({ type: "error", msg: "Erro de conexão" });
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (!selectedAgent) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/users/${selectedAgent.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", msg: data.error || "Erro ao excluir" });
        return;
      }
      await fetchAgents();
      closeModal();
    } catch {
      setFeedback({ type: "error", msg: "Erro de conexão" });
    } finally {
      setSaving(false);
    }
  };

  // TOGGLE ACTIVE
  const handleToggleActive = async (agent: Agent) => {
    try {
      await fetch(`/api/users/${agent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !agent.active }),
      });
      await fetchAgents();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
    }
  };

  // CHANGE PASSWORD
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setFeedback({ type: "error", msg: "Preencha todos os campos" });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ type: "error", msg: "A nova senha deve ter pelo menos 6 caracteres" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", msg: "As senhas não coincidem" });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", msg: data.error || "Erro ao alterar senha" });
        return;
      }
      setFeedback({ type: "success", msg: "Senha alterada com sucesso!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setFeedback({ type: "error", msg: "Erro de conexão" });
    } finally {
      setSaving(false);
    }
  };

  const filtered = agents.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.creci || "").toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" && a.active) ||
      (filter === "inactive" && !a.active);
    return matchSearch && matchFilter;
  });

  const activeCount = agents.filter((a) => a.active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Corretores</h1>
          <p className="text-muted-foreground text-sm">
            {activeCount} ativos de {agents.length} cadastrados
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openModal("password")}
            className="inline-flex items-center gap-2 rounded-xl text-sm font-medium h-10 px-4 border border-border bg-card hover:bg-muted transition-colors"
          >
            <Key className="h-4 w-4" />
            Alterar Senha
          </button>
          <button
            onClick={() => openModal("create")}
            className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold h-10 px-5 transition-colors"
            style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}
          >
            <Plus className="h-4 w-4" />
            Novo Corretor
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, CRECI ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1 bg-card rounded-lg border p-1">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "all" ? "Todos" : f === "active" ? "Ativos" : "Inativos"}
            </button>
          ))}
        </div>
      </div>

      {/* Agent cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((agent) => (
          <div key={agent.id} className="rounded-xl border bg-card shadow-sm hover:shadow-elevated transition-shadow">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      backgroundColor: agent.active ? "var(--nexus-gold)" : "#F2F3F6",
                      color: agent.active ? "var(--nexus-dark)" : "#56585E",
                    }}
                  >
                    {agent.avatar || agent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {agent.creci ? `CRECI ${agent.creci}` : "Sem CRECI"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(agent)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                    agent.active
                      ? "bg-success/15 text-success hover:bg-success/25"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                  title={agent.active ? "Clique para desativar" : "Clique para ativar"}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${agent.active ? "bg-success" : "bg-muted-foreground"}`} />
                  {agent.active ? "Ativo" : "Inativo"}
                </button>
              </div>

              {/* Contact info */}
              <div className="space-y-2 mb-4">
                {agent.phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{agent.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{agent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MessageSquare className="h-3.5 w-3.5" style={{ color: "#9CA3AF" }} />
                  <span style={{ color: "#9CA3AF" }}>WhatsApp pendente</span>
                </div>
              </div>

              {/* Role badge */}
              <div className="pt-3 border-t">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    agent.role === "ADMIN"
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {agent.role === "ADMIN" ? "Administrador" : "Corretor"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t px-5 py-3 flex gap-2">
              <button
                onClick={() => openModal("edit", agent)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Editar
              </button>
              <button
                onClick={() => openModal("delete", agent)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive py-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Nenhum corretor encontrado</p>
        </div>
      )}

      {/* ===== MODAL: CREATE / EDIT ===== */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeModal}>
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-display font-bold text-lg">
                {modal === "create" ? "Novo Corretor" : "Editar Corretor"}
              </h2>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nome completo *</label>
                <input
                  className={inputClass}
                  placeholder="Ex: Maria Silva"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email *</label>
                <input
                  className={inputClass}
                  placeholder="corretor@nexusimoveis.com.br"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Telefone</label>
                  <input
                    className={inputClass}
                    placeholder="(41) 99999-0000"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">CRECI</label>
                  <input
                    className={inputClass}
                    placeholder="F-00000"
                    value={formCreci}
                    onChange={(e) => setFormCreci(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  {modal === "create" ? "Senha *" : "Nova senha (deixe vazio para manter)"}
                </label>
                <div className="relative">
                  <input
                    className={`${inputClass} pr-10`}
                    placeholder={modal === "create" ? "Mínimo 6 caracteres" : "Deixe vazio para manter"}
                    type={showPassword ? "text" : "password"}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tipo de acesso</label>
                <select
                  className={inputClass}
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as "AGENT" | "ADMIN")}
                >
                  <option value="AGENT">Corretor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              {feedback && (
                <div
                  className={`rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2 ${
                    feedback.type === "error"
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : "bg-success/10 text-success border border-success/20"
                  }`}
                >
                  {feedback.type === "error" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  {feedback.msg}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={modal === "create" ? handleCreate : handleUpdate}
                  disabled={saving}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {modal === "create" ? "Cadastrar" : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: DELETE ===== */}
      {modal === "delete" && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeModal}>
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              <h2 className="font-display font-bold text-lg mb-2">Excluir Corretor</h2>
              <p className="text-sm text-muted-foreground mb-1">
                Tem certeza que deseja excluir
              </p>
              <p className="text-sm font-semibold mb-4">{selectedAgent.name}?</p>
              <p className="text-xs text-muted-foreground mb-6">
                Esta ação não pode ser desfeita. Todos os dados serão removidos.
              </p>

              {feedback && (
                <div className="rounded-lg px-4 py-3 text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {feedback.msg}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 h-10 rounded-xl bg-destructive text-white text-sm font-semibold hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: CHANGE PASSWORD ===== */}
      {modal === "password" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeModal}>
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <h2 className="font-display font-bold text-lg">Alterar Senha</h2>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Senha atual</label>
                <div className="relative">
                  <input
                    className={`${inputClass} pr-10`}
                    type={showCurrentPw ? "text" : "password"}
                    placeholder="Digite sua senha atual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nova senha</label>
                <div className="relative">
                  <input
                    className={`${inputClass} pr-10`}
                    type={showNewPw ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Confirmar nova senha</label>
                <input
                  className={inputClass}
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive mt-1">As senhas não coincidem</p>
                )}
              </div>

              {feedback && (
                <div
                  className={`rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2 ${
                    feedback.type === "error"
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : "bg-success/10 text-success border border-success/20"
                  }`}
                >
                  {feedback.type === "error" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  {feedback.msg}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Alterar Senha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
