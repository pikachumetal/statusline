---
id: 20261017-181144-feature-0023-statusline-json
feature: 0023
proposal: 0021
title: statusline.json en el perfil
mode: lite
profile: delegate
status: approved
created: 2026-10-17
author: Claude (Opus 5.5)
approvers:
  - role: dev-lead
    name: Àngel Delgado
    approved_at: 2026-10-17
---

# Spec — statusline.json en el perfil

> **Estado**: approved.
> **Siguiente paso**: modo lite → implementación directa, tras aprobar esta spec.

## Capacidades

- Modificadas: `input` — nueva fuente: `statusline.json` del perfil, con su lectura endurecida y su validación.
- Modificadas: `output` — el número de líneas deja de ser fijo, y una configuración inválida o un nombre desconocido pintan `⚠`.
- Modificadas: `installation` — el instalador no toca `statusline.json`.

## Decisiones que he tomado yo — valida estas

1. `statusline.json` se lee del mismo directorio que los ficheros flag: `CLAUDE_CONFIG_DIR` o, sin la variable, `~/.claude`. — Es la regla de origen de la propuesta, y así cada perfil tiene el suyo.
2. La lectura sigue la de los flags: se ignora si no existe; es inválido si no es un fichero regular, si es un symlink, si pesa más de 4096 bytes o si no se puede leer. — Los flags ya se protegen así. Lo que cambia es el resultado: un flag roto se ignora, y un `statusline.json` roto avisa con `⚠`, porque lo has escrito tú.
3. Un BOM UTF-8 al principio del fichero se acepta. — En Windows, el Bloc de notas y `Set-Content -Encoding utf8` de PowerShell 5 lo escriben, y `JSON.parse` lo rechaza.
4. Es válido solo si la raíz es un objeto, `lines` es un array con al menos una línea y cada línea es un array con al menos un string. — `lines: []` ya lo decidiste como inválido. Por la misma razón, una línea vacía (`[[]]` o `[["cost"], []]`) también es inválida: es un fichero mal escrito, no una forma de ocultar algo.
5. Las claves que no son `lines` se ignoran. — Así, una versión futura puede añadir opciones sin que las versiones de hoy pinten `⚠`.
6. Un nombre que no está entre los 11 no invalida el fichero: pinta `⚠` en su sitio (0022) y el resto del layout se respeta. — Regla de la propuesta.
7. Con el fichero inválido, el `⚠` va al final de la primera línea pintada del layout por defecto, con su separador. — La L1 por defecto siempre pinta el modelo, así que el `⚠` siempre tiene dónde ir.
8. `render` sigue siendo pura. `readEnv` deja `env.layout` (el layout válido) o `env.layoutInvalid: true`, y `render` añade el `⚠` según esa marca.
9. Los minors aplazados de la 0022 entran aquí:
   - El comentario de `SEGMENTS` dirá qué contrato cumple cada pintor, sin repetir el código.
   - El test «layout de la v1.2.0 explícito = sin layout» pasará por `statusline.json` lanzando el proceso: así deja de ser tautológico.
   - La cabecera de `statusline.js` dejará de decir «dos líneas».
10. En `session-state.md` y `usage.md`, el Propósito pasa de «en este orden» a «por defecto, en este orden». Es un retoque de docs del cierre, sin delta: no cambia ningún requisito.
11. El README (es y en) gana la sección «Configurar las líneas» con:
    - dónde va el fichero;
    - su formato;
    - los 11 nombres, cada uno con lo que pinta;
    - un ejemplo: tu layout, con la L1 `duration, profile, where, velocity` y la L2 `context, five_hour, seven_day`;
    - qué pasa con un fichero inválido.

### Decisiones tomadas con el dev-lead

- Modo lite, perfil `delegate`. — «Lite, delegate (Recomendada)»
- Tamaño máximo de 4 KB. — «4 KB (Recomendada)»
- `lines: []` es inválido: layout por defecto y `⚠`. — «Inválido: default y ⚠ (Recomendada)»
- Spec aprobada el 2026-10-17. — «si»

## Intent

La 0022 dejó `render` guiado por `env.layout`, pero nadie puede pasarle un layout. Esta feature lo lee de `statusline.json` en el perfil, lo valida, avisa con `⚠` si está mal y documenta el formato. Con ella, cada uno elige qué segmentos ve, en qué orden y en cuántas líneas. Sin fichero no cambia nada.

## Scope

- **Entra:**
  - `statusline.js`: `readEnv` y una función de lectura y validación nueva; en `render`, el `⚠` de configuración inválida. También los minors de la 0022.
  - `statusline.test.js`: los tests de los THEN y un test del instalador.
  - `README.md` y `README.en.md`.
