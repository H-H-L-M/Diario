let entradas = [];
let editIndex = null;
function salvarEntrada() {
  const titulo = document.getElementById('titulo').value;
  const humor = document.getElementById('humor').value;
  const texto = document.getElementById('texto').value;
  const data = document.getElementById('data').value || new Date().toISOString().split("T")[0];

  if (editIndex !== null) {
    entradas[editIndex] = { titulo, humor, texto, data };
    editIndex = null;
  } else {
    entradas.unshift({ titulo, humor, texto, data });
  }

  renderizarEntradas();
}


function editarEntrada(index) {
  const entrada = entradas[index];

  document.getElementById('titulo').value = entrada.titulo;
  document.getElementById('humor').value = entrada.humor;
  document.getElementById('texto').value = entrada.texto;
  document.getElementById('data').value = entrada.data;

  editIndex = index;
}

function excluirEntrada() {
  if (entradas.length === 0) return;
  const firstEntry = document.querySelector('.preview .entry');
  if (firstEntry) {
    firstEntry.classList.add('fade-out');
    setTimeout(() => {
      entradas.shift();
      renderizarEntradas();
    }, 450);
  } else {
    entradas.shift();
    renderizarEntradas();
  }
}

function exportarEntradas() {
  const blob = new Blob([JSON.stringify(entradas, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'diario.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importarEntradas() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (Array.isArray(parsed)) entradas = parsed;
        else entradas = [parsed];
        renderizarEntradas();
      } catch (err) {
        alert('Arquivo inválido');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function renderizarEntradas() {
  const preview = document.getElementById('preview');
  preview.innerHTML = '<h3>Pré-visualização</h3>';

  const termo = (document.getElementById('pesquisa').value || '').toLowerCase();
  const filtro = document.getElementById('filtroHumor').value;
  const ordem = document.getElementById('ordem').value;

  let filtradas = entradas.filter(e =>
    (filtro === 'Todos' || e.humor === filtro) &&
    (e.titulo.toLowerCase().includes(termo) || e.texto.toLowerCase().includes(termo))
  );

  if (ordem === 'Titulo') filtradas.sort((a,b) => a.titulo.localeCompare(b.titulo));
  else filtradas.sort((a,b) => {
    const da = a.data.split('/').reverse().join('-');
    const db = b.data.split('/').reverse().join('-');
    return new Date(db) - new Date(da);
  });

  filtradas.forEach(e => {
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `
      <span class='entry-date'>${e.data}</span>
      <div class='entry-title'>${escapeHtml(e.titulo)}</div>
      <div class='entry-text'>${escapeHtml(e.texto)}</div>
    `;
    preview.appendChild(div);
  });
  div.innerHTML = `
  <span class='entry-date'>${formatarData(e.data)}</span>
  <div class='entry-title'> ${e.titulo}</div>
  <div>${e.texto}</div>

  <button class="editar-btn" onclick="editarEntrada(${entradas.indexOf(e)})">Editar</button>
`;
}
function formatarData(dataISO) {
  const p = dataISO.split("-");
  return `${p[2]}/${p[1]}/${p[0]}`;
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/\'/g, "&#039;");
}

entradas = [{
  titulo: 'O que eu estou pensando?',
  humor: 'Neutro',
  texto: 'Escreve...',
  data: ''
}];

renderizarEntradas();
