# unirversos.com — pasta pronta para Netlify

## Como publicar
1. Acesse https://app.netlify.com (crie uma conta grátis se não tiver)
2. Arraste esta pasta inteira (ou o arquivo .zip) na área "Deploy manually" / "Drag and drop"
3. Netlify gera uma URL tipo nome-aleatorio.netlify.app — o site já está no ar
4. Em "Domain settings" → "Add a domain", coloque unirversos.com
5. Netlify mostra os registros DNS para configurar no Porkbun/Namecheap (geralmente um registro A e um CNAME para "www")
6. Depois de propagar (minutos a poucas horas), unirversos.com aponta para este site

## Estrutura
- /index.html            → homepage
- /idiomas/               → página Unirversos Idiomas
- /idiomas/mapas/         → mapas de contexto (japonês, inglês, português)
- /idiomas/planeta-utopia/→ livro-jogo RPG, missão 1
- /memorias/              → placeholder (página ainda não construída)
- /memorias/guia-sobrevivencia/ → mini guia de sobrevivência Japão

## Pendências antes de considerar "pronto"
- Trocar o link "Falar com a Aline" (wa.me/) pelo seu número de WhatsApp real
- unirversos.idiomas@gmail.com já está linkado no botão "aula zero" — confirme se é o e-mail certo
- Construir de verdade: /memorias/ (revista + app), /paralelos/ (canal), /sobre/
- Trocar placeholders "(em breve)" quando o canal Paralelos existir
