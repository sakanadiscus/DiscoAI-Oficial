"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Fish, Scan, Heart, User, Search, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navItems = [
  { href: "/home", icon: Fish, label: "Inicio" },
  { href: "/home/identificar", icon: Scan, label: "Identificar" },
  { href: "/home/salud", icon: Heart, label: "Salud" },
  { href: "/home/perfil", icon: User, label: "Perfil" },
];

interface Disease {
  id: string;
  nombre: string;
  categoria: string;
  sintomas_json: { symptoms: string[] };
  tratamiento: string;
  medicamentos: string;
  severidad: string;
}

const severidadColores = {
  leve: "bg-green-500",
  moderado: "bg-yellow-500",
  critico: "bg-red-500",
};

export default function SaludPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [enfermedades, setEnfermedades] = useState<Disease[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [enfermedadSeleccionada, setEnfermedadSeleccionada] = useState<Disease | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Fetch diseases from database
  useEffect(() => {
    async function fetchEnfermedades() {
      const { data } = await supabase
        .from("diseases_db")
        .select("*")
        .order("nombre");

      if (data) {
        setEnfermedades(data);
      }
      setLoading(false);
    }
    fetchEnfermedades();
  }, []);

  // Filter diseases based on search
  const enfermedadesFiltradas = enfermedades.filter((e) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.sintomas_json.symptoms.some((s) => s.toLowerCase().includes(busqueda.toLowerCase()))
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A2540]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00C9A7]"></div>
      </div>
    );
  }

  if (!user) return null;

  // Disease detail view
  if (enfermedadSeleccionada) {
    return (
      <div className="min-h-screen bg-[#0A2540] pb-20">
        {/* Header */}
        <header className="bg-[#0D3461] px-4 py-4">
          <button
            onClick={() => setEnfermedadSeleccionada(null)}
            className="flex items-center gap-2 text-white mb-4"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Volver
          </button>
          <h1 className="text-xl font-bold text-white">{enfermedadSeleccionada.nombre}</h1>
        </header>

        <div className="p-4">
          <div className="bg-[#0D3461] rounded-2xl p-6">
            {/* Severity badge */}
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className={`w-5 h-5 ${severidadColores[enfermedadSeleccionada.severidad as keyof typeof severidadColores]}`} />
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                enfermedadSeleccionada.severidad === "critico" ? "bg-red-500/20 text-red-400" :
                enfermedadSeleccionada.severidad === "moderado" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-green-500/20 text-green-400"
              }`}>
                {enfermedadSeleccionada.severidad.toUpperCase()}
              </span>
              <span className="text-gray-400 text-xs">{enfermedadSeleccionada.categoria}</span>
            </div>

            {/* Symptoms */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-2">Síntomas</h3>
              <div className="flex flex-wrap gap-2">
                {enfermedadSeleccionada.sintomas_json.symptoms.map((sintoma, idx) => (
                  <span key={idx} className="bg-[#0A2540] text-gray-300 text-xs px-3 py-1 rounded-full">
                    {sintoma}
                  </span>
                ))}
              </div>
            </div>

            {/* Treatment */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-2">Tratamiento</h3>
              <p className="text-gray-300 text-sm">{enfermedadSeleccionada.tratamiento}</p>
            </div>

            {/* Medications */}
            <div>
              <h3 className="text-white font-semibold mb-2">Medicamentos</h3>
              <p className="text-[#00C9A7] text-sm">{enfermedadSeleccionada.medicamentos}</p>
            </div>
          </div>

          {/* Quick action to diagnose */}
          <div className="mt-6 bg-[#0D3461] rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-2">¿Tu pez presenta estos síntomas?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Usa nuestro diagnóstico con IA para un análisis más preciso
            </p>
            <Link href="/home/enfermedad">
              <Button className="w-full bg-[#F5A623] hover:bg-[#E09000] text-[#0A2540] font-semibold">
                Diagnosticar con IA
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

  // Main list view
  return (
    <div className="min-h-screen bg-[#0A2540] pb-20">
      {/* Header */}
      <header className="bg-[#0D3461] px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/home">
            <div className="w-10 h-10 rounded-full bg-[#00C9A7]/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#00C9A7]" />
            </div>
          </Link>
          <div>
            <h1 className="text-white font-bold">Salud</h1>
            <p className="text-gray-400 text-xs">Base de datos de enfermedades</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por síntoma o enfermedad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 bg-[#0A2540] border-gray-600 text-white placeholder:text-gray-500"
          />
        </div>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00C9A7]"></div>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-4">
              {enfermedadesFiltradas.length} enfermedades encontradas
            </p>

            <div className="space-y-3">
              {enfermedadesFiltradas.map((enfermedad) => (
                <button
                  key={enfermedad.id}
                  onClick={() => setEnfermedadSeleccionada(enfermedad)}
                  className="w-full bg-[#0D3461] rounded-xl p-4 text-left hover:bg-[#0D3461]/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{enfermedad.nombre}</h3>
                        <span className={`w-2 h-2 rounded-full ${severidadColores[enfermedad.severidad as keyof typeof severidadColores]}`} />
                      </div>
                      <p className="text-gray-400 text-xs">{enfermedad.categoria}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                </button>
              ))}
            </div>

            {enfermedadesFiltradas.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No se encontraron enfermedades</p>
              </div>
            )}
          </>
        )}
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
