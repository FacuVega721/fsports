/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║   MANIFEST DE DATOS DE FSPORTS — ARCHIVO EDITABLE A MANO          ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                   ║
 * ║  Este archivo es la fuente de datos cuando la web está en modo    ║
 * ║  'manual' (el modo por defecto). Podés editarlo con el Bloc de    ║
 * ║  notas o cualquier editor. Guardás el archivo y la web se         ║
 * ║  actualiza sola (si está corriendo con `npm run dev`) o al hacer  ║
 * ║  el próximo `npm run build` + deploy.                             ║
 * ║                                                                   ║
 * ║  REGLAS DE ORO PARA NO ROMPER NADA:                               ║
 * ║   1. Cada dato de texto va entre comillas: "México"               ║
 * ║   2. Los números van SIN comillas: 2                              ║
 * ║   3. Cada partido va entre llaves { ... } y termina con coma      ║
 * ║   4. No borres las comas que separan los elementos                ║
 * ║   5. Si un dato no existe todavía (ej: goles de un partido que    ║
 * ║      no se jugó), poné: null                                      ║
 * ║                                                                   ║
 * ║  Si algo queda mal escrito, la web NO se rompe: el partido se     ║
 * ║  muestra con valores por defecto ("?", 0, etc.).                  ║
 * ║                                                                   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

/* Forma del manifest. No hace falta tocar esta sección: está acá para
   que el editor te marque errores graves, pero es deliberadamente
   flexible (casi todo es opcional) para que editar sea seguro. */
export interface ManifestData {
  futbol: {
    competicion: string;
    partidos: Array<{
      id?: string;
      fecha?: string;      // "2026-06-11" (año-mes-día)
      hora?: string;       // "16:00" (hora ARGENTINA, UTC-3)
      estado?: string;     // "programado" | "en_vivo" | "finalizado"
      local?: string;
      localCode?: string;  // código de país de 2 letras: mx, ar, br...
      golesLocal?: number | null;
      visitante?: string;
      visitanteCode?: string;
      golesVisitante?: number | null;
      grupo?: string;      // "A", "B"... (vacío si no aplica)
      // Fase del torneo. Si no la ponés, se asume "grupos". Para la eliminatoria:
      // "dieciseisavos" | "octavos" | "cuartos" | "semifinal" | "tercer_puesto" | "final"
      fase?: string;
      estadio?: string;
      minuto?: number | null; // solo para partidos en vivo
    }>;
    posiciones: Array<{
      grupo?: string;
      equipos?: Array<{
        pos?: number;
        nombre?: string;
        code?: string;
        pj?: number;   // partidos jugados
        pts?: number;  // puntos
        // Opcionales (estilo tabla completa). Si no los cargás, quedan en 0.
        g?: number;    // ganados
        e?: number;    // empatados
        p?: number;    // perdidos
        gf?: number;   // goles a favor
        gc?: number;   // goles en contra
        dif?: number;  // diferencia (si no la ponés, se calcula gf - gc)
      }>;
    }>;
  };
  f1: {
    temporada: string;
    ultimaCarrera: {
      gp?: string;
      code?: string;      // país del GP, 2 letras: ca, es, mc...
      circuito?: string;
      // Los primeros 3 se muestran como podio destacado.
      // Podés cargar más posiciones y aparecen en la tabla de resultados.
      podio?: Array<{
        pos?: number;
        piloto?: string;
        equipo?: string;
        tiempo?: string;  // "1:33:24.567" o "+5.123" o "+1 vuelta"
      }>;
    } | null;
    proximaCarrera: {
      gp?: string;
      code?: string;
      circuito?: string;
      fecha?: string;  // "2026-06-22"
      hora?: string;   // hora ARGENTINA (UTC-3), ej "10:00"
    } | null;
    pilotos: Array<{ pos?: number; nombre?: string; pts?: number; equipo?: string }>;
    // Opcional: campeonato de constructores
    constructores?: Array<{ pos?: number; nombre?: string; pts?: number }>;
  };
}

