---
id: 20261017-124615-feature-0024-controls-mod
feature: 0024
title: Walkthrough — Mod de controles bajo la status line
spec: ./spec.md
plan: ./plan.md
status: done
created: 2026-10-17
---

# Walkthrough — Mod de controles bajo la status line

## 1. Cambios realizados

- **Mod `statusline-controls`** (`mod/`): sustituye la línea de pista bajo la status line (`ui.render` sobre `PromptHint`) por una fila con `🤖 modelo (effort)`, `🗿 caveman`, `🦥 ponytail`, `💰 coste · $/h`, `[passed]`/`[failed]` y `Board`, y detrás la pista del motor. `mod/hooks/logic.ts` es puro (nombre del modelo, coste, flags, effort confirmado, primera línea, detección de tests, ruta del board) y `mod/hooks/register.tsx` tiene el acceso al motor. Tasks 1-3: `24fd605`, `e18c282`, `81faa03`.
- **Selectores**: un clic despliega las opciones y oculta el resto; la opción lanza el comando del plugin (`/model`, `/effort`, `/caveman:caveman`, `/ponytail:ponytail`), pliega y avisa con la primera línea de la respuesta. El effort solo cambia si `/effort` lo confirma. `✕` o la propia pastilla cierran. Una pausa de 400 ms tras abrir ignora el segundo clic de un doble clic.
- **Tests**: el indicador cuenta los comandos de test lanzados por Bash y por PowerShell (enmienda de la spec).
- **Marketplace de carpeta** `.claude-plugin/marketplace.json` en la raíz, con `source: ./mod`.
- **Instalador** (`install.ps1`, task 4 `02bff1d`): tras la status line, `claude plugin marketplace add <repo>` y `claude plugin install statusline-controls@statusline` con el `CLAUDE_CONFIG_DIR` del perfil, en instalación y update; el perfil por defecto va sin la variable. `-Claude` para un CLI falso en los tests.
- **Docs**: enmiendas de la constitution (principios 1, 2 y 4, reglas 1 y 4), `tech-stack.md`, `architecture.md`, `mission.md`, `CLAUDE.md`, y README en los dos idiomas.
- Arreglos de la revisión final y de las re-revisiones, juntados en el commit de cierre.

## 2. Tiempo y coste: estimado vs real

- Tipo: frontend
- Estimación de implementación (del plan): 2.5h
- Esfuerzo real: 1.4h — reloj del hilo por las marcas de los commits (apertura 12:55 UTC, último arreglo 14:20 UTC), sin contar spec y plan (~1h, incluido el spike y la maqueta)
- Desviación: -1.1h (-44 %)
- Causa de la desviación: el spike ya había resuelto el pintado, los comandos y el estado; la incertidumbre del harness de tests costó menos de lo previsto (ajustes de mecánica, sin rediseño).
- Modelo del hilo: Opus 5.5, effort medium (toda la feature)
- Tokens del hilo: 65.573.081 — claude-opus-5-5 65.573.081
- Tokens de subagentes: 2.520.482 en 5 despachos — Review spec 0024 dominio claude-opus-5-5 115.610 / 1 min; Re-revisión 0024 perfil por defecto claude-opus-5-5 170.738 / 1 min; Review spec 0024 técnica claude-sonnet-5-5 120.359 / 1 min; Re-revisión 0024 tramo PowerShell claude-opus-5-5 313.356 / 1 min; Revisor final 0024 claude-opus-5-5 1.800.419 / 6 min
- Coste de la sesión: sin precio (sin tabla pricing en sdd-kit.json)
- Coste de sujetos: no aplica
- Review de spec: 2 revisores · hallazgos 20, aceptados 18

## 3. Desviaciones del plan

- Task 2: en la forma abierta, el nombre del selector es un botón con la key de la pastilla que la cierra (no estaba en el plan).
- Fix de la revisión final: pausa de 400 ms tras abrir un selector.
- Enmienda aprobada: el indicador de tests cuenta también PowerShell.
- Fix tras instalar en el perfil real: el perfil por defecto va sin `CLAUDE_CONFIG_DIR`, y su aviso «sin CLI» tampoco la pide.

### Decisiones tomadas sin el dev-lead

