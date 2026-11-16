/* ===== Supabase (as chaves vêm do index.html) ===== */
const configurado = typeof SUPABASE_URL !== "undefined" && !SUPABASE_URL.startsWith("COLE");
const sb = configurado ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const $ = id => document.getElementById(id);

/* ===== Login ===== */
let criando = false;

function aviso(texto, erro) {
    $("authMsg").textContent = texto;
    $("authMsg").className = "msg" + (erro ? " erro" : "");
}

$("btnToggle").addEventListener("click", () => {
    criando = !criando;
    $("authTitulo").textContent = criando ? "Criar conta" : "Entrar";
    $("btnAuth").textContent = criando ? "Criar conta" : "Entrar";
    $("btnToggle").textContent = criando ? "Já tenho conta" : "Criar conta";
    aviso("");
});

async function autenticar() {
    if (!sb) return aviso("Preencha SUPABASE_URL e SUPABASE_KEY no index.html.", true);
    const email = $("email").value.trim();
    const password = $("senha").value;
    if (!email || !password) return aviso("Informe e-mail e senha.", true);
    const { error } = criando
        ? await sb.auth.signUp({ email, password })
        : await sb.auth.signInWithPassword({ email, password });
    if (error) return aviso(error.message, true);
    aviso(criando ? "Conta criada. Se o projeto exigir, confirme pelo e-mail." : "");
}
$("btnAuth").addEventListener("click", autenticar);
$("senha").addEventListener("keydown", e => { if (e.key === "Enter") autenticar(); });
$("btnLogout").addEventListener("click", () => sb && sb.auth.signOut());

function mostrarApp(session) {
    $("authView").classList.toggle("hidden", !!session);
    $("appView").classList.toggle("hidden", !session);
}
mostrarApp(null);
if (sb) {
    sb.auth.getSession().then(({ data }) => mostrarApp(data.session));
    sb.auth.onAuthStateChange((_evento, session) => mostrarApp(session));
}

/* ===== Navegação entre as telas ===== */
const telas = ["avaliacao", "rankings", "simulador"];

function mostrarTela() {
    const atual = telas.includes(location.hash.slice(1)) ? location.hash.slice(1) : telas[0];
    telas.forEach(t => $("view-" + t).classList.toggle("hidden", t !== atual));
    document.querySelectorAll(".tabbar a").forEach(a => {
        a.classList.toggle("active", a.dataset.view === atual);
    });
}
window.addEventListener("hashchange", mostrarTela);
mostrarTela();

/* ===== Upload: mostra o nome do arquivo ===== */
$("arquivo").addEventListener("change", e => {
    const f = e.target.files[0];
    $("nomeArquivo").textContent = f ? f.name : "Nenhum arquivo selecionado";
    $("btnAvaliar").disabled = !f;
});