- **No entra:**
  - Cambiar el instalador: ya no toca `statusline.json`, y el test lo fija.
  - Opciones que no sean `lines` (colores, separador).
  - Crear tu `statusline.json` en `~/.claude` y `~/.claude-gco`: lo hago tras validar, si me lo pides.
  - La B5.

## Approach

`readEnv` llama a `readLayout(claudeDir)`, que hace lo siguiente:
- comprueba el fichero con `lstat`: tiene que ser un fichero regular, no un symlink, y de 4096 bytes o menos;
- lo lee, quita el BOM y lo parsea;
- valida la forma;
- devuelve `{ layout }` si es válido, `{ layoutInvalid: true }` si no lo es y `{}` si no existe (`ENOENT`).

`render` pinta `env.layout ?? DEFAULT_LAYOUT` como hoy. Con `layoutInvalid`, añade `FAILED` como último segmento de la primera línea no vacía.

### Criterios de aceptación

En todos, el stdin es el mismo: modelo `Opus`, coste 0.42 USD, `cwd` en este repo. El perfil es un directorio temporal en `CLAUDE_CONFIG_DIR`.

- **Sin fichero:** GIVEN un perfil sin `statusline.json` · WHEN se lanza el statusline · THEN la salida es igual byte a byte a la de la v1.2.0 (dos líneas, sin `⚠`).
- **Layout de la v1.2.0 en el fichero:** GIVEN `{"lines": [["profile","where","model","caveman","ponytail","velocity"],["duration","context","five_hour","seven_day","cost"]]}` · WHEN se lanza · THEN la salida es igual byte a byte a la de sin fichero.
- **Una línea:** GIVEN `{"lines": [["where","model","context"]]}` · WHEN se lanza · THEN sale una sola línea: `statusline  <rama> … │ 🤖 Opus │ 🟢 …`.
- **Tres líneas:** GIVEN `{"lines": [["model"],["cost"],["duration"]]}` · WHEN se lanza · THEN salen tres líneas: `🤖 Opus`, `💰 $0.42` y `⏱️ …`.
- **Inválidos:** GIVEN cada uno de estos casos · WHEN se lanza · THEN salen las dos líneas por defecto y la L1 acaba en ` │ ⚠` gris:
  - JSON roto (`{"lines": [`);
  - `{"lines": "where"}`;
  - `{"lines": []}`;
  - `{"lines": [["cost"], []]}`;
  - `{"lines": [["cost", 3]]}`;
  - `[]`;
  - `{}`;
  - un fichero de 4097 bytes;
  - un directorio llamado `statusline.json`;
  - un symlink a un JSON válido (si el sistema deja crearlo).
- **4096 bytes justos:** GIVEN un `statusline.json` válido de 4096 bytes (relleno con espacios) · WHEN se lanza · THEN se aplica su layout, sin `⚠`.
- **BOM:** GIVEN `{"lines": [["cost"]]}` precedido de un BOM UTF-8 · WHEN se lanza · THEN sale una sola línea `💰 $0.42`.
- **Claves de más:** GIVEN `{"lines": [["cost"]], "theme": "x"}` · WHEN se lanza · THEN sale `💰 $0.42`, sin `⚠`.
- **Nombre desconocido:** GIVEN `{"lines": [["where","modle","cost"]]}` · WHEN se lanza · THEN la línea es `statusline  <rama> … │ ⚠ │ 💰 $0.42`, con el `⚠` gris.
- **Un perfil por fichero:** GIVEN `{"lines": [["cost"]]}` en el perfil A y ningún fichero en el perfil B · WHEN se lanza con `CLAUDE_CONFIG_DIR` = B · THEN la salida es la de sin fichero.
- **El instalador no lo toca:** GIVEN un perfil con un `statusline.json` · WHEN se ejecuta `install.ps1` sobre ese perfil, primero como instalación limpia y después como update · THEN el `statusline.json` queda igual byte a byte.

## Delta de comportamiento

### Capacidad: `input`

**ADDED — Lectura de statusline.json**

> Cobertura: con test. El symlink, solo si el sistema deja crearlo.

- GIVEN el fichero `statusline.json` en el perfil (`CLAUDE_CONFIG_DIR`, o `~/.claude` si no está definida)
- WHEN el statusline lo lee
- THEN, si no existe, usa el layout por defecto sin marca
- AND lo da por inválido si no es un fichero regular, si es un symlink, si pesa más de 4096 bytes o si no se puede leer
- AND acepta un BOM UTF-8 al principio
- AND solo lee el `statusline.json` de su perfil: con `CLAUDE_CONFIG_DIR=C:\Users\u\.claude-gco`, el de `~/.claude` no influye