- Tests RED de las tasks 1-3 ajustados solo en mecánica del harness (helper `session` con variantes, `turn.step` leído como stream, comando inexistente simulado con un rechazo, mock de Bash con `{ result }`), sin cambiar asserts — un harness nuevo — si el motor real se comportara distinto, el test no probaría lo que dice.
- El coste va en un `Box key="cost"` porque el harness no conserva la key de un `Text` — coste si incorrecto: ninguno visible.
- Botones con `onPress` vacío en la task 1 porque el motor rechaza un `Button` sin él — coste: ninguno.
- En la forma abierta, el nombre del selector cierra el selector — coste: ninguno.
- Important 3 de la revisión final (el mod ocultaría el indicador del modo de permisos) refutado con las capturas del spike y de la sesión real: «bypass permissions on ·» sigue delante de la fila — si no fuera así, se perdería una señal de seguridad.
- Los tests de opción ganan `settle()` (avance del reloj de 500 ms) por la pausa del fix, sin cambiar asserts.
- Minor 7 re-graduado a Important tras verlo en el perfil real (`~/.claude/.claude.json` creado por el CLI y borrado) y arreglado con test.
- Minors aplazados: `isTestCommand` detecta el runner en cualquier posición (`cat jest.config.js` cuenta); `modelName` lee una fecha como versión menor; `pick` convierte cualquier rechazo en «not available»; `firstLine` recorta por unidades UTF-16; falta test de la fila con Sonnet tras `/model` y del refresco tras `/caveman`; faltan dos asserts del plan en los tests del instalador; `-ConfigDir ~\.claude` y rutas relativas no se resuelven antes de comparar; el test del perfil por defecto no fija un `CLAUDE_CONFIG_DIR` heredado.

## 4. Verificación

### 4.1 Builds

- `claude plugin validate mod` → `✔ Validation passed with warnings` (solo el aviso de autor).
- Suite completa: `claude plugin test mod` → 43 pass · 3 s; `node statusline.test.js` → `statusline.test.js OK` · 10 s.

### 4.2 Smoke / tests

- Validación diferida: 2026-10-17 · «Diferir al smoke de la 2.0.0 (Recomendada)» · disparador: smoke de la release 2.0.0, a cargo del dev-lead, con el guion de pruebas de la validación (selectores, doble clic, `✕`, shift+tab, `[passed]` por PowerShell, Board, coste igual a la status line). El dev-lead vio la fila del mod en una sesión real (captura: `Opus 5.5 (medium) caveman full $29.41 · $13.82/h Board`).

| THEN | Evidencia | Resultado |
| --- | --- | --- |
| controls · Fila plegada | suite | 🤖, (effort), 🗿, 🦥, 💰 y Board en orden, pista detrás |
| controls · Nombre del modelo | suite | Opus 5.5, Sonnet 5.5, Haiku 4.5, id tal cual |
| controls · Coste en vivo | suite | sin `$/h` antes de 5 min o con 0 USD; se relee en cada pintado |
| controls · Abrir un selector | suite | solo opciones, `✕` y pista; sigue abierto al empezar un turno |
| controls · Elegir una opción | suite | comando del plugin, pliega, aviso con la primera línea |
| controls · Elegir con un turno en curso | no probado | el harness no simula un turno en curso |
| controls · Cambio que Claude Code no aplica | suite | `Kept effort level as medium` deja `(medium)` |
| controls · Comando que no existe | suite | pliega y avisa `/ponytail:ponytail is not available` |
| controls · Cerrar sin elegir | suite | sin comando |
| controls · Modos de otros plugins | suite | ausente o fuera de whitelist = `off` |
| controls · Estado de los tests | suite | `[passed]`/`[failed]` por Bash y PowerShell; compuestos cuentan; segundo plano no |
| controls · Board | suite | abre el board; `XDG_CONFIG_HOME` manda; aviso si no existe |
| controls · Un fallo no rompe la línea | suite | `⚠` en el coste; render fallido = pista del motor |
| installation · Instalación del mod de controles | ejecución real | `claude` real en perfil temporal y en `~/.claude` y `~/.claude-gco`: «Successfully installed», «Mod de controles instalado» |
| installation · Sin CLI de Claude Code | suite | código 0, aviso con los dos comandos |
| installation · Fallo al instalar el mod | suite | código 1, el error nombra el comando, bloque mostrado |
| installation · El instalador no toca settings.json | ejecución real + suite | el CLI crea y registra en `settings.json`; `install.ps1` lo deja igual byte a byte |
| installation · Update sobre una instalación existente | ejecución real | segunda instalación: «already installed», código 0 |

### 4.3 Residuales / deuda generada

- Los minors aplazados de §3 → fila en la deuda técnica del roadmap.
- Quitar de la L1 y la L2 lo que pinta el mod depende de la 0023 (`statusline.json`).
- `Test-Capabilities.ps1` señala líneas sueltas en `input.md`, `output.md` y `session-state.md`, que esta feature no toca: pendiente del dev-lead.

## 5. Aprendizajes

- El harness de `claude-code/testing`: un hook por evento y test, `turn.step` es un stream que hay que leer entero y su respuesta lleva `{ turnId, index, answer, toolUses }`, `tool.call` responde `{ result }`, un `Text` no conserva su `key` y un `Button` exige `onPress` → `architecture.md` («Mod de controles»).
- `$.env.get` exige un nombre literal; `$.command.run` rechaza un comando que no existe → `architecture.md`.
- Con `CLAUDE_CONFIG_DIR` apuntando a `~/.claude`, el CLI `claude` crea un `.claude.json` propio dentro de esa carpeta → capacidad `installation` (ya en la regla «Dónde viven los datos» vía el delta) y `architecture.md`.

## 6. Adendas

- 2026-10-18 — Validado en el smoke de la release 2.0.0: «Todo, lo uso a diario y funciona». Cierra la validación diferida.
