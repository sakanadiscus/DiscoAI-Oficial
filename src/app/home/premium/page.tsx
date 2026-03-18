"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Fish, Scan, Heart, User, Lock, Check, Crown, Sparkles, ChevronLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/home", icon: Fish, label: "Inicio" },
  { href: "/home/identificar", icon: Scan, label: "Identificar" },
  { href: "/home/salud", icon: Heart, label: "Salud" },
  { href: "/home/perfil", icon: User, label: "Perfil" },
];

const beneficiosFree = [
  "Identificador de variedades ilimitado",
  "Base de datos de enfermedades",
  "3 análisis de salud con IA",
];

const beneficiosPremium = [
  "Identificador de variedades ilimitado",
  "Base de datos de enfermedades",
  "Análisis de salud ILIMITADOS",
  "Módulo de reproducción avanzada",
  "Asesoría genética de parejas",
  "Seguimiento de alevines",
  "Soporte prioritario",
  "Exportar historial en PDF",
];

function PremiumContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Handle successful payment redirect
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setIsPremium(true);
    }
  }, [searchParams]);

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

  const handleSubscribe = async (tipo: "mensual" | "anual") => {
    if (!user) return;

    setProcessing(true);

    try {
      // Call Stripe checkout API
      const response = await fetch("/next_api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: tipo,
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        console.error("Stripe error:", data.error);
        alert("Error al procesar pago. Intenta de nuevo.");
        setProcessing(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Error de conexión. Intenta de nuevo.");
      setProcessing(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setProcessing(true);

    try {
      const response = await fetch("/next_api/stripe/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Portal error:", data.error);
        alert("Error al abrir portal. Intenta de nuevo.");
        setProcessing(false);
      }
    } catch (error) {
      console.error("Portal error:", error);
      setProcessing(false);
    }
  };

  // Legacy function (simulated - kept for fallback)
  const simulateSubscribe = async (tipo: "mensual" | "anual") => {
    setProcessing(true);
    // Simulate subscription process
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update user to premium
    if (user) {
      await supabase
        .from("profiles")
        .update({ plan: "premium", creditos_salud: 999 })
        .eq("id", user.id);

      // Create subscription record
      await supabase.from("subscriptions").insert({
        user_id: user.id,
        tipo,
        estado: "active",
        fecha_inicio: new Date().toISOString(),
        fecha_fin: tipo === "anual"
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    setIsPremium(true);
    setProcessing(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A2540]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00C9A7]"></div>
      </div>
    );
  }

  if (!user) return null;

  // Already premium view
  if (isPremium) {
    return (
      <div className="min-h-screen bg-[#0A2540] pb-20">
        <header className="bg-gradient-to-r from-[#F5A623] to-[#F5A623]/50 px-4 py-6">
          <Link href="/home" className="flex items-center gap-2 text-white mb-4">
            <ChevronLeft className="w-5 h-5" />
            Volver
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">¡Eres Premium!</h1>
              <p className="text-white/80 text-sm">Disfruta de todos los beneficios</p>
            </div>
          </div>
        </header>

        <div className="p-4">
          <div className="bg-[#0D3461] rounded-2xl p-6 mb-6">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F5A623]" />
              Tus Beneficios
            </h2>
            <div className="space-y-3">
              {beneficiosPremium.map((beneficio, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#00C9A7]" />
                  <span className="text-gray-300">{beneficio}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reproduction Module */}
          <Link href="/home/reproduccion">
            <div className="bg-gradient-to-r from-[#0D3461] to-[#0D3461]/50 rounded-2xl p-6 border border-[#F5A623]/30 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-8 h-8 text-[#F5A623]" />
                <h3 className="text-white font-bold text-lg">Módulo de Reproducción</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Accede a asesoría genética, parámetros de agua y seguimiento de crías
              </p>
            </div>
          </Link>

          {/* Manage Subscription Button */}
          <button
            onClick={handleManageSubscription}
            disabled={processing}
            className="w-full bg-[#0D3461] border border-gray-600 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <CreditCard className="w-5 h-5" />
            {processing ? "Cargando..." : "Gestionar Suscripción"}
          </button>
        </div>

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

  // Paywall view
  return (
    <div className="min-h-screen bg-[#0A2540] pb-20">
      <header className="bg-gradient-to-r from-[#F5A623] to-[#F5A623]/50 px-4 py-6">
        <Link href="/home" className="flex items-center gap-2 text-white mb-4">
          <ChevronLeft className="w-5 h-5" />
          Volver
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">DiscoAI Premium Pro</h1>
            <p className="text-white/80 text-sm">Desbloquea todo el potencial</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Benefits comparison */}
        <div className="bg-[#0D3461] rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">Compara Planes</h2>

          <div className="space-y-4 mb-6">
            <div className="border-b border-gray-700 pb-4">
              <h3 className="text-gray-400 text-sm mb-2">Plan Free</h3>
              {beneficiosFree.map((beneficio, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                  <Check className="w-4 h-4 text-[#00C9A7]" />
                  {beneficio}
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-[#F5A623] text-sm mb-2">Plan Premium</h3>
              {beneficiosPremium.map((beneficio, idx) => (
                <div key={idx} className="flex items-center gap-2 text-white text-sm mb-1">
                  <Check className="w-4 h-4 text-[#F5A623]" />
                  {beneficio}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription plans */}
        <h2 className="text-white font-bold text-lg mb-4">Elige tu Plan</h2>

        {/* Monthly */}
        <button
          onClick={() => handleSubscribe("mensual")}
          disabled={processing}
          className="w-full bg-[#0D3461] rounded-2xl p-6 mb-4 border-2 border-[#F5A623]/50 hover:border-[#F5A623] transition-colors text-left disabled:opacity-50"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-white font-bold text-lg">Mensual</h3>
              <p className="text-gray-400 text-sm">Facturado mensualmente</p>
            </div>
            <div className="text-right">
              <p className="text-[#F5A623] font-bold text-2xl">$4.99</p>
              <p className="text-gray-500 text-xs">/mes</p>
            </div>
          </div>
        </button>

        {/* Annual - Recommended */}
        <button
          onClick={() => handleSubscribe("anual")}
          disabled={processing}
          className="w-full bg-gradient-to-r from-[#F5A623]/20 to-[#F5A623]/5 rounded-2xl p-6 mb-6 border-2 border-[#F5A623] hover:border-[#F5A623]/80 transition-colors text-left disabled:opacity-50"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#F5A623] text-[#0A2540] text-xs font-bold px-2 py-1 rounded">
                  AHORRA 33%
                </span>
              </div>
              <h3 className="text-white font-bold text-lg">Anual</h3>
              <p className="text-gray-400 text-sm">Facturado anualmente</p>
            </div>
            <div className="text-right">
              <p className="text-[#F5A623] font-bold text-2xl">$39.99</p>
              <p className="text-gray-500 text-xs">/año</p>
            </div>
          </div>
        </button>

        {processing && (
          <div className="text-center text-gray-400 text-sm">
            Procesando suscripción...
          </div>
        )}

        <p className="text-center text-gray-500 text-xs mt-4">
          Puedes cancelar en cualquier momento. No hay compromisos.
        </p>
      </div>

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

// Wrap with Suspense for useSearchParams
import { Suspense } from "react";

export default function PremiumPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A2540] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00C9A7]"></div></div>}>
      <PremiumContent />
    </Suspense>
  );
}
