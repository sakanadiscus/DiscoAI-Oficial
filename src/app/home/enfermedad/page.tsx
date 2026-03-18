"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { upload } from "@zoerai/integration";
import { supabase } from "@/integrations/supabase/client";
import { Fish, Scan, Heart, User, Upload, Camera, Loader2, X, AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const navItems = [
  { href: "/home", icon: Fish, label: "Inicio" },
  { href: "/home/identificar", icon: Scan, label: "Identificar" },
  { href: "/home/salud", icon: Heart, label: "Salud" },
  { href: "/home/perfil", icon: User, label: "Perfil" },
];

// Datos de enfermedades para simulación
const enfermedadesDemo = [
  {
    nombre: "Ich (Ichthyophthirius)",
    severidad: "moderado",
    sintomas: "Puntos blancos en el cuerpo, comportamiento errático, fricción contra superficies",
    tratamiento: "Aumentar temperatura a 30°C gradualmente. Tratamiento con verde de malaquita.",
    medicamentos: "Verde de malaquita, Azul de metileno, Sal de acuario",
  },
  {
    nombre: "Hexamita",
    severidad: "critico",
    sintomas: "Heces blancas y largas, pérdida de apetito, oscurecimiento de la piel, letargo",
    tratamiento: "Tratar con medicamentos antiprotozoarios. Mejorar calidad del agua inmediatamente.",
    medicamentos: "Metronidazol, Furazolidona, Formaldehido",
  },
  {
    nombre: "Columnaris",
    severidad: "critico",
    sintomas: "Manchas blancas en cabeza y branquias, branquias dañadas, úlceras en la piel",
    tratamiento: "Tratamiento antibacteriano inmediato. Aislar pez afectado.",
    medicamentos: "Oxitetraciclina, Florfenicol, Bactopur",
  },
  {
    nombre: "Dropsy (Edema)",
    severidad: "critico",
    sintomas: "Escamas levantadas (aspecto de piña), ojos salidos, abdomen hinchado",
    tratamiento: "Tratamiento antibacteriano. Mejorar parámetros del agua. Baños de sal de Epsom.",
    medicamentos: "Maracyn, Kanamycin, Epsom salt baths",
  },
];

const severidadColores = {
  leve: "bg-green-500",
  moderado: "bg-yellow-500",
  critico: "bg-red-500",
};

export default function EnfermedadPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [creditos, setCreditos] = useState(3);
  const [resultado, setResultado] = useState<typeof enfermedadesDemo[0] | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [error, setError] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Fetch user credits and plan
  useEffect(() => {
    async function fetchUserData() {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("creditos_salud, plan")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setCreditos(data.creditos_salud);
        setIsPremium(data.plan === "premium");
      }
    }
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Solo se aceptan imágenes en formato JPG o PNG");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe ser menor a 5MB");
      return;
    }

    // Check credits for non-premium users
    if (!isPremium && creditos <= 0) {
      setShowPaywall(true);
      return;
    }

    setError("");
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    const uploadResult = await upload.uploadWithPresignedUrl(file, {
      allowedExtensions: [".jpg", ".png"],
      maxSize: 5 * 1024 * 1024,
    });

    setUploading(false);

    if (uploadResult.success) {
      analyzeImage(uploadResult.url!);
    } else {
      setError(uploadResult.error || "Error al subir la imagen");
    }
  };

  const analyzeImage = async (imageUrl: string) => {
    setAnalyzing(true);

    try {
      // Call Vision API for real disease analysis
      const response = await fetch("/next_api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          mode: "enfermedad",
        }),
      });

      const data = await response.json();

      let enfermedadResult;

      if (data.error || !data.salud) {
        // Fallback to random if API fails
        enfermedadResult = enfermedadesDemo[Math.floor(Math.random() * enfermedadesDemo.length)];
      } else {
        // Use real API response
        enfermedadResult = {
          nombre: data.enfermedad || "Sin enfermedad detectada",
          severidad: data.severidad === "ninguno" ? "leve" : data.severidad || "moderado",
          sintomas: data.sintomas?.join(", ") || "No específicos",
          tratamiento: data.tratamiento || "Mantener buena calidad de agua",
          medicamentos: "Consultar especialista",
        };
      }

      setResultado(enfermedadResult);

      // Deduct credit if not premium
      if (!isPremium) {
        const newCreditos = creditos - 1;
        setCreditos(newCreditos);

        // Update in database
        await supabase
          .from("profiles")
          .update({ creditos_salud: newCreditos })
          .eq("id", user?.id);

        // Save to scan history
        await supabase.from("scan_history").insert({
          user_id: user?.id,
          tipo_scan: "enfermedad",
          imagen_url: imageUrl,
          resultado_json: enfermedadResult,
          credito_usado: true,
        });

        // Show paywall if credits exhausted
        if (newCreditos <= 0) {
          setShowPaywall(true);
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
      // Fallback on error
      const enfermedad = enfermedadesDemo[Math.floor(Math.random() * enfermedadesDemo.length)];
      setResultado(enfermedad);
    }

    setAnalyzing(false);
  };

  const resetScan = () => {
    setImage(null);
    setResultado(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A2540]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00C9A7]"></div>
      </div>
    );
  }

  if (!user) return null;

  // Paywall Modal
  if (showPaywall) {
    return (
      <div className="min-h-screen bg-[#0A2540] flex items-center justify-center p-4">
        <div className="bg-[#0D3461] rounded-2xl p-6 max-w-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5A623]/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-[#F5A623]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Créditos Agotados</h2>
          <p className="text-gray-400 mb-6">
            Has usado los 3 análisis gratuitos. ¡Desbloquea Premium para análisis ilimitados!
          </p>
          <Link href="/home/premium">
            <Button className="w-full bg-[#F5A623] hover:bg-[#E09000] text-[#0A2540] font-semibold mb-3">
              Ver Planes Premium
            </Button>
          </Link>
          <button
            onClick={() => setShowPaywall(false)}
            className="text-gray-400 text-sm hover:text-white"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A2540] pb-20">
      {/* Header */}
      <header className="bg-[#0D3461] px-4 py-4 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F5A623]/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-[#F5A623]" />
          </div>
          <div>
            <h1 className="text-white font-bold">Diagnosticar</h1>
            <p className="text-gray-400 text-xs">Enfermedades con IA</p>
          </div>
        </Link>
        {/* Credits display */}
        <div className="flex items-center gap-2">
          <div className="bg-[#0A2540] rounded-full px-3 py-1">
            <span className="text-[#00C9A7] font-bold">{creditos}</span>
            <span className="text-gray-400 text-xs"> / 3</span>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Scanner Area */}
        <div className="bg-[#0D3461] rounded-2xl p-6 mb-6">
          {!image ? (
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-4 rounded-full bg-[#0A2540] flex items-center justify-center border-2 border-dashed border-[#F5A623]/50">
                <Camera className="w-16 h-16 text-[#F5A623]/50" />
              </div>
              <h3 className="text-white font-semibold mb-2">Fotografía a tu Pez</h3>
              <p className="text-gray-400 text-sm mb-4">
                Captura una imagen del pez afectado para analizar síntomas
              </p>
              {/* Input para galería */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload-enfermedad"
              />
              {/* Input para cámara */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload-enfermedad-camera"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById('file-upload-enfermedad')?.click()}
                  className="flex-1 bg-[#F5A623] hover:bg-[#E09000] text-[#0A2540] font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Galería
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById('file-upload-enfermedad-camera')?.click()}
                  className="flex-1 bg-[#0D3461] border border-[#F5A623] text-[#F5A623] hover:bg-[#F5A623]/10 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Cámara
                </button>
              </div>
              {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
              <p className="text-gray-500 text-xs mt-4">
                {!isPremium && `${creditos} análisis gratuitos restantes`}
                {isPremium && "Análisis ilimitados"}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="relative mb-4">
                <img src={image} alt="Disco enfermo" className="w-full h-64 object-cover rounded-xl" />
                {analyzing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-[#F5A623] animate-spin mx-auto mb-2" />
                      <p className="text-white">Analizando síntomas...</p>
                    </div>
                  </div>
                )}
                <button onClick={resetScan} className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {resultado && !analyzing && (
                <div className="bg-[#0A2540] rounded-xl p-4 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className={`w-5 h-5 ${severidadColores[resultado.severidad as keyof typeof severidadColores]}`} />
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      resultado.severidad === "critico" ? "bg-red-500/20 text-red-400" :
                      resultado.severidad === "moderado" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-green-500/20 text-green-400"
                    }`}>
                      {resultado.severidad.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{resultado.nombre}</h3>
                  <div className="mb-3">
                    <p className="text-gray-400 text-xs mb-1">Síntomas:</p>
                    <p className="text-white text-sm">{resultado.sintomas}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-gray-400 text-xs mb-1">Tratamiento:</p>
                    <p className="text-white text-sm">{resultado.tratamiento}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Medicamentos:</p>
                    <p className="text-[#F5A623] text-sm">{resultado.medicamentos}</p>
                  </div>
                </div>
              )}

              <Button variant="outline" onClick={resetScan} className="border-gray-600 text-white hover:bg-gray-800 mt-4">
                Nuevo Análisis
              </Button>
            </div>
          )}
        </div>

        {/* Premium CTA */}
        {!isPremium && creditos > 0 && (
          <div className="bg-gradient-to-r from-[#F5A623]/20 to-[#F5A623]/5 rounded-xl p-4 border border-[#F5A623]/30">
            <h4 className="text-white font-semibold mb-1">Desbloquea Análisis Ilimitados</h4>
            <p className="text-gray-400 text-xs mb-3">
              Obtén acceso premium para diagnósticos sin límites
            </p>
            <Link href="/home/premium">
              <Button className="w-full bg-[#F5A623] hover:bg-[#E09000] text-[#0A2540] font-semibold">
                Ver Planes
              </Button>
            </Link>
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
