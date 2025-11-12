# Guía de Deployment - Mustrello en GitHub Pages

## 🌐 URL de Producción

**Tu aplicación estará disponible en:** `https://fnunonca.github.io/Mustrello/`

---

## ✅ Configuración Completada

Ya se han realizado todas las configuraciones necesarias:

- ✅ `vite.config.ts` - Base path configurado como `/Mustrello/`
- ✅ `App.tsx` - BrowserRouter con `basename="/Mustrello"`
- ✅ `package.json` - Script de deploy manual agregado
- ✅ `.github/workflows/deploy.yml` - GitHub Actions configurado
- ✅ Dependencia `gh-pages` agregada

---

## 🚀 Métodos de Deployment

Tienes **2 opciones** para publicar tu aplicación:

---

### **Opción 1: Deployment Manual con gh-pages** 📦

Este método te permite deployar manualmente cuando lo desees.

#### Pasos:

1. **Instalar dependencias** (solo la primera vez):
   ```bash
   cd frontend
   npm install
   ```

2. **Ejecutar el comando de deploy**:
   ```bash
   npm run deploy
   ```

3. **¿Qué hace este comando?**
   - Compila la aplicación con `npm run build`
   - Crea una rama `gh-pages` en tu repositorio
   - Sube los archivos compilados a esa rama
   - GitHub Pages los publica automáticamente

4. **Configurar GitHub Pages** (solo la primera vez):
   - Ve a tu repositorio en GitHub: `https://github.com/fnunonca/Mustrello`
   - Click en **Settings** → **Pages**
   - En **Source**, selecciona **Deploy from a branch**
   - En **Branch**, selecciona `gh-pages` y carpeta `/root`
   - Click en **Save**

#### Ventajas:
- ✅ Control total sobre cuándo publicar
- ✅ Simple y rápido
- ✅ No requiere configuración de GitHub

#### Desventajas:
- ❌ Debes recordar ejecutar el comando manualmente
- ❌ Puede olvidarse de deployar cambios

---

### **Opción 2: Deployment Automático con GitHub Actions** 🤖 (Recomendado)

Este método deployará automáticamente cada vez que hagas push a la rama `main`.

#### Pasos:

1. **Configurar GitHub Pages para usar GitHub Actions**:
   - Ve a tu repositorio en GitHub: `https://github.com/fnunonca/Mustrello`
   - Click en **Settings** → **Pages**
   - En **Source**, selecciona **GitHub Actions**
   - Guarda los cambios

2. **Hacer commit y push de tus cambios**:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

3. **Verificar el deployment**:
   - Ve a la pestaña **Actions** en tu repositorio
   - Verás un workflow llamado "Deploy to GitHub Pages" ejecutándose
   - Espera a que termine (toma 2-3 minutos)
   - Tu sitio estará disponible en `https://fnunonca.github.io/Mustrello/`

#### ¿Cómo funciona?

Cada vez que hagas `git push` a la rama `main`:
1. GitHub Actions detecta el push
2. Ejecuta automáticamente:
   - Instala dependencias con `npm ci`
   - Compila la aplicación con `npm run build`
   - Publica los archivos en GitHub Pages
3. Tu sitio se actualiza automáticamente

#### Ventajas:
- ✅ **Totalmente automático** - No necesitas recordar nada
- ✅ **CI/CD profesional** - Flujo de trabajo moderno
- ✅ **Historial de deployments** - Puedes ver cada deployment en la pestaña Actions
- ✅ **Rollback fácil** - Puedes revertir a versiones anteriores

#### Desventajas:
- ❌ Requiere configuración inicial en GitHub
- ❌ Deployará TODOS los push a main (aunque esto suele ser deseable)

---

## 🛠️ Comandos Útiles

### Desarrollo Local
```bash
cd frontend
npm run dev
# Abre http://localhost:5173
```

### Build de Producción (sin deploy)
```bash
cd frontend
npm run build
# Los archivos se generan en frontend/dist/
```

