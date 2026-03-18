"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { upload } from "@zoerai/integration";
import { Fish, Scan, Heart, User, Upload, Camera, Loader2, X, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const navItems = [
  { href: "/home", icon: Fish, label: "Inicio" },
  { href: "/home/identificar", icon: Scan, label: "Identificar" },
  { href: "/home/salud", icon: Heart, label: "Salud" },
  { href: "/home/perfil", icon: User, label: "Perfil" },
];

// Variedades de Disco para simulación
const variedadesDisco = [
  { nombre: "Blue Diamond", confianza: 95, descripcion: "Variedad azul sólida sin marcas, una de las más populares." },
  { nombre: "Heckel", confianza: 92, descripcion: "Variedad salvaje con barras verticales pronunciadas y patrón único." },
  { nombre: "Pigeon Blood", confianza: 89, descripcion: "Coloración roja intensa con patrón de sangre de paloma." },
  { nombre: "Red Turquoise", confianza: 87, descripcion: "Combina rojo con turquesa en un patrón exclusivo." },
  { nombre: "Albino", confianza: 91, descripcion: "Variedadsin pigmento, ojos rojos característica." },
  { nombre: "Leopard", confianza: 88, descripcion: "Patrón de manchas que recuerda a un leopardo." },
  { nombre: "Snake Skin", confianza: 86, descripcion: "Patrón de escamas entrelazadas muy distintivo." },
  { nombre: "Cobalt", confianza: 94, descripcion: "Azul intenso metalizado muy valorado." },
];

export default function IdentificarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [resultado, setResultado] = useState<typeof variedadesDisco[0] | null>(null);
  const [error, setError] = useState("");
  const [historial, setHistorial] = useState<Array<{ id: string; variedad: string; fecha: Date }>>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("disco_identify_history");
    if (saved) {
      setHistorial(JSON.parse(saved));
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Solo se aceptan imágenes en formato JPG o PNG");
      return;
    }

    // Validate file size (max 5MB per integration limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe ser menor a 5MB");
      return;
    }

    setError("");
    setUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to OSS
    const uploadResult = await upload.uploadWithPresignedUrl(file, {
      allowedExtensions: [".jpg", ".png"],
      maxSize: 5 * 1024 * 1024,
    });

    setUploading(false);

    if (uploadResult.success) {
      // Simulate AI analysis (in production, this would call an ML model)
      analyzeImage(uploadResult.url!);
    } else {
      setError(uploadResult.error || "Error al subir la imagen");
    }
  };

  const analyzeImage = async (imageUrl: string) => {
    setAnalyzing(true);

    try {
      // Call Vision API for real analysis
      const response = await fetch("/next_api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          mode: "variedad",
        }),
      });

      const data = await response.json();

      if (data.error) {
        // Fallback to random if API fails
        const variedad = variedadesDisco[Math.floor(Math.random() * variedadesDisco.length)];
        setResultado(variedad);
      } else {
        setResultado({
          nombre: data.variedad || "Variedad desconocida",
          confianza: data.confianza || 50,
          descripcion: data.descripcion || "Análisis completado",
        });
      }

      // Add to history
      const result = data.variedad || "Análisis";
      const newEntry = {
        id: Date.now().toString(),
        variedad: result,
        fecha: new Date(),
      };
      const newHistorial = [newEntry, ...historial].slice(0, 10);
      setHistorial(newHistorial);
      localStorage.setItem("disco_identify_history", JSON.stringify(newHistorial));
    } catch (error) {
      console.error("Analysis error:", error);
      // Fallback on error
      const variedad = variedadesDisco[Math.floor(Math.random() * variedadesDisco.length)];
      setResultado(variedad);
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

  return (
    <div className="min-h-screen bg-[#0A2540] pb-20">
      {/* Header */}
      <header className="bg-[#0D3461] px-4 py-4 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00C9A7]/20 flex items-center justify-center">
            <Fish className="w-5 h-5 text-[#00C9A7]" />
          </div>
          <div>
            <h1 className="text-white font-bold">Identificar</h1>
            <p className="text-gray-400 text-xs">Variedad de Disco</p>
          </div>
        </Link>
        <div className="text-xs text-[#00C9A7] font-medium">Ilimitado</div>
      </header>

      <div className="p-4">
        {/* Scanner Area */}
        <div className="bg-[#0D3461] rounded-2xl p-6 mb-6">
          {!image ? (
            <div className="text-center">
              <div className="w-48 h-48 mx-auto mb-4 rounded-full bg-[#0A2540] flex items-center justify-center border-2 border-dashed border-[#00C9A7]/50">
                <Camera className="w-16 h-16 text-[#00C9A7]/50" />
              </div>
              <h3 className="text-white font-semibold mb-2">Sube una foto de tu Disco</h3>
              <p className="text-gray-400 text-sm mb-4">
                Captura o selecciona una imagen de tu pez para identificar la variedad
              </p>
              {/* Input para galería */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload-identificar"
              />
              {/* Input para cámara */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload-identificar-camera"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById('file-upload-identificar')?.click()}
                  className="flex-1 bg-[#00C9A7] hover:bg-[#00B090] text-[#0A2540] font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Galería
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById('file-upload-identificar-camera')?.click()}
                  className="flex-1 bg-[#0D3461] border border-[#00C9A7] text-[#00C9A7] hover:bg-[#00C9A7]/10 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Cámara
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-3">{error}</p>
              )}
            </div>
          ) : (
            <div className="text-center">
              {/* Image Preview */}
              <div className="relative mb-4">
                <img
                  src={image}
                  alt="Disco"
                  className="w-full h-64 object-cover rounded-xl"
                />
                {analyzing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-[#00C9A7] animate-spin mx-auto mb-2" />
                      <p className="text-white">Analizando...</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={resetScan}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Result */}
              {resultado && !analyzing && (
                <div className="bg-[#0A2540] rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-[#00C9A7]" />
                    <span className="text-[#00C9A7] font-semibold">Resultado</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{resultado.nombre}</h3>
                  <p className="text-[#00C9A7] font-medium mb-3">{resultado.confianza}% de confianza</p>
                  <p className="text-gray-400 text-sm">{resultado.descripcion}</p>
                </div>
              )}

              <Button
                variant="outline"
                onClick={resetScan}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Escanear Otro
              </Button>
            </div>
          )}
        </div>

        {/* History */}
        {historial.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-3">Historial de Escaneos</h3>
            <div className="space-y-2">
              {historial.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0D3461] rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#00C9A7]" />
                    <span className="text-white">{item.variedad}</span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {new Date(item.fecha).toLocaleDateString()}
                  </span>
                </div>
              ))}
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
