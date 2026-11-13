/* Unirversos · Área do aluno em português ou inglês.
   UniL.t('chave', {variáveis}) devolve o texto; elementos com data-i="chave" são preenchidos por UniL.aplica(). */
(function () {
  var K = 'uniAreaLang', L = null;
  try { L = localStorage.getItem(K); } catch (e) {}
  if (L !== 'pt' && L !== 'en') L = /^pt/i.test(navigator.language || 'pt') ? 'pt' : 'en';
  var D = {
    pt: {
      area: 'área do aluno', ola: 'Olá, ', sair: 'sair', nv: 'Nv.', editarAvatar: 'editar avatar', semAvatar: 'Você ainda não tem avatar.', criarAvatar: 'Criar no Ateliê →',
      continuar: 'continuar de onde parou', btnContinuar: 'Continuar →', verTrilha: 'Ver a trilha →', mapa: 'Mapa', prova: 'Prova do mapa', provaDesc: 'Ganhe o carimbo no passaporte do Planeta Utopia.',
      completa: 'Trilha completa!', completaDesc: 'Você fez os 12 mapas. Que tal revisar um deles?', feitos: '{n} de {t} mapas da trilha de japonês concluídos (aula + prova)',
      caderno: 'caderno', cadNova: '+ Nova anotação', cadAbrir: 'Abrir caderno →', cadVazio: 'Seu caderno está em branco. Escreva com o teclado ou desenhe com a caneta.', cadPag: 'páginas', cadSem: 'Sem título',
      atalhos: 'Atalhos', palavras: 'Minhas palavras', calendario: 'Calendário', mural: 'Mural', temaSemana: 'Tema da semana: “{t}”',
      conta: 'sua conta', entrou: 'Você entrou com {e}', privacidade: 'Como cuidamos dos seus dados', sairConta: 'Sair da conta',
      aulaPart: 'aula particular', proxima: 'próxima aula', agora: 'acontecendo agora', semAula: 'Nenhuma aula marcada', semAulaDesc: 'Quando a Aline marcar a próxima, ela aparece aqui.',
      entrar: 'Entrar na aula', abreMeet: 'A sala abre no Google Meet. Se pedir para entrar, a Aline aprova.', semLink: 'A Aline ainda não colocou o link da sala. Fale com ela.',
      faltam: 'Faltam {f}. O botão ficará ativo 15 minutos antes da aula.', emBrasilia: 'em Brasília', dia: 'dia', dias: 'dias', e: 'e',
      pedirGrav: 'Pedir gravação', gravPedida: 'Gravação pedida', gravDica: 'Só grava se você pedir, até o começo da aula. A aula inteira fica gravada.',
      recado: 'recado da Aline', tarefa: 'tarefa', feita: 'Marcada como feita. A Aline vê isso.', novo: 'novo', anotar: 'Anotar sobre esta aula no caderno', aulaDe: 'Aula de {d}',
      detalhes: 'Materiais, próximas aulas e remarcação', materiais: 'materiais', semMat: 'Os materiais das aulas vão aparecer aqui.', gravacoes: 'gravações', proximas: 'próximas aulas',
      toda: 'Toda {d} às {h}', horaBr: '(horário de Brasília)', depois: 'Depois da próxima:', avulsa: 'avulsa', semFixo: 'Sem horário fixo: as aulas são marcadas uma a uma.',
      regra: 'Remarcações só com pelo menos <b>12 horas de antecedência</b>. Com menos de 12 horas, a aula conta como cancelada.', remarcar: 'Precisa remarcar?', remarcarMsg: 'Oi, Aline! Preciso remarcar a aula de {q}.',
      novaAba: ' (abre em nova aba)', erroSalvar: 'Não consegui salvar agora. Tente de novo.',
      confirma: 'Tem aulas particulares com a Aline? Confirme o seu e-mail para elas aparecerem aqui.', mandar: 'Mandar link de confirmação', jaConf: 'Já confirmei',
      mandado: 'Pronto! Confira a sua caixa de entrada (e o spam).', naoMandou: 'Não consegui mandar agora. Tente de novo mais tarde.', aindaNao: 'Ainda não aparece como confirmado. Abra o link do e-mail e tente de novo.',
      semana: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
    },
    en: {
      area: 'student area', ola: 'Hi, ', sair: 'sign out', nv: 'Lv.', editarAvatar: 'edit avatar', semAvatar: 'You don’t have an avatar yet.', criarAvatar: 'Create one in the Atelier →',
      continuar: 'pick up where you left off', btnContinuar: 'Continue →', verTrilha: 'See the trail →', mapa: 'Map', prova: 'Test for map', provaDesc: 'Earn the stamp in your Planeta Utopia passport.',
      completa: 'Trail complete!', completaDesc: 'You finished all 12 maps. How about reviewing one?', feitos: '{n} of {t} maps of the Japanese trail completed (lesson + test)',
      caderno: 'notebook', cadNova: '+ New note', cadAbrir: 'Open notebook →', cadVazio: 'Your notebook is empty. Type or draw with a stylus.', cadPag: 'pages', cadSem: 'Untitled',
      atalhos: 'Shortcuts', palavras: 'My words', calendario: 'Calendar', mural: 'Community board', temaSemana: 'Theme of the week: “{t}”',
      conta: 'your account', entrou: 'Signed in as {e}', privacidade: 'How we look after your data', sairConta: 'Sign out',
      aulaPart: 'private lesson', proxima: 'next lesson', agora: 'happening now', semAula: 'No lesson scheduled', semAulaDesc: 'When Aline schedules the next one, it will show up here.',
      entrar: 'Join the lesson', abreMeet: 'The room opens in Google Meet. If it asks to join, Aline will let you in.', semLink: 'Aline hasn’t added the room link yet. Please talk to her.',
      faltam: 'Starts in {f}. The button becomes active 15 minutes before the lesson.', emBrasilia: 'Brasília time', dia: 'day', dias: 'days', e: 'and',
      pedirGrav: 'Ask for a recording', gravPedida: 'Recording requested', gravDica: 'Lessons are only recorded if you ask before they start. The whole lesson is recorded.',
      recado: 'note from Aline', tarefa: 'homework', feita: 'Marked as done. Aline can see this.', novo: 'new', anotar: 'Take notes about this lesson', aulaDe: 'Lesson of {d}',
      detalhes: 'Materials, upcoming lessons and rescheduling', materiais: 'materials', semMat: 'Lesson materials will show up here.', gravacoes: 'recordings', proximas: 'upcoming lessons',
      toda: 'Every {d} at {h}', horaBr: '(Brasília time)', depois: 'After the next one:', avulsa: 'one-off', semFixo: 'No fixed schedule: lessons are booked one at a time.',
      regra: 'Rescheduling needs at least <b>12 hours’ notice</b>. With less than 12 hours, the lesson counts as cancelled.', remarcar: 'Need to reschedule?', remarcarMsg: 'Hi, Aline! I need to reschedule the lesson of {q}.',
      novaAba: ' (opens in a new tab)', erroSalvar: 'Couldn’t save right now. Please try again.',
      confirma: 'Do you have private lessons with Aline? Confirm your e-mail to see them here.', mandar: 'Send confirmation link', jaConf: 'I’ve confirmed',
      mandado: 'Done! Check your inbox (and spam).', naoMandou: 'Couldn’t send it right now. Please try again later.', aindaNao: 'It doesn’t show as confirmed yet. Open the link in the e-mail and try again.',
      semana: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
  };
  function t(k, v) { var s = D[L][k]; if (s == null) s = D.pt[k]; if (typeof s !== 'string') return s; return s.replace(/\{(\w+)\}/g, function (m, n) { return v && v[n] != null ? v[n] : ''; }); }
  function aplica(raiz) {
    Array.prototype.forEach.call((raiz || document).querySelectorAll('[data-i]'), function (el) { el.textContent = t(el.getAttribute('data-i')); });
    document.documentElement.lang = L === 'pt' ? 'pt-BR' : 'en';
    Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === L)); });
  }
  function muda(l) { if (l === L) return; try { localStorage.setItem(K, l); } catch (e) {} location.reload(); }
  window.UniL = { lang: L, loc: L === 'pt' ? 'pt-BR' : 'en-US', t: t, aplica: aplica, muda: muda };
})();