**ADDED — Forma de statusline.json**

> Cobertura: con test.

- GIVEN un `statusline.json` que se ha podido leer
- WHEN el statusline lo valida
- THEN es válido solo si es JSON, si la raíz es un objeto, si `lines` es un array con al menos una línea y si cada línea es un array con al menos un string
- AND las claves que no son `lines` se ignoran: `{"lines": [["cost"]], "theme": "x"}` es válido
- AND son inválidos `{"lines": "where"}`, `{"lines": []}`, `{"lines": [["cost"], []]}`, `{"lines": [["cost", 3]]}`, `[]` y `{}`
- AND un nombre que no es de un segmento no invalida el fichero: lo resuelve `output`

**Reglas de la capacidad**
- **Límites**: 64 bytes por fichero flag; 4096 bytes para `statusline.json`; 2000 ms por llamada a `git`.
- **Avisos**: un `statusline.json` inválido pinta `⚠` (ver `output.md`). Cualquier otra fuente que falla se trata como dato ausente.

### Capacidad: `output`

**REMOVED — Dos líneas**
- motivo: el número de líneas lo fija el layout; lo sustituye «Número de líneas».

**ADDED — Número de líneas**

> Cobertura: con test.

- GIVEN cualquier entrada
- WHEN el statusline termina
- THEN ha escrito en stdout una línea por cada línea del layout que tenga algo que pintar, separadas por un salto de línea y sin salto final
- AND sin `statusline.json`, el layout es el de la v1.2.0: L1 perfil, ubicación, modelo, caveman, ponytail y velocity; L2 reloj, contexto, 5h, semanal y coste
- AND con `{"lines": [["model"],["cost"],["duration"]]}` escribe tres líneas: `🤖 Opus`, `💰 $0.42` y `⏱️ …`
- AND una línea sin nada que pintar se omite: `[["caveman"], ["cost"]]` sin caveman activo escribe solo la línea del coste
- AND un segmento repetido se pinta cada vez: `[["cost", "cost"]]` escribe `💰 $0.42 │ 💰 $0.42`
- AND no escribe nada en stderr

**ADDED — Configuración inválida**

> Cobertura: con test.

- GIVEN un `statusline.json` inválido (ver `input.md`)
- WHEN se pinta el statusline
- THEN pinta el layout de la v1.2.0 y la L1 acaba en ` │ ⚠`, con el `⚠` en gris
- AND con `{"lines": "where"}` y modelo `Opus`, la L1 acaba en `🤖 Opus │ ⚠` y la L2 se pinta entera

**ADDED — Nombre de segmento desconocido**

> Cobertura: con test.

- GIVEN un layout con un nombre que no es de ningún segmento (los nombres distinguen mayúsculas: `Where` no es `where`)
- WHEN se pinta su línea
- THEN en su sitio se pinta `⚠` en gris, con su separador, y el resto del layout se respeta
- AND `[["where", "modle", "cost"]]` pinta `statusline  <rama> │ ⚠ │ 💰 $0.42`

**Reglas de la capacidad**
- **Límites**: tantas líneas como tenga el layout; sin `statusline.json`, dos. No hay ancho máximo: una línea más larga que el terminal no se trunca.
- **Avisos**: `⚠` gris en el sitio de un segmento que falla o de un nombre desconocido, y al final de la L1 con un `statusline.json` inválido.

### Capacidad: `installation`

**ADDED — El instalador no toca statusline.json**

> Cobertura: con test.

- GIVEN un perfil con un `statusline.json`
- WHEN se ejecuta `install.ps1` sobre ese perfil, como instalación limpia o como update
- THEN el `statusline.json` queda igual byte a byte
- AND sin `statusline.json`, el instalador no lo crea

### Estimación y esfuerzo

- **Tipo:** backend.
- **Esfuerzo de la spec:** 0.4h.
- **Estimación de la implementación:** 2h.
- **Base:**
  - Una función de lectura y validación siguiendo el patrón de `readSmallFile`.
  - Un `⚠` en `render`.
  - Unos 15 asserts de proceso, con el patrón de los tests de flags.
  - Los README en es y en.
  - Los minors.
  - Referencia: la 0022, con 1h estimada y 0.5h real; en el log, la mediana de backend es 1.
- **Confianza:** media. El symlink en Windows y los README le añaden algo de incertidumbre.

## Enmiendas

## Aprobaciones

| Rol | Nombre | Fecha | Estado |
| --- | --- | --- | --- |
| dev-lead | Àngel Delgado | 2026-10-17 | aprobada: «si» |
