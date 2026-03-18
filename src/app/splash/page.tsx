"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Fish } from "lucide-react";

export default function SplashScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animated progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          router.push("/onboarding");
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0A2540] to-[#0D3461]">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#00C9A7]/20 mb-6 animate-pulse">
          <Fish className="w-12 h-12 text-[#00C9A7]" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">DiscoAI</h1>
        <p className="text-gray-400 mb-8">Detector de Enfermedades IA</p>

        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00C9A7] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-gray-500 text-sm mt-4">Cargando...</p>
      </div>
    </div>
  );
}
