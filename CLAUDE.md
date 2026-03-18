# DiscoAI - Discus Disease Detector

DiscoAI es una aplicación móvil freemium para acuariofilia profesional especializada en peces Disco (Symphysodon). Utiliza IA para identificar variedades y diagnosticar enfermedades.

**Core Principle:** App vertical 9:16 optimizada para móvil. Interfaz limpia sin secciones de relleno.

---

## 1. Tech Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| Runtime | Node.js | 18+ | - |
| Package Manager | pnpm | Latest | - |
| Framework | Next.js | 15 | App Router |
| Language | TypeScript | 5+ | Strict mode |
| Styling | TailwindCSS | 4 | CSS variables |
| UI Library | shadcn/ui | Latest | Pre-installed |
| Icons | Lucide React | Latest | - |
| Database | Supabase | Latest | PostgreSQL + Auth |
| File Upload | @zoerai/integration | 0.0.8 | Pre-signed URL uploads |

---

## 2. Directory Structure

```
src/
├── app/
│   ├── page.tsx              # Redirect a splash
│   ├── splash/page.tsx       # Pantalla de carga
│   ├── onboarding/page.tsx    # Onboarding 3 slides
│   ├── auth/page.tsx         # Login/Registro
│   ├── home/
│   │   ├── page.tsx          # Dashboard principal
│   │   ├── identificar/page.tsx   # Identificador variedades (gratuito)
│   │   ├── enfermedad/page.tsx    # Diagnóstico enfermedades (freemium)
│   │   ├── salud/page.tsx     # Base de datos enfermedades
│   │   ├── perfil/page.tsx    # Perfil usuario
│   │   ├── premium/page.tsx   # Paywall/Suscripción
│   │   └── reproduccion/page.tsx  # Módulo reproducción (premium)
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── Providers.tsx          # AuthProvider wrapper
│   └── ThemeProvider.tsx      # Theme context
├── hooks/
│   ├── useAuth.tsx            # Autenticación (useAuth hook)
│   ├── use-mobile.tsx         # Mobile detection
│   └── use-toast.tsx          # Toast notifications
└── integrations/
    └── supabase/
        ├── client.ts           # Client-side (RLS)
        └── server.ts           # Server-side (admin)

```

---

## 3. Core Systems

### 3.1 Authentication
- **Provider:** Supabase Auth (email/password + Google OAuth)
- **Status:** Implemented
- **Location:** `src/hooks/useAuth.tsx`
- **Hooks:** `useAuth()` - proporciona user, session, signIn, signUp, signOut, signInWithGoogle

### 3.2 Upload de Imágenes
- **Provider:** @zoerai/integration
- **Función:** `upload.uploadWithPresignedUrl(file, options)`
- **Límite:** 5MB máximo
- **Formatos:** JPG, PNG

### 3.3 Base de Datos
- **Tablas:**
  - `profiles` - id, email, plan (free/premium), creditos_salud, stripe_customer_id
  - `subscriptions` - user_id, tipo (mensual/anual), estado, fecha_inicio, fecha_fin
  - `scan_history` - user_id, tipo_scan (variedad/enfermedad), imagen_url, resultado_json
  - `diseases_db` - nombre, categoria, sintomas_json, tratamiento, medicamentos, severidad

### 3.4 Freemium Model
- **Créditos gratuitos:** 3 análisis de salud
- **Plan premium:** Análisis ilimitados + Módulo reproducción
- **Planes:** Mensual ($4.99) / Anual ($39.99)

---

## 4. Páginas Implementadas

### Flujo de Usuario
1. **Splash** → Animación de carga (3 seg)
2. **Onboarding** → 3 slides informativos
3. **Auth** → Login/Registro (email + Google)
4. **Home** → Dashboard con créditos y acciones rápidas
5. **Identificar** → Scanner de variedades (ilimitado)
6. **Enfermedad** → Diagnóstico IA (3 créditos gratuitos)
7. **Salud** → Base de datos enfermedades
8. **Perfil** → Historial, estadísticas, configuración
9. **Premium** → Paywall y suscripción
10. **Reproducción** → Genética, parámetros, ciclo (solo premium)

### Diseño UI
- **Colores:** Primary #0A2540, Accent #00C9A7, Premium #F5A623
- **Formato:** 9:16 vertical
- **Navegación:** Bottom tabs (Inicio, Identificar, Salud, Perfil)

---

## 5. Current State

### Implemented Features
- [x] Splash Screen con animación
- [x] Onboarding de 3 slides
- [x] Autenticación (email + Google)
- [x] Dashboard principal con créditos
- [x] Identificador de variedades (ilimitado)
- [x] Diagnóstico de enfermedades (freemium 3 créditos)
- [x] Base de datos de enfermedades
- [x] Perfil con historial
- [x] Paywall y suscripción
- [x] Módulo de reproducción (premium)
- [x] Upload de imágenes
- [x] Base de datos con 10 enfermedades de ejemplo

### Pending Features
- [ ] Integración real de Stripe (simulada)
- [ ] Modelo de IA real para identificación
- [ ] Notificaciones push

---

## 6. Maintenance Log

- 2026-03-17: Proyecto inicial DiscoAI creado
- 2026-03-17: Base de datos configurada con tablas y datos de ejemplo
- 2026-03-17: Autenticación implementada con useAuth
- 2026-03-17: Todas las páginas principales implementadas
- 2026-03-17: Verificación de build completada
