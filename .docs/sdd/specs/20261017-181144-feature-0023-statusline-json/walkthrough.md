---
id: 20261017-181144-feature-0023-statusline-json
feature: 0023
title: Walkthrough — statusline.json en el perfil
spec: ./spec.md
status: done
created: 2026-10-17
---

# Walkthrough — statusline.json en el perfil

## 1. Cambios realizados

- `statusline.js`:
  - `readLayout(claudeDir)` lee `statusline.json` con `readSmallFile` (tope de 4096 bytes), quita el BOM, parsea y valida la forma con `isLayout`.
  - `readEnv` le pasa a `render` `layout` o `layoutInvalid`.
  - `render` añade ` │ ⚠` a la primera línea si recibe `layoutInvalid`.
  - Minors de la 0022: la cabecera y el comentario de `SEGMENTS`.
  - Commit `bbf9158`, juntado en el cierre.
- `statusline.test.js`:
  - un bloque de proceso con un THEN por caso;
  - `render` con `layoutInvalid`;
  - un bloque del instalador, que no toca ni crea `statusline.json`;
  - el test tautológico de la 0022 se sustituye por el que pasa por el fichero.
- `README.md` y `README.en.md`: la sección «Configurar las líneas», más la intro, la L1 y la L2 marcadas como «por defecto».
- `.docs/sdd/constitution.md`: el tope de 4096 bytes para `statusline.json` y el aviso `⚠` en las reglas 3 y 4 (commit `2e5f195`).
- Capacidades:
  - `input`, `output` e `installation`: delta fusionado;
  - `session-state` y `usage`: el Propósito dice «por defecto en este orden».

## 2. Tiempo y coste: estimado vs real

- Tipo: backend
- Estimación de implementación (de la spec lite): 2h
- Esfuerzo real: 0.75h — reloj del hilo aproximado (spec aprobada 19:17, último commit 19:30, más la revisión final de 2 min, el smoke y la presentación)
- Desviación: -1.25h (-63 %)
- Causa de la desviación: la 0022 dejó `render` guiado por `env.layout` y `readSmallFile` ya tenía el hardening; la feature fue una función de lectura, una marca y tests con el patrón de los flags. La estimación pesó de más el symlink en Windows y el README, que salieron a la primera.
- Modelo del hilo: Opus 5.5, effort medium
- Tokens del hilo: 5.600.621 — claude-opus-5-5 5.600.621
- Tokens de subagentes: 536.312 en 1 despacho — Revisor final 0023 claude-opus-5-5 536.312 / 2 min
- Coste de la sesión: sin precio (sin tabla pricing en sdd-kit.json)
- Coste de sujetos: no aplica
- Review de spec: no

## 3. Desviaciones del plan

- Modo lite, sin plan: la implementación sigue el Approach de la spec.

### Decisiones tomadas sin el dev-lead

- Enmienda de la constitution:
  - **Qué:** la regla 3 decía «todo fichero externo… 64 bytes» y que el número de líneas «pasa a ser configurable»; la regla 4 no tenía el `⚠` de configuración.
  - **Por qué:** es la consecuencia de los 4 KB y del aviso, que aprobaste en la spec. La spec no la nombraba.
  - **Cómo:** commit propio y revisado en la revisión final.
  - **Coste si es incorrecta:** revertir 8 líneas de docs.
- Revisión final (`sdd-kit:effort-high` + opus, limpia, 6 minors, sobre `2e5f195`):
  - **Minors 1, 2 y 5 arreglados en el hilo** (`78da7a2`, 7 líneas de docs y comentario, revisado en el hilo): el comentario de `readSmallFile`, los casos «directorio / no se puede leer» en el README y la atribución del `⚠` en la constitution. Coste si es incorrecto: ninguno.
  - **Minors aplazados a la deuda técnica:**
    - 3: el test «un perfil por fichero» es más débil que su THEN;
    - 4: `^statusline\b` depende de cómo se llame la carpeta del clon;
    - 6: falta un test del fallback a `~/.claude` sin `CLAUDE_CONFIG_DIR`.

## 4. Verificación

### 4.1 Builds

- Suite completa: `node statusline.test.js` → `statusline.test.js OK` · 47 s (antes ~10 s: lanza ~25 procesos y tres `install.ps1`); `claude plugin test mod` → 43 pass · 3.6 s.

### 4.2 Smoke / tests

- Validación diferida: 2026-10-17 · «Diferir al smoke de la 2.0.0» · disparador: smoke de la release 2.0.0, a cargo del dev-lead (guion de la presentación: `install.ps1` en `~/.claude-gco`, tu layout, `{"lines": "where"}`, `modle`).

| Criterio | Evidencia | Resultado |
| --- | --- | --- |
| Sin fichero = v1.2.0 | ejecución real | `statusline.js` de `develop` y de la rama, mismo stdin (completo, `{}` y vacío): salidas iguales byte a byte |
| Layout de la v1.2.0 en el fichero = sin fichero | suite | iguales |
| Una línea | suite | `statusline … │ 🤖 Opus │ 🟢 …` |
| Tres líneas | ejecución real | `🤖 Opus` / `💰 $0.42` / `⏱️ 0m` |
| Inválido `{"lines": "where"}` | ejecución real | L1 `… │ 🤖 Opus │ ⚠`, L2 entera |
| Resto de inválidos (JSON roto, `[]`, `{}`, `[[]]`, no-string, 4097 B, directorio, symlink) | suite | `⚠` gris al final de la L1. El symlink se ejecutó, no se saltó |
| 4096 bytes justos, BOM, claves de más | suite | se aplica el layout, sin `⚠` |
| Nombre desconocido | ejecución real | `statusline … │ ⚠ │ 💰 $0.42` |
| Un perfil por fichero | suite | el fichero de otro perfil no influye |
| El instalador no lo toca | suite | igual byte a byte en instalación limpia y en update, y no lo crea |

### 4.3 Residuales / deuda generada

- Los minors 3, 4 y 6 de la revisión final, en la deuda técnica del roadmap.

## 5. Aprendizajes

- `statusline.json` es el único fichero externo con tope propio y el único cuyo fallo avisa: lo escribe la persona → `architecture.md`.
- Una regla de la constitution con una cifra (el tope de 64 bytes) se contrasta con la spec antes del gate. Aquí se vio después de aprobarla → es de proceso, no de arquitectura: va al ticket del kit (`sdd-feedback`), si se genera.

## 6. Adendas
