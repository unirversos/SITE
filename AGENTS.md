# Combinados para quem mexe neste site (unirversos.com)

Vale para qualquer IA ou pessoa que trabalhe neste repositório (Claude, Antigravity, Neon…).
Leia antes de começar qualquer tarefa.

## 1. A versão certa é a do GitHub
- Antes de começar, rode `git pull` e confira que a pasta está igual ao `origin/main`.
- Se a pasta tiver arquivos alterados que não são da sua tarefa, **pare e avise a Aline**. Não descarte, não junte e não suba esses arquivos.
- Nunca trabalhe em cima de um ZIP ou de uma cópia antiga do site.

## 2. Quem cuida de quê
| Área | Quem mexe |
|---|---|
| `travessia/` (calendário, ingressos, deslocamento, guia, navi, burocracia) | Antigravity |
| `idiomas/`, `aulas/`, `aluno/`, galeria de atividades, Biblioteca livre | Claude |
| Regras e dados do Firebase | Claude, só com o ok da Aline |

**Arquivos compartilhados** (usados pelo site inteiro): `bau-flutuante.js`, `caderno-*.js`, `idiomas/dados/conta.js`, `voltar-global.js`, `menu-ativo.js`, `app.js`, `estilo-celular.css`, `tema-unirversos.css`, `sw.js`, `manifest.webmanifest`.
Só um mexe por vez, e a Aline avisa o outro antes.

## 3. Como publicar
- **Antigravity:** trabalha e salva só no computador da Aline. **Sem commit, sem pull, sem push.** Quando terminar, liste os arquivos que mudou e avise a Aline.
- **Claude:** pega só esses arquivos, confere (erros, links, celular), mostra para a Aline e publica com o ok dela. Depois devolve a versão publicada para a pasta local.
- Nada vai para o ar sem a Aline dizer "ok" ou "pode publicar".
- O app instalável (PWA) já está no ar (desde 24/11/2026). Mexer nele segue as mesmas regras: `sw.js` e `manifest.webmanifest` são arquivos compartilhados (seção 2), então só um mexe por vez, passa pela área de teste e só sobe com o ok da Aline.

## 4. Área de teste antes do oficial
- Mudanças grandes vão primeiro para uma cópia dentro de uma pasta `teste/` (ex.: `idiomas/teste/…`, `travessia/teste/…`), com `<meta name="robots" content="noindex">`.
- A página oficial só é trocada depois que a Aline aprovar ("troca").

## 5. Cuidados técnicos
- **Firebase grátis tem limite diário** (20 mil gravações). Nunca grave no Firestore em resposta a uma leitura ou a um `onSnapshot`: isso já fez dois navegadores regravarem um ao outro sem parar.
- Ao mudar um `.js` ou `.css`, aumente o `?v=` onde ele é carregado, para o navegador pegar a versão nova.
- Não quebre os dados guardados no aparelho das pessoas (chaves do `localStorage`, como `uniCalendario1`): ao mudar um formato, leia o antigo também.
- Visual: minimalista, fundo claro, cards com borda lateral colorida, sem pixel art. Textos em português do Brasil, simples e diretos.

## 6. Uma tarefa por vez
Não peça a mesma tarefa a duas IAs ao mesmo tempo: uma desfaz a outra.

## 7. Navegador e contas (regra da Aline)
- Para abrir o Firebase, o GitHub ou qualquer site em nome da Aline, **use sempre o navegador embutido do app Claude**, na conta **UnirVersos Idiomas** (unirversos.idiomas@gmail.com).
- **Nunca** use o Chrome da Aline, nem a conta li.kikuti@gmail.com, nem a conta da SENSU.
- O acesso a todos os serviços do site (Firebase, projeto `unirversos-site`, Google Drive, GitHub etc.) é sempre pela conta **unirversos.idiomas@gmail.com**. É nela que a arquitetura do site é gerenciada. Então não diga que "não tem acesso" antes de tentar abrir o serviço no navegador embutido, já logado nessa conta.
- Se o serviço realmente não abrir (sessão deslogada, pedido de senha ou de código), pare e avise a Aline. Não troque de conta por conta própria.
- No Firebase, só **leia**; qualquer mudança de regras ou dados só com o ok da Aline (ver seção 2).
- Nunca digite senhas nem coloque chaves ou acessos do Firebase no repositório (ele é público). Se faltar acesso, peça para a Aline colar o texto aqui.

## 8. Anotações da Aline (vault do Obsidian)
- As anotações dos projetos ficam num vault do Obsidian no Google Drive da conta unirversos.idiomas@gmail.com (pasta `Obsidian › QG DAKIKUTI`). As notas do site ficam em `10 - Projetos › 11 - UNIRVERSOS`.
- Uma nota é uma foto do que já sincronizou e pode estar velha. **O que a Aline disser na conversa vale mais que a nota.** Se a nota e a conversa se contradisserem, avise a Aline e deixe ela escolher.
- Só escreva ou altere notas quando a Aline pedir (por exemplo, "vira nota"), usando as palavras dela.
- Quem não tiver acesso ao Drive não deve procurar outro jeito: peça para a Aline colar o texto da nota aqui.
- O conteúdo pessoal das notas nunca vai para este repositório (ele é público).
