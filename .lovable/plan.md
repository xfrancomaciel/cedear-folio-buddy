## Objetivo

Dejar la app accesible sin login mientras dura el problema de cuota de Supabase, sin tocar el plan ni la configuración de Supabase.

## Cambios

1. **`src/components/ProtectedRoute.tsx`**
   - Convertirlo en un passthrough: renderiza siempre `children`, sin chequear `user` ni redirigir a `/auth`.
   - Mantener el archivo (no borrarlo) para no romper imports y poder revertirlo fácil cuando vuelva la cuota.

2. **`src/App.tsx`** (opcional, recomendado)
   - Dejar la ruta `/auth` tal cual (por si querés volver a usarla), pero ya nadie te empuja ahí.

3. **`src/contexts/AuthContext.tsx`** — sin cambios estructurales
   - Sigue intentando `getSession()`, pero al fallar simplemente deja `user = null` y `loading = false`. Las páginas seguirán cargando porque `ProtectedRoute` ya no bloquea.
   - Las funcionalidades que dependen de `user.id` (portfolio personal, favoritos, admin, guardar reportes) **no van a funcionar** mientras no haya sesión: solo van a verse las pantallas y los datos públicos / de APIs externas (TradingView, optimizador, etc.).

## Qué seguirá funcionando sin login
- Navegación completa por el sidebar
- Optimizador de Portfolio (usa edge function pública)
- Widgets de TradingView, mapa, screener, gráficos
- CEDEARs y precios (lectura pública)

## Qué NO va a funcionar sin login
- Guardar/cargar portfolio propio
- Favoritos de CEDEARs por usuario
- Panel de admin
- Subida de avatar / edición de perfil
- Reportes personales

## Cómo revertir
Cuando se restablezca la cuota de Supabase, restaurar `ProtectedRoute.tsx` a la versión original (chequeo de `user` + redirect a `/auth`).

¿Procedo?
