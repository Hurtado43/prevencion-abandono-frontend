/**
 * Repite una carga cada `ms` milisegundos, pensado para conexiones lentas:
 * - no lanza una petición nueva mientras la anterior no ha terminado (antes, con la red lenta, las
 *   peticiones del chat cada 4 s se acumulaban y la página se quedaba "cargando");
 * - no consulta mientras la pestaña está oculta y, al volver a ella, refresca de inmediato.
 *
 * Devuelve la función que detiene el sondeo (para el cleanup del useEffect).
 */
export function sondear(cargar: () => Promise<unknown>, ms: number): () => void {
  let enCurso = false
  const tick = () => {
    if (enCurso || document.hidden) return
    enCurso = true
    void cargar().finally(() => {
      enCurso = false
    })
  }
  const intervalo = window.setInterval(tick, ms)
  const alVolver = () => {
    if (!document.hidden) tick()
  }
  document.addEventListener('visibilitychange', alVolver)
  return () => {
    window.clearInterval(intervalo)
    document.removeEventListener('visibilitychange', alVolver)
  }
}
