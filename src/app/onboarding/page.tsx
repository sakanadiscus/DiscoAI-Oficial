"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Fish, Scan, Heart, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    icon: Fish,
    title: "Identifica tu Disco",
    description: "Usa nuestra tecnología de visión computacional para identificar más de 20 variedades de peces Disco: Blue Diamond, Heckel, Pigeon Blood, y más.",
  },
  {
    icon: Scan,
    title: "Diagnostica Enfermedades",
    description: "Nuestro sistema de IA analiza los síntomas de tu pez para detectar enfermedades comunes como Ich, Hexamita, Columnaris y otras patologías.",
  },
  {
    icon: Heart,
    title: "Cría y Genética Avanzada",
    description: "Accede a nuestro módulo premium de reproducción con asesoría genética, parámetros ideales y seguimiento completo de tus alevines.",
  },
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push("/auth");
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToAuth = () => {
    router.push("/auth");
  };

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0A2540] to-[#0D3461]">
      {/* Skip button */}
      <div className="flex justify-end p-6">
        <button
          onClick={goToAuth}
          className="text-gray-400 text-sm hover:text-white transition-colors"
        >
          Omitir
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 rounded-full bg-[#00C9A7]/20 flex items-center justify-center">
              <CurrentIcon className="w-16 h-16 text-[#00C9A7]" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-4">
            {slides[currentSlide].title}
          </h1>
          <p className="text-gray-400 text-center text-lg leading-relaxed">
            {slides[currentSlide].description}
          </p>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 py-8">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? "bg-[#00C9A7] w-8"
                : "bg-gray-600"
            }`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center px-6 pb-12">
        <Button
          variant="ghost"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="text-gray-400 hover:text-white disabled:opacity-0"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <Button
          onClick={nextSlide}
          className="bg-[#00C9A7] hover:bg-[#00B090] text-[#0A2540] font-semibold px-8"
        >
          {currentSlide === slides.length - 1 ? "Comenzar" : "Siguiente"}
        </Button>

        <Button
          variant="ghost"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="text-gray-400 hover:text-white disabled:opacity-0"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
