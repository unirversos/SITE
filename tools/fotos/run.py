"""Lê pedidos.json e grava o resultado em saida/. Modos:
raw: salva o texto da página (cortado); shopify: resumo de /products.json; img: baixa a imagem; og: só título e og:image."""
import json, os, re, urllib.request, urllib.parse
B = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(B, 'saida'); os.makedirs(os.path.join(S, 'img'), exist_ok=True)
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
def get(url, lim=6_000_000):
    u = urllib.parse.quote(url, safe=':/?&=%#+,;@~!$\'()*')
    r = urllib.request.Request(u, headers={'User-Agent': UA, 'Accept-Language': 'ja,en;q=0.8', 'Accept': '*/*'})
    with urllib.request.urlopen(r, timeout=40) as f:
        return f.read(lim), f.headers.get('Content-Type', ''), f.geturl()
log = []
for p in json.load(open(os.path.join(B, 'pedidos.json'), encoding='utf-8')):
    pid, url, modo = p['id'], p['url'], p.get('modo', 'raw')
    try:
        data, ct, final = get(url)
        if modo == 'img':
            if not ct.startswith('image/'): raise ValueError('não é imagem: ' + ct)
            ext = {'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif'}.get(ct.split(';')[0], 'bin')
            open(os.path.join(S, 'img', pid + '.' + ext), 'wb').write(data); log.append([pid, 'ok', len(data), ct]); continue
        t = data.decode('utf-8', 'replace')
        if modo == 'shopify':
            out = [{'t': x.get('title'), 'h': x.get('handle'), 'img': [i.get('src') for i in x.get('images', [])[:3]]} for x in json.loads(t).get('products', [])]
            t = json.dumps(out, ensure_ascii=False, indent=0)
        elif modo == 'og':
            m = lambda k: (re.search(r'<meta[^>]+(?:property|name)=["\']' + k + r'["\'][^>]+content=["\']([^"\']+)', t) or re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:property|name)=["\']' + k + '["\']', t) or [None, ''])[1]
            tt = re.search(r'<title[^>]*>(.*?)</title>', t, re.S)
            t = json.dumps({'final': final, 'title': (tt.group(1).strip() if tt else ''), 'og:image': m('og:image'), 'og:title': m('og:title')}, ensure_ascii=False)
        elif modo == 'links':
            pat = p.get('filtro', '')
            L = sorted(set(x for x in re.findall(r'(?:href|src|data-src|content)=["\']([^"\']+)["\']', t) + re.findall(r'<loc>([^<]+)</loc>', t) if re.search(pat, x, re.I)))
            t = final + '\n' + '\n'.join(L[:1500])
        open(os.path.join(S, pid + '.txt'), 'w', encoding='utf-8').write(t[:int(p.get('max', 300000))]); log.append([pid, 'ok', len(data), ct, final])
    except Exception as e:
        log.append([pid, 'ERRO', str(e)[:200]])
open(os.path.join(S, '_log.json'), 'w', encoding='utf-8').write(json.dumps(log, ensure_ascii=False, indent=0))
