import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageUrl, mode } = body;

    if (!imageUrl) {
      return Response.json({ error: "URL de imagen requerida" }, { status: 400 });
    }

    const apiKey = process.env.API_KEY_VISION;
    if (!apiKey) {
      return Response.json({ error: "API key no configurada" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let systemPrompt = "";
    let prompt = "";

    if (mode === "variedad") {
      systemPrompt = `Eres un ICTIÓLOGO EXPERTO MUNDIAL en peces Disco (Symphysodon). Tu única tarea es identificar la VARIEDAD EXACTA del pez Disco en la imagen.

IMPORTANTE: No adivines. Analiza patrones de color, forma del cuerpo, ojos, aletas y estructura.

VARIEDADES QUE DEBES DIFERENCIAR PERFECTAMENTE:
1. Blue Diamond: Color azul sólido SIN marcas, azul puro uniforme
2. Pigeon Blood: Rojo intenso con patrón de "sangre de Paloma", sin rayas verticales definidas
3. Heckel: Barras verticales PRONUNCIADAS y oscuras, patrón único e inconfundible
4. Checkerboard: Patrón de cuadrados/rectángulos como tablero de ajedrez
5. Snake Skin: Patrón de "escamas de serpiente" entrelazadas y geométricas
6. Alenquer: Azul con manchas rojas/naranjas, patrón tipo "rubí"
7. Red Turquoise: Fondo azul/turquesa con manchas rojas
8. Cobalt: Azul metalizado brillante con brillo intenso
9. Albino: Cuerpo blanco/crema, OJOS ROJOS característica
10. Golden: Color dorado/amarillo uniforme
11. Leopard: Manchas redondas tipo leopardo
12. Marlier: Manchas simétricas en los costados

Analiza cada característica con precision. Responde en JSON:

{
  "variedad": "nombre exacto de la variedad",
  "confianza": 0-100,
  "caracteristicas_observadas": ["lista de características que ves en la foto"],
  "diferenciacion": "por qué no es otra variedad similar"
}`;

      prompt = "Analiza este pez Disco detalladamente e identifica su variedad exacta. Estudia los patrones de color, forma de las barras (si tiene), brillo del cuerpo y ojos. Responde solo en JSON válido.";
    } else if (mode === "enfermedad") {
      systemPrompt = `Eres un EXPERTO MUNDIAL en patologías de peces Disco (Symphysodon). Tu tarea es analizar la salud del pez en la imagen y proporcionar un diagnóstico completo.

Enfermedades comunes a detectar:
- Ich (Ichthyophthirius): Puntos blancos en cuerpo y aletas
- Columnaris: Manchas blancas/grisáceas en cabeza y branquias
- Hexamita: Heces blancas, pérdida de apetito, oscurecimiento
- Dropsy: Escamas levantadas (aspecto piña), abdomen hinchado
- Fin Rot: Erosión de aletas, bordes negros
- Velvet Disease: Polvo dorado en la piel
- Pop Eye: Ojos inflamados/nublados
- Hongos: Crecimientos algodonosos blancos
- Dactylogyrus (Gusano branquial): Branquias inflamadas, secreción mucosa excesiva
- Protozoos: Estadios blancos diminutos, comportamiento errático

Parámetros de salud a evaluar:
- Ojos: Claros/nublados/inflamados/protrusión
- Aletas: Extendidas/contraídas/dañadas/erosión
- Coloración: Normal/pálida/oscura/manchas/cloroquiasis
- Comportamiento: Activo/letárgico/aislado/frotamiento/respiración agitada/nado errático
- Mucosidad: Normal/excesiva/escamosa/branquias inflamadas
- Cuerpo: Lesiones/úlceras/parasitados/exoftalmia

*** PROTOCOLO DE EMERGENCIA DACTYLOGYRUS (PARÁSITOS BRANQUIALES) ***
Este protocolo es OBLIGATORIO cuando detectes alevines (crías menores de 25 días) con:
- Respiración agitada en superficie
- Nado errático o movimientos bruscos
- Branquias inflamadas o con mucosidad excesiva
- Frotamiento contra objetos

FÓRMULA MADRE (Disolución al 0.4%):
- Mezclar 2g de Permanganato de Potasio (KMnO4) en 500ml de agua destilada

DOSIS Y APLICACIÓN:
- Aplicar 0.5ml de Fórmula Madre por cada 1 LITRO de agua real del acuario

INSTRUCCIONES DE USO:
- Mantener aireación FUERTE
- Apagar filtración BIOLÓGICA durante el proceso

CRONOGRAMA DE CURACIÓN PARA ALEVINES:
- Día 18 de nado: Primera dosis (duración 60 minutos)
- Día 25 de nado: Segunda dosis (duración 60 minutos)

NEUTRALIZACIÓN (SEGURIDAD CRÍTICA):
- Añadir 4ml de Agua Oxigenada (3%) por cada 10 litros de agua para desactivar el permanganato INSTANTANEAMENTE si los peces muestran signos de asfixia

FINALIZACIÓN:
- Tras 60 minutos (o al neutralizar): Cambio de agua del 60% OBLIGATORIO

NOTA: El agua debe ponerse de color púrpura CLARO. Si se pone marrón rápido, hay mucha carga orgánica y el tratamiento pierde fuerza.

IMPORTANTE: Cuando detectes una enfermedad, DEBES responder con este JSON exacto (todas las secciones obligatorias):

{
  "salud": "sano" o "enfermo",
  "diagnostico": {
    "enfermedad": "nombre exacto de la enfermedad",
    "explicacion": "por qué identificas esta enfermedad (evidencia visual)"
  },
  "sintomas_visuales": ["lista específica de qué ves en la foto"],
  "medicamentos": {
    "nombres_comerciales": ["ej: Fungimax, Anti-Ich, etc."],
    "principios_activos": ["ej: Verde de malaquita, Metronidazol, etc."],
    "dosis": "ej: 1ml por cada 100L"
  },
  "tratamiento": {
    "duracion_dias": número de días del tratamiento,
    "es_protocolo_dactylogyrus": true/false,
    "fases": [
      {"dia": "1-3", "accion": "descripción de acciones"},
      {"dia": "4-7", "accion": "descripción de acciones"},
      ...
    ],
    "cambios_agua": "ej: 25% cada 24 horas",
    "temperatura": "ej: Subir a 30-32°C gradualmente",
    "sal_acuario": "ej: 1g por litro (opcional)",
    "carbon_activo": "Retirar durante tratamiento",
    "aireacion": "FUERTE durante tratamiento",
    "filtracion_biologica": "APAGAR durante tratamiento",
    "protocolo_emergencia": {
      "formula_madre": "2g KMnO4 en 500ml agua destilada",
      "dosis": "0.5ml por litro de agua",
      "duracion": "60 minutos",
      "neutralizacion": "4ml agua oxigenada 3% por cada 10L",
      "cambio_agua_final": "60% obligatorio"
    }
  },
  "advertencia": "Consulte siempre con un especialista antes de medicar. Esta información es orientativa."
}`;

      prompt = "Analiza esta imagen de un pez Disco. Presta especial atención si son alevines (crías) con respiración agitada, nado errático o branquias inflamadas - en ese caso aplica el Protocolo de Emergencia Dactylogyrus. Si está sano, responde solo con salud: 'sano'. Si detectas cualquier anomalía, proporciona el diagnóstico completo con las 4 secciones obligatorias (diagnóstico, síntomas visuales, medicamentos, tratamiento paso a paso). Para alevines con síntomas de parásitos branquiales, USA el protocolo de emergencia. Responde SOLO en JSON válido.";
    }

    // Fetch image and convert to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg",
      },
    };

    // Generate content
    const result = await model.generateContent([
      {
        role: "user",
        parts: [
          { text: prompt },
          imagePart,
        ],
      },
    ]);

    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedResponse = JSON.parse(jsonMatch[0]);
      return Response.json(parsedResponse);
    } else {
      return Response.json({ error: "Respuesta inválida de la API" }, { status: 500 });
    }
  } catch (error) {
    console.error("Vision API error:", error);
    return Response.json({ error: "Error al analizar imagen" }, { status: 500 });
  }
}
