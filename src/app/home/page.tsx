"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Fish, Scan, Heart, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/home", icon: Fish, label: "Inicio" },
  { href: "/home/identificar", icon: Scan, label: "Identificar" },
  { href: "/home/salud", icon: Heart, label: "Salud" },
  { href: "/home/perfil", icon: User, label: "Perfil" },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [credits, setCredits] = useState(3);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Fetch user credits
  useEffect(() => {
    async function fetchCredits() {
      const { data } = await supabase
        .from("profiles")
        .select("creditos_salud, plan")
        .eq("id", user?.id)
        .maybeSingle();
      if (data) {
        setCredits(data.creditos_salud);
      }
    }
    if (user) {
      fetchCredits();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A2540]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00C9A7]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A2540] pb-20">
      {/* Header */}
      <header className="bg-[#0D3461] px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00C9A7]/20 flex items-center justify-center">
            <Fish className="w-5 h-5 text-[#00C9A7]" />
          </div>
          <div>
            <h1 className="text-white font-bold">DiscoAI</h1>
            <p className="text-gray-400 text-xs">Detector IA</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      {/* Welcome section */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-[#0D3461] to-[#00C9A7]/20 rounded-2xl p-6">
          <h2 className="text-white text-xl font-bold mb-2">
            Bienvenido 👋
          </h2>
          <p className="text-gray-300 text-sm mb-4">
            Identifica variedades y diagnostica enfermedades de tus peces Disco
          </p>

          {/* Credits display */}
          <div className="bg-[#0A2540]/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Créditos de Salud</span>
              <span className="text-[#00C9A7] font-bold">{credits} / 3</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00C9A7] transition-all"
                style={{ width: `${(credits / 3) * 100}%` }}
              />
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Usa tus créditos para análisis de enfermedades
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <h3 className="text-white font-semibold mb-3">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/home/identificar">
            <div className="bg-[#0D3461] rounded-xl p-4 hover:bg-[#0D3461]/80 transition-colors cursor-pointer">
              <Scan className="w-8 h-8 text-[#00C9A7] mb-2" />
              <p className="text-white font-medium">Identificar</p>
              <p className="text-gray-400 text-xs">Variedad de Disco</p>
            </div>
          </Link>
          <Link href="/home/enfermedad">
            <div className="bg-[#0D3461] rounded-xl p-4 hover:bg-[#0D3461]/80 transition-colors cursor-pointer">
              <Heart className="w-8 h-8 text-[#F5A623] mb-2" />
              <p className="text-white font-medium">Diagnosticar</p>
              <p className="text-gray-400 text-xs">Enfermedad IA</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Premium CTA */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-[#F5A623]/20 to-[#F5A623]/5 rounded-xl p-4 border border-[#F5A623]/30">
          <h4 className="text-white font-semibold mb-1">Desbloquea Premium</h4>
          <p className="text-gray-400 text-xs mb-3">
            Análisis ilimitados + Módulo de Reproducción
          </p>
          <Link href="/home/premium">
            <Button className="w-full bg-[#F5A623] hover:bg-[#E09000] text-[#0A2540] font-semibold">
              Ver Planes
            </Button>
          </Link>
        </div>
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

// Import supabase client for fetch
import { supabase } from "@/integrations/supabase/client";
