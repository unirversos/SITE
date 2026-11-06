/* Roteiros das chamadas de vídeo (prova de cada mapa). Um roteiro por território.
   turno: { say (voz), kana (legenda), ro (romaji), tr (tradução), kws (palavras que valem, "a|b|c" = alternativas),
            model/modelRo (resposta de exemplo), opts (frases para escolher se o microfone falhar; a 1ª é a certa) }
   Só entra vocabulário que a aula do mapa ensina. */
window.CHAMADAS = {
  aeroporto: {
    slug: 'aeroporto',
    quem: 'Oficial da imigração',
    abre: { say: 'こんにちは。', kana: 'こんにちは。', ro: 'Konnichiwa.', tr: 'Boa tarde.' },
    turnos: [
      { say: '目的は何ですか。', kana: 'もくてきは なんですか。', ro: 'Mokuteki wa nan desu ka.', tr: 'Qual é o motivo da viagem?',
        kws: ['かんこう|観光|kankou|kankō', 'しごと|仕事|shigoto', 'りょこう|旅行|ryokou'],
        model: 'かんこうです。', modelRo: 'Kankou desu.', opts: ['かんこうです。', 'パスポートです。', 'ふたつです。'] },
      { say: '目的地はどこですか。', kana: 'もくてきちは どこですか。', ro: 'Mokutekichi wa doko desu ka.', tr: 'Qual é o seu destino?',
        kws: ['とうきょう|東京|toukyou|tōkyō|tokyo', 'おおさか|大阪|oosaka|osaka', 'きょうと|京都|kyouto|kyoto'],
        model: 'とうきょうです。', modelRo: 'Tōkyō desu.', opts: ['とうきょうです。', 'かんこうです。', 'ふたつです。'] },
      { say: 'ご予約はございますか。', kana: 'ごよやくは ございますか。', ro: 'Go-yoyaku wa gozaimasu ka.', tr: 'Tem reserva?',
        kws: ['あります|有ります|arimasu', 'よやく|予約|yoyaku', 'はい|hai'],
        model: 'はい、よやくが あります。', modelRo: 'Hai, yoyaku ga arimasu.', opts: ['はい、よやくが あります。', 'とうきょうです。', 'かんこうです。'] },
      { say: '荷物はいくつですか。', kana: 'にもつは いくつですか。', ro: 'Nimotsu wa ikutsu desu ka.', tr: 'Quantas bagagens?',
        kws: ['ひとつ|一つ|hitotsu', 'ふたつ|二つ|futatsu', 'みっつ|三つ|mittsu', 'よっつ|四つ|yottsu'],
        model: 'ふたつです。', modelRo: 'Futatsu desu.', opts: ['ふたつです。', 'とうきょうです。', 'かんこうです。'] }
    ],
    fim: { say: 'ありがとうございます。ようこそ日本へ。', kana: 'ありがとうございます。ようこそ にほんへ。', ro: 'Arigatou gozaimasu. Youkoso Nihon e.', tr: 'Obrigado. Bem-vindo(a) ao Japão!' }
  }
};