### Preview del Build
```bash
cd frontend
npm run build
npm run preview
# Abre http://localhost:4173 para ver la versión de producción localmente
```

### Deploy Manual
```bash
cd frontend
npm run deploy
```

---

## 📋 Checklist de Primera Publicación

### Si usas Opción 1 (Manual):
- [ ] Ejecutar `cd frontend && npm install`
- [ ] Ejecutar `npm run deploy`
- [ ] Ir a GitHub Settings → Pages
- [ ] Configurar Source como "Deploy from a branch"
- [ ] Seleccionar rama `gh-pages`
- [ ] Esperar 2-3 minutos
- [ ] Visitar `https://fnunonca.github.io/Mustrello/`

### Si usas Opción 2 (GitHub Actions):
- [ ] Ir a GitHub Settings → Pages
- [ ] Configurar Source como "GitHub Actions"
- [ ] Hacer commit de los cambios de configuración
- [ ] Hacer push a la rama `main`
- [ ] Ir a la pestaña Actions y esperar que termine
- [ ] Visitar `https://fnunonca.github.io/Mustrello/`

---

## 🔧 Troubleshooting

### Problema: "404 Not Found" al acceder a la URL
**Solución:**
- Verifica que GitHub Pages esté configurado correctamente en Settings → Pages
- Asegúrate de que la rama `gh-pages` (Opción 1) o el workflow (Opción 2) esté activo
- Espera 2-3 minutos después del deployment

### Problema: La página carga pero las rutas no funcionan (404 en /dashboard)
**Solución:**
- Ya está configurado en `App.tsx` con `basename="/Mustrello"`
- Si persiste, verifica que `vite.config.ts` tenga `base: '/Mustrello/'`

### Problema: Los estilos no cargan correctamente
**Solución:**
- Verifica que `vite.config.ts` tenga el `base` correcto
- Limpia el cache: `cd frontend && rm -rf dist && npm run build`
- Redeploya

### Problema: El workflow de GitHub Actions falla
**Solución:**
- Ve a la pestaña Actions y revisa los logs
- Asegúrate de que el archivo `.github/workflows/deploy.yml` esté en la rama `main`
- Verifica que `frontend/package-lock.json` exista (ejecuta `npm install` si no existe)

---

## 🔄 Actualizar la Aplicación Desplegada

### Con Opción 1 (Manual):
```bash
# 1. Haz tus cambios en el código
# 2. Ejecuta:
cd frontend
npm run deploy
```

### Con Opción 2 (GitHub Actions):
```bash
# 1. Haz tus cambios en el código
# 2. Commit y push:
git add .
git commit -m "Update: descripción de cambios"
git push origin main
# 3. El deployment se ejecuta automáticamente
```

---

## 📊 Monitorear Deployments

### Ver historial de deployments:
1. Ve a tu repositorio en GitHub
2. Click en la pestaña **Actions**
3. Verás todos los workflows ejecutados con su estado (✅ Success / ❌ Failed)

### Ver logs de deployment:
1. En la pestaña Actions
2. Click en cualquier workflow
3. Click en el job "build" o "deploy"
4. Verás los logs completos de la ejecución

---

## 🎉 ¡Listo!

Tu aplicación Mustrello ahora está configurada para ser publicada en GitHub Pages.

**Recomendación final:** Usa **Opción 2 (GitHub Actions)** para tener un flujo de trabajo más profesional y automatizado.

### Próximos pasos:
1. Elige tu método de deployment favorito
2. Sigue el checklist correspondiente
3. Visita `https://fnunonca.github.io/Mustrello/`
4. ¡Disfruta de tu aplicación en producción! 🚀

---

**Credenciales de acceso:**
- Usuario: `oasis`
- Contraseña: `oasis`

---

¿Tienes preguntas? Revisa el troubleshooting o consulta la documentación de:
- [GitHub Pages](https://docs.github.com/en/pages)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
