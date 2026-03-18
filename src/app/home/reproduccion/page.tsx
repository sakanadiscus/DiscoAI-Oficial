"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Fish, Scan, Heart, User, Lock, ChevronLeft, Sparkles, Droplets, Thermometer, Calendar, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/home", icon: Fish, label: "Inicio" },
  { href: "/home/identificar", icon: Scan, label: "Identificar" },
  { href: "/home/salud", icon: Heart, label: "Salud" },
  { href: "/home/perfil", icon: User, label: "Perfil" },
];

const variedadGenetica = [
  "Blue Diamond", "Heckel", "Pigeon Blood", "Red Turquoise", "Albino",
  "Leopard", "Snake Skin", "Cobalt", "Golden", "Marlier"
];

export default function ReproduccionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"genetica" | "parametros" | "ciclo">("genetica");

  // Genetics form
  const [madre, setMadre] = useState("");
  const [padre, setPadre] = useState("");
  const [resultadoGenetico, setResultadoGenetico] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchPlan() {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setIsPremium(data.plan === "premium");
      }
      setLoading(false);
    }
    if (user) {
      fetchPlan();
    }
  }, [user]);

  const predecirCria = () => {
    if (!madre || !padre) return;
    // Simulate genetic prediction
    const predicciones = [
      "70% probabilidad de inherits coloración azul",
      "50% probabilidad de patrón Leopard",
      "Alta probabilidad de genes dominantes de padre",
      "30% probabilidad de variedad única",
      "60% probabilidad de salud robusta",
    ];
    setResultadoGenetico(predicciones[Math.floor(Math.random() * predicciones.length)]);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A2540]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F5A623]"></div>
      </div>
    );
  }

  if (!user) return null;

  // Locked view for non-premium
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-[#0A2540] flex items-center justify-center p-4">
        <div className="bg-[#0D3461] rounded-2xl p-8 max-w-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5A623]/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-[#F5A623]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Módulo Premium</h2>
          <p className="text-gray-400 mb-6">
            Este módulo está exclusivo para usuarios Premium. ¡Desbloquea acceso total!
          </p>
          <Link href="/home/premium">
            <Button className="w-full bg-[#F5A623] hover:bg-[#E09000] text-[#0A2540] font-semibold">
              Desbloquear Premium
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A2540] pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0D3461] to-[#F5A623]/20 px-4 py-4">
        <Link href="/home" className="flex items-center gap-2 text-white mb-4">
          <ChevronLeft className="w-5 h-5" />
          Volver
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F5A623]/20 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5 text-[#F5A623]" />
          </div>
          <div>
            <h1 className="text-white font-bold">Reproducción</h1>
            <p className="text-gray-400 text-xs">Módulo de Cría y Genética</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab("genetica")}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === "genetica"
              ? "text-[#F5A623] border-b-2 border-[#F5A623]"
              : "text-gray-400"
          }`}
        >
          Genética
        </button>
        <button
          onClick={() => setActiveTab("parametros")}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === "parametros"
              ? "text-[#F5A623] border-b-2 border-[#F5A623]"
              : "text-gray-400"
          }`}
        >
          Parámetros
        </button>
        <button
          onClick={() => setActiveTab("ciclo")}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === "ciclo"
              ? "text-[#F5A623] border-b-2 border-[#F5A623]"
              : "text-gray-400"
          }`}
        >
          Ciclo
        </button>
      </div>

      <div className="p-4">
        {/* Genetics Tab */}
        {activeTab === "genetica" && (
          <div>
            <div className="bg-[#0D3461] rounded-2xl p-6 mb-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F5A623]" />
                Predicción Genética
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Selecciona las variedades de la pareja para predecir características de las crías
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Madre</label>
                  <select
                    value={madre}
                    onChange={(e) => setMadre(e.target.value)}
                    className="w-full bg-[#0A2540] border border-gray-600 rounded-lg p-3 text-white mt-1"
                  >
                    <option value="">Seleccionar variedad</option>
                    {variedadGenetica.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Padre</label>
                  <select
                    value={padre}
                    onChange={(e) => setPadre(e.target.value)}
                    className="w-full bg-[#0A2540] border border-gray-600 rounded-lg p-3 text-white mt-1"
                  >
                    <option value="">Seleccionar variedad</option>
                    {variedadGenetica.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={predecirCria}
                  disabled={!madre || !padre}
                  className="w-full bg-[#F5A623] hover:bg-[#E09000] text-[#0A2540] font-semibold"
                >
                  Predecir Crías
                </Button>
              </div>

              {resultadoGenetico && (
                <div className="mt-4 bg-[#0A2540] rounded-lg p-4">
                  <p className="text-white font-medium">{resultadoGenetico}</p>
                </div>
              )}
            </div>

            <div className="bg-[#0D3461] rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Consejos de Selección</h3>
              <div className="space-y-3 text-gray-400 text-sm">
                <p>• Evita aparear peces emparentados para mantener diversidad genética</p>
                <p>• Las mejores parejas tienen entre 12-18 meses de edad</p>
                <p>• Selecciona ejemplares con colores vibrantes y formas symmetricas</p>
                <p>• Los padres sanos producen crías más robustas</p>
              </div>
            </div>
          </div>
        )}

        {/* Parameters Tab */}
        {activeTab === "parametros" && (
          <div className="space-y-4">
            <div className="bg-[#0D3461] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Droplets className="w-8 h-8 text-[#00C9A7]" />
                <div>
                  <h3 className="text-white font-bold">Parámetros del Agua</h3>
                  <p className="text-gray-400 text-xs">Ideales para reproducción</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">pH</span>
                  <span className="text-white font-medium">6.0 - 6.5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Dureza (GH)</span>
                  <span className="text-white font-medium">1-4 °dGH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Temperatura</span>
                  <span className="text-white font-medium">28 - 30 °C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Nitritos</span>
                  <span className="text-green-400 font-medium">0 ppm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amoníaco</span>
                  <span className="text-green-400 font-medium">0 ppm</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0D3461] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Thermometer className="w-8 h-8 text-[#F5A623]" />
                <div>
                  <h3 className="text-white font-bold">Preparación del Acuario</h3>
                  <p className="text-gray-400 text-xs">Configuración recomendada</p>
                </div>
              </div>
              <div className="space-y-3 text-gray-300 text-sm">
                <p>• Acuario mínimo de 200 litros</p>
                <p>• Sustrato oscuro para resaltar colores</p>
                <p>• Filtración suave (sin corriente fuerte)</p>
                <p>• Plantas naturales para escondites</p>
                <p>• Cambio de agua semanal 20-30%</p>
              </div>
            </div>
          </div>
        )}

        {/* Cycle Tab */}
        {activeTab === "ciclo" && (
          <div className="space-y-4">
            <div className="bg-[#0D3461] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-[#F5A623]" />
                <h3 className="text-white font-bold">Ciclo Reproductivo</h3>
              </div>
              <div className="space-y-4">
                {[
                  { fase: "Cortejo", dias: "1-3", descripcion: "La pareja limpia la superficie de puesta" },
                  { fase: "Puesta", dias: "1 día", descripcion: "La hembra deposita los huevos (200-400)" },
                  { fase: "Incubación", dias: "2-3 días", descripcion: "Los huevos eclosionan en 48-72 horas" },
                  { fase: "Alevines", dias: "5-7 días", descripcion: "Los alevines nadan libremente" },
                  { fase: "Crecimiento", dias: "4-6 semanas", descripcion: "Alimentación con artemia y hojuelas" },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#F5A623]/20 flex items-center justify-center text-[#F5A623] font-bold text-sm">
                        {idx + 1}
                      </div>
                      {idx < 4 && <div className="w-0.5 h-12 bg-[#F5A623]/30"></div>}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-white font-medium">{item.fase}</h4>
                        <span className="text-[#F5A623] text-xs">{item.dias}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{item.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0D3461] border-t border-gray-700 px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                isActive ? "text-[#00C9A7]" : "text-gray-400 hover:text-white"
              }`}>
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
