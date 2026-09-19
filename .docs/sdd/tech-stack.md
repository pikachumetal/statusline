# Tech stack — statusline

## Decidido

| Pieza | Tecnología | Notas |
| --- | --- | --- |
| Runtime | Node, CommonJS (`require`) | Se desarrolla y se prueba con `v26.9.0`. No se declara versión mínima ni hay compromiso de compatibilidad hacia atrás. |
| Dependencias | Ninguna | Solo stdlib: `fs`, `os`, `path`, `child_process`, `assert`. Sin `package.json`. |
| Binario externo | `git` | Invocado con `execFileSync`, `--no-optional-locks` y `timeout: 2000` ms. |
| Tests | Script plano con `assert` | `node statusline.test.js`. Sin test runner. |
| Instalador | PowerShell 7+ (`install.ps1`) | Solo Windows. |
| Lanzador | `statusline.cmd` | Solo Windows. |
| Salida | ANSI truecolor + iconos nerd font | Requisito duro del terminal (ver `mission.md`). |

## Abierto

- **`node --test`:** el test runner de la stdlib sustituiría al script plano sin
  añadir dependencias. No hay decisión. Se valora si el fichero de tests crece.
- **Lanzador para macOS y Linux:** no existe. Hoy se configura a mano.
