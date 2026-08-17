# 📦 UNIRVERSOS - ARQUIVOS COMPLETOS

## ⚠️ IMPORTANTE: LEIA ANTES DE COPIAR

Este ZIP contém **TODOS** os arquivos que você precisa. A estrutura é:

```
unirversos-completo/
├── index.html (RAIZ - landing page)
├── idiomas/
│   └── guia/
│       └── index.html (Guia de Sobrevivência)
└── memorias/
    ├── index.html (Revista de Memórias)
    └── seu-album.html (Álbum Personalizado)
```

---

## 🚀 COMO USAR (PASSO A PASSO)

### **PASSO 1: Extrair o ZIP**
```bash
unzip unirversos-completo.zip
cd unirversos-completo
```

### **PASSO 2: Copiar para seu repositório**

**OPÇÃO A (Se você quer SUBSTITUIR tudo no seu repo):**
```bash
# Delete tudo e copia dos arquivos novos
rm -rf seu-repo/*
cp -r unirversos-completo/* seu-repo/
cd seu-repo
```

**OPÇÃO B (Se você quer MANTER outras coisas no repo):**
```bash
# Copia só as pastas que precisam atualizar
cp unirversos-completo/index.html seu-repo/
cp -r unirversos-completo/idiomas/ seu-repo/
cp -r unirversos-completo/memorias/ seu-repo/
cd seu-repo
```

### **PASSO 3: Fazer commit e push**
```bash
git add index.html idiomas/ memorias/
git commit -m "Landing finalizada + Memórias completo"
git push origin main
```

### **PASSO 4: Aguardar o deploy**
- GitHub Pages leva **1-5 minutos**
- Depois acessa: `https://unirversos.com/`
- Se não atualizar, faz **Ctrl+Shift+R** (hard refresh)

---

## 📋 O QUE TEM EM CADA ARQUIVO

### **1. index.html** (Landing Page)
- ✅ Hero: "Japão sem perrengue..."
- ✅ Seção "O que você ganha"
- ✅ Grid 2x2 com 4 fases
- ✅ FASE 3: "Eternize suas memórias" (aponta pra /memorias/)
- ✅ CTA com Formspree integrado
- ✅ Captura de emails funcional

**URL:** `https://unirversos.com/`

---

### **2. idiomas/guia/index.html** (Guia de Sobrevivência)
- ✅ Frases essenciais
- ✅ Números e contagem
- ✅ Emergências
- ✅ Dicas práticas
- ✅ Design responsivo

**URL:** `https://unirversos.com/idiomas/guia/`

---

### **3. memorias/index.html** (Revista de Memórias)
- ✅ Como funciona (3 passos)
- ✅ O que torna especial (3 features)
- ✅ Tabela comparativa de planos
- ✅ FAQ interativo
- ✅ CTA levando pra /memorias/seu-album/

**URL:** `https://unirversos.com/memorias/`

---

### **4. memorias/seu-album.html** (Álbum Personalizado)
- ✅ Upload de fotos (drag & drop)
- ✅ Customização (formato, páginas, guias)
- ✅ Preview do álbum
- ✅ Integrado com Formspree
- ✅ Envia dados pra seu email

**URL:** `https://unirversos.com/memorias/seu-album/`

---

## ✅ VERIFICAÇÃO

Depois que fazer push, verifique:

### **Landing Page**
- [ ] `https://unirversos.com/` carrega
- [ ] Vê o novo hero ("Japão sem perrengue")
- [ ] Grid 2x2 das 4 fases
- [ ] FASE 3 diz "Eternize suas memórias"
- [ ] Botão "Quero aprender" funciona

### **Guia de Sobrevivência**
- [ ] `https://unirversos.com/idiomas/guia/` carrega
- [ ] Mostra frases, números, emergências
- [ ] Design está ok

### **Memórias**
- [ ] `https://unirversos.com/memorias/` carrega
- [ ] Mostra 3 passos + features + FAQ
- [ ] Botão "Começar a Montar" funciona
- [ ] `https://unirversos.com/memorias/seu-album/` funciona
- [ ] Upload de fotos funciona

### **Formspree**
- [ ] Deixa um email na landing
- [ ] **Você recebe no Gmail** (unirversos.idiomas@gmail.com)
- [ ] Upload de fotos no álbum envia email

---

## 🔧 TROUBLESHOOTING

### **"Página não carrega"**
1. Tira um hard refresh: `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
2. Abre em navegador anônimo (Ctrl+Shift+N)
3. Aguarda 3-5 minutos (GitHub leva tempo)

### **"Landing mostra página antiga"**
1. Tira o cache: `Ctrl+Shift+Delete` → Limpar dados navegação
2. Hard refresh
3. Tenta em navegador diferente

### **"Formspree não envia email"**
1. Verifica se o email está correto (unirversos.idiomas@gmail.com)
2. Tira a aba anônima (às vezes Formspree bloqueia)
3. Verifica spam/lixo no Gmail

---

## 📞 CONTATO

Se algo não funcionar:
- Verifica a URL no browser (deve ser https://unirversos.com/)
- Faz hard refresh
- Tenta em outro navegador
- Se ainda não funcionar, me avisa!

---

## 🎯 PRÓXIMAS AÇÕES

Depois que tudo estiver live:

1. **Divulga nos grupos** (Facebook, Reddit, Discord)
2. **Coleta emails** (primeira semana)
3. **Faz calls de validação** (com as 10-15 primeiras pessoas)
4. **Ajusta baseado em feedback**

---

**BOA SORTE! 🚀**