export const MANIFEST: ManifestData = {
  /* ════════════════════════ ⚽ FÚTBOL ════════════════════════ */
  futbol: {
    // Nombre de la competición (aparece en el banner de la página)
    competicion: "Mundial 2026",

    /* ─── PARTIDOS ───
       Para agregar un partido: copiá un bloque completo { ... },
       pegalo debajo del último y cambiá los datos.
       "estado" puede ser: "programado" | "en_vivo" | "finalizado"  */
    partidos: [
      {
        id: "1",
        fecha: "2026-06-11",
        hora: "16:00",
        estado: "finalizado",
        local: "México", localCode: "mx", golesLocal: 2,
        visitante: "Sudáfrica", visitanteCode: "za", golesVisitante: 0,
        grupo: "A", estadio: "Estadio Azteca", minuto: null,
      },
      {
        id: "2",
        fecha: "2026-06-11",
        hora: "19:00",
        estado: "en_vivo",       // partido EN VIVO: cargá el minuto abajo
        local: "Canadá", localCode: "ca", golesLocal: 1,
        visitante: "Honduras", visitanteCode: "hn", golesVisitante: 1,
        grupo: "B", estadio: "BMO Field, Toronto", minuto: 63,
      },
      {
        id: "3",
        fecha: "2026-06-12",
        hora: "13:00",
        estado: "programado",    // todavía no se jugó: goles en null
        local: "Estados Unidos", localCode: "us", golesLocal: null,
        visitante: "Paraguay", visitanteCode: "py", golesVisitante: null,
        grupo: "D", estadio: "SoFi Stadium, Los Ángeles", minuto: null,
      },
      {
        id: "4",
        fecha: "2026-06-12",
        hora: "16:00",
        estado: "programado",
        local: "Argentina", localCode: "ar", golesLocal: null,
        visitante: "Argelia", visitanteCode: "dz", golesVisitante: null,
        grupo: "J", estadio: "Hard Rock Stadium, Miami", minuto: null,
      },
      {
        id: "5",
        fecha: "2026-06-13",
        hora: "10:00",
        estado: "programado",
        local: "Brasil", localCode: "br", golesLocal: null,
        visitante: "Marruecos", visitanteCode: "ma", golesVisitante: null,
        grupo: "C", estadio: "MetLife Stadium, Nueva York", minuto: null,
      },
      // 👉 Para agregar un partido nuevo, copiá desde { hasta }, acá abajo:
    ],

    /* ─── TABLA DE POSICIONES ───
       Un bloque por grupo. pj = partidos jugados, pts = puntos. */
    posiciones: [
      {
        grupo: "A",
        equipos: [
          { pos: 1, nombre: "México", code: "mx", pj: 1, pts: 3 },
          { pos: 2, nombre: "Corea del Sur", code: "kr", pj: 0, pts: 0 },
          { pos: 3, nombre: "Escocia", code: "gb-sct", pj: 0, pts: 0 },
          { pos: 4, nombre: "Sudáfrica", code: "za", pj: 1, pts: 0 },
        ],
      },
      {
        grupo: "B",
        equipos: [
          { pos: 1, nombre: "Canadá", code: "ca", pj: 0, pts: 0 },
          { pos: 2, nombre: "Honduras", code: "hn", pj: 0, pts: 0 },
          { pos: 3, nombre: "Suiza", code: "ch", pj: 0, pts: 0 },
          { pos: 4, nombre: "Gales", code: "gb-wls", pj: 0, pts: 0 },
        ],
      },
      {
        grupo: "J",
        equipos: [
          { pos: 1, nombre: "Argentina", code: "ar", pj: 0, pts: 0 },
          { pos: 2, nombre: "Argelia", code: "dz", pj: 0, pts: 0 },
          { pos: 3, nombre: "Austria", code: "at", pj: 0, pts: 0 },
          { pos: 4, nombre: "Jordania", code: "jo", pj: 0, pts: 0 },
        ],
      },
    ],
  },

  /* ════════════════════════ 🏎️ FÓRMULA 1 ════════════════════════ */
  f1: {
    // Temporada (aparece en el banner de la página /f1)
    temporada: "2026",

    /* ─── ÚLTIMA CARRERA ───
       Los primeros 3 del "podio" se muestran destacados (oro/plata/bronce).
       Podés cargar más posiciones (4, 5, 6...) y aparecen en la tabla. */
    ultimaCarrera: {
      gp: "GP de Canadá",
      code: "ca",
      circuito: "Circuit Gilles Villeneuve",
      podio: [
        { pos: 1, piloto: "Max Verstappen", equipo: "Red Bull", tiempo: "1:33:24.567" },
        { pos: 2, piloto: "Lando Norris", equipo: "McLaren", tiempo: "+4.183" },
        { pos: 3, piloto: "Charles Leclerc", equipo: "Ferrari", tiempo: "+9.764" },
        { pos: 4, piloto: "Oscar Piastri", equipo: "McLaren", tiempo: "+15.301" },
        { pos: 5, piloto: "Franco Colapinto", equipo: "Alpine", tiempo: "+22.876" },
        { pos: 6, piloto: "George Russell", equipo: "Mercedes", tiempo: "+28.110" },
      ],
    },

    /* ─── PRÓXIMA CARRERA ─── (hora ARGENTINA, UTC-3) */
    proximaCarrera: {
      gp: "GP de España",
      code: "es",
      circuito: "Circuit de Barcelona-Catalunya",
      fecha: "2026-06-22",
      hora: "10:00",
    },

    /* ─── CAMPEONATO DE PILOTOS ─── */
    pilotos: [
      { pos: 1, nombre: "M. Verstappen", pts: 161, equipo: "Red Bull" },
      { pos: 2, nombre: "L. Norris", pts: 148, equipo: "McLaren" },
      { pos: 3, nombre: "C. Leclerc", pts: 132, equipo: "Ferrari" },
      { pos: 4, nombre: "O. Piastri", pts: 121, equipo: "McLaren" },
      { pos: 5, nombre: "G. Russell", pts: 98, equipo: "Mercedes" },
      { pos: 6, nombre: "F. Colapinto", pts: 74, equipo: "Alpine" },
      { pos: 7, nombre: "L. Hamilton", pts: 70, equipo: "Ferrari" },
      { pos: 8, nombre: "F. Alonso", pts: 52, equipo: "Aston Martin" },
    ],

    /* ─── CAMPEONATO DE CONSTRUCTORES (opcional) ─── */
    constructores: [
      { pos: 1, nombre: "McLaren", pts: 269 },
      { pos: 2, nombre: "Red Bull", pts: 203 },
      { pos: 3, nombre: "Ferrari", pts: 202 },
      { pos: 4, nombre: "Mercedes", pts: 144 },
      { pos: 5, nombre: "Alpine", pts: 96 },
      { pos: 6, nombre: "Aston Martin", pts: 71 },
    ],
  },
};
