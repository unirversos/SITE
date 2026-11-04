/* Calendário da viagem · guardar na conta (Firebase)
   Usa o mesmo login do resto do site (idiomas/dados/conta.js) e grava no documento da própria pessoa,
   progress/{uid}, no campo "calendario". Se algo falhar, o calendário continua funcionando só no aparelho. */
import { auth, db, entrar } from "/idiomas/dados/conta.js";
import { doc, getDoc, setDoc, deleteField } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function ref() {
  const u = auth.currentUser;
  if (!u) throw new Error("sem login");
  return doc(db, "progress", u.uid);
}
window.CalNuvem = {
  entrar,
  async carregar() {
    const snap = await getDoc(ref());
    return snap.exists() ? (snap.data().calendario || null) : null;
  },
  async salvar(obj) {
    await setDoc(ref(), { calendario: obj, calendarioAtualizado: obj.atualizado || "" }, { merge: true });
  },
  /* link curto: guarda só o pacote do link em compartilhados/{codigo}. Quem tem o código lê; só quem está logado cria. */
  async criarCurto(token) {
    if (!auth.currentUser) throw new Error("sem login");
    const alf = "abcdefghijkmnpqrstuvwxyz23456789", r = crypto.getRandomValues(new Uint8Array(10));
    let cod = ""; for (const b of r) cod += alf[b % alf.length];
    await setDoc(doc(db, "compartilhados", cod), { t: token, criado: new Date().toISOString() });
    return cod;
  },
  async lerCurto(cod) {
    const snap = await getDoc(doc(db, "compartilhados", cod));
    return snap.exists() ? (snap.data().t || null) : null;
  },
  async apagar() {
    await setDoc(ref(), { calendario: deleteField(), calendarioAtualizado: deleteField() }, { merge: true });
  }
};
document.dispatchEvent(new CustomEvent("cal-nuvem-pronto"));
