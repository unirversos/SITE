/* Unirversos · Aulas particulares — cálculos de horário (comum à página do aluno e à da professora).
   Os horários são guardados no horário de Brasília (UTC−3, sem horário de verão). */
export const DIAS = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
const H = 3600e3;
/* "2026-11-20" + "19:00" (Brasília) -> Date */
export function brasilia(dataStr, hora){
  const [y, m, d] = dataStr.split('-').map(Number), [h, mi] = (hora || '00:00').split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, h + 3, mi));
}
const ymd = dt => { const b = new Date(dt.getTime() - 3 * H); return b.toISOString().slice(0, 10); };
/* lista as próximas aulas (início e fim) a partir de agora */
export function proximas(a, quantas = 4, agora = new Date()){
  if (!a || a.ativo === false) return [];
  const dur = (Number(a.dur) || 60) * 60e3, pular = new Set(a.pular || []), out = [];
  const hojeBR = new Date(agora.getTime() - 3 * H);
  for (let k = 0; k < 60; k++) {
    const dia = new Date(Date.UTC(hojeBR.getUTCFullYear(), hojeBR.getUTCMonth(), hojeBR.getUTCDate() + k));
    const s = dia.toISOString().slice(0, 10);
    (a.horarios || []).forEach(hr => {
      if (Number(hr.dia) !== dia.getUTCDay() || pular.has(s)) return;
      const ini = brasilia(s, hr.hora); if (ini.getTime() + dur > agora.getTime()) out.push({ ini, fim: new Date(ini.getTime() + dur) });
    });
  }
  (a.avulsas || []).forEach(v => { if (!v) return; const [s, h] = v.split('T'); const ini = brasilia(s, h);
    if (ini.getTime() + dur > agora.getTime()) out.push({ ini, fim: new Date(ini.getTime() + dur), avulsa: true }); });
  out.sort((x, y) => x.ini - y.ini);
  return out.filter((v, i) => !i || v.ini.getTime() !== out[i - 1].ini.getTime()).slice(0, quantas);
}
export { ymd };
/* chave de uma aula: data e hora em Brasília, "2026-11-19T19:00" */
export const chave = d => new Date(d.getTime() - 3 * H).toISOString().slice(0, 16);
