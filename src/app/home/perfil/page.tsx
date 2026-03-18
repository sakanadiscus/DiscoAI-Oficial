"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Fish, Scan, Heart, User, LogOut, CreditCard, Crown, Trash2, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const navItems = [
  { href: "/home", icon: Fish, label: "Inicio" },
  { href: "/home/identificar", icon: Scan, label: "Identificar" },
  { href: "/home/salud", icon: Heart, label: "Salud" },
  { href: "/home/perfil", icon: User, label: "Perfil" },
];

export default function PerfilPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [plan, setPlan] = useState<"free" | "premium">("free");
  const [creditos, setCreditos] = useState(3);
  const [loading, setLoading] = useState(true);
  const [historial, setHistorial] = useState<Array<{ id: string; tipo_scan: string; resultado_json: any; fecha: string }>>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchUserData() {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("plan, creditos_salud")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setPlan(data.plan as "free" | "premium");
        setCreditos(data.creditos_salud);
      }
      setLoading(false);
    }

    async function fetchHistorial() {
      if (!user) return;
      const { data } = await supabase
        .from("scan_history")
        .select("*")
        .eq("user_id", user.id)
        .order("fecha", { ascending: false })
        .limit(10);
      if (data) {
        setHistorial(data);
      }
    }

    if (user) {
      fetchUserData();
      fetchHistorial();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.push("/auth");
  };

  const clearHistory = async () => {
    if (!user) return;
    await supabase.from("scan_history").delete().eq("user_id", user.id);
    setHistorial([]);
  };

  const exportHistory = () => {
    if (historial.length === 0) return;
    const csv = [
      ["Fecha", "Tipo", "Resultado"].join(","),
      ...historial.map((h) =>
        [new Date(h.fecha).toLocaleDateString(), h.tipo_scan, h.resultado_json?.nombre || "N/A"].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "discoai_historial.csv";
    a.click();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A2540]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00C9A7]"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A2540] pb-20">
      {/* Header */}
      <header className="bg-[#0D3461] px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#00C9A7]/20 flex items-center justify-center">
            <User className="w-8 h-8 text-[#00C9A7]" />
          </div>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">{user.email?.split("@")[0]}</h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
          {plan === "premium" && (
            <div className="flex items-center gap-1 bg-[#F5A623]/20 px-3 py-1 rounded-full">
              <Crown className="w-4 h-4 text-[#F5A623]" />
              <span className="text-[#F5A623] text-sm font-medium">PRO</span>
            </div>
          )}
        </div>
      </header>

      <div className="p-4">
        {/* Subscription Card */}
        <div className="bg-[#0D3461] rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Plan Actual</p>
              <p className="text-white font-bold text-lg">{plan === "premium" ? "Premium" : "Free"}</p>
            </div>
            {plan === "free" ? (
              <Link href="/home/premium">
                <Button className="bg-[#F5A623] hover:bg-[#E09000] text-[#0A2540] font-semibold">
                  Actualizar
                </Button>
              </Link>
            ) : (
              <Button variant="outline" className="border-gray-600 text-gray-400">
                <CreditCard className="w-4 h-4 mr-2" />
                Gestionar
              </Button>
            )}
          </div>

          {plan === "free" && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Créditos de Salud</span>
                <span className="text-[#00C9A7] font-bold">{creditos} / 3</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00C9A7] transition-all"
                  style={{ width: `${(creditos / 3) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#0D3461] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{historial.filter(h => h.tipo_scan === "variedad").length}</p>
            <p className="text-gray-400 text-xs">Identificaciones</p>
          </div>
          <div className="bg-[#0D3461] rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{historial.filter(h => h.tipo_scan === "enfermedad").length}</p>
            <p className="text-gray-400 text-xs">Diagnósticos</p>
          </div>
        </div>

        {/* History */}
        <div className="bg-[#0D3461] rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Historial</h3>
            <div className="flex gap-2">
              {historial.length > 0 && (
                <>
                  <button onClick={exportHistory} className="text-gray-400 hover:text-white">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={clearHistory} className="text-gray-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {historial.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Sin historial todavía</p>
          ) : (
            <div className="space-y-3">
              {historial.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.tipo_scan === "variedad" ? "bg-[#00C9A7]/20" : "bg-[#F5A623]/20"
                    }`}>
                      {item.tipo_scan === "variedad" ? (
                        <Scan className="w-4 h-4 text-[#00C9A7]" />
                      ) : (
                        <Heart className="w-4 h-4 text-[#F5A623]" />
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm">
                        {item.resultado_json?.nombre || item.resultado_json?.nombre || "Análisis"}
                      </p>
                      <p className="text-gray-500 text-xs capitalize">{item.tipo_scan}</p>
                    </div>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {new Date(item.fecha).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-[#0D3461] rounded-2xl p-4 mb-6">
          <h3 className="text-white font-bold mb-4">Configuración</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#0A2540] transition-colors text-left">
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300">Preferencias</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#0A2540] transition-colors text-left">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300">Métodos de pago</span>
            </button>
          </div>
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0D3461] border-t border-gray-700 px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? "text-[#00C9A7]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
