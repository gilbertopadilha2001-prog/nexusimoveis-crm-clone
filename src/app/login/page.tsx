"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Nome ou senha incorretos");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0D141A" }}>
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(255,212,112,0.3), transparent 60%)",
          }}
        />
        <div className="relative z-10 text-center">
          <Image
            src="/images/nexus-logo.png"
            alt="Nexus Imóveis"
            width={120}
            height={120}
            className="mx-auto mb-8 rounded-2xl"
          />
          <h1
            className="text-4xl font-display font-bold mb-4"
            style={{ color: "#FFD470" }}
          >
            Dashboard Nexus
          </h1>
          <p className="text-lg text-white/60 max-w-md">
            CRM Imobiliário integrado com WhatsApp Business para gestão
            completa de leads e vendas.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <p
                className="text-2xl font-display font-bold"
                style={{ color: "#FFD470" }}
              >
                10
              </p>
              <p className="text-xs text-white/40">Corretores</p>
            </div>
            <div>
              <p
                className="text-2xl font-display font-bold"
                style={{ color: "#FFD470" }}
              >
                247
              </p>
              <p className="text-xs text-white/40">Leads ativos</p>
            </div>
            <div>
              <p
                className="text-2xl font-display font-bold"
                style={{ color: "#FFD470" }}
              >
                18.5%
              </p>
              <p className="text-xs text-white/40">Conversão</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/images/nexus-logo.png"
              alt="Nexus Imóveis"
              width={80}
              height={80}
              className="mx-auto mb-4 rounded-xl"
            />
            <h1
              className="text-2xl font-display font-bold"
              style={{ color: "#FFD470" }}
            >
              Dashboard Nexus
            </h1>
          </div>

          <div
            className="rounded-2xl p-8 shadow-2xl"
            style={{ backgroundColor: "#1D1E20", border: "1px solid #2A2B2E" }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-display font-bold text-white">
                Entrar no CRM
              </h2>
              <p className="text-sm text-white/50 mt-1">
                Acesse com suas credenciais
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Nome
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toUpperCase())}
                  placeholder="Seu nome de usuário"
                  required
                  autoComplete="username"
                  className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FFD470]/50 transition-all"
                  style={{
                    backgroundColor: "#0D141A",
                    border: "1px solid #2A2B2E",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                    className="w-full h-11 px-4 pr-11 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FFD470]/50 transition-all"
                    style={{
                      backgroundColor: "#0D141A",
                      border: "1px solid #2A2B2E",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="rounded-lg px-4 py-3 text-sm font-medium"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.1)",
                    color: "#EF4444",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: "#FFD470",
                  color: "#0D141A",
                }}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-white/30 mt-6">
            Nexus Inovações Imobiliárias &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
}
