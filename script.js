function obtenerClaveSemana(fecha) {
  const primerDiaDelAño = new Date(fecha.getFullYear(), 0, 1);
  const dias = Math.floor((fecha - primerDiaDelAño) / (24 * 60 * 60 * 1000));
  const numeroSemana = Math.ceil((dias + primerDiaDelAño.getDay() + 1) / 7);
  return `${fecha.getFullYear()}-S${numeroSemana.toString().padStart(2, '0')}`;
}
