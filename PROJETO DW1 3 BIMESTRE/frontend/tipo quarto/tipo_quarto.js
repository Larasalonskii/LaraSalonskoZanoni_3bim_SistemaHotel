const URL_API = 'http://localhost:3001';
const SKELETON_URL = `${URL_API}/imagens/tipos/skeleton.svg`;
const SILHUETA_URL = `${URL_API}/imagens/tipos/silhueta.png`;

let oQueEstaFazendo = '';
bloquearAtributos(true);

function inicializar() {
    listar();
    mostrarImagem(null);       // mostra a silhueta ao abrir
}

// Mostra a foto do tipo (ou a silhueta se não tiver foto)
function mostrarImagem(id) {
    const img = document.getElementById('imgTipo');
    if (!id) { img.src = SILHUETA_URL; return; }

    img.src = SKELETON_URL;
    const temp = new Image();
    temp.onload = () => { img.src = temp.src; };
    temp.onerror = () => { img.src = SILHUETA_URL; };
    temp.src = `${URL_API}/imagens/tipos/tipo_${id}.png?t=${Date.now()}`;
}

function acionarUpload() {
    if (oQueEstaFazendo !== 'inserindo' && oQueEstaFazendo !== 'alterando') {
        mostrarAviso("Clique em Inserir ou Alterar primeiro para escolher uma imagem.");
        return;
    }
    document.getElementById('inputImagem').click();
}

function previewImagem() {
    const arquivos = document.getElementById('inputImagem').files;
    if (arquivos.length > 0) {
        document.getElementById('imgTipo').src = URL.createObjectURL(arquivos[0]);
        mostrarAviso("Imagem escolhida! Clique em Salvar para concluir.");
    }
}

async function uploadImagem(id) {
    const arquivos = document.getElementById('inputImagem').files;
    if (arquivos.length === 0) return;

    const formData = new FormData();
    formData.append('imagem', arquivos[0]);
    try {
        const resposta = await fetch(`${URL_API}/tipo_quarto/upload/${id}`, { method: 'POST', body: formData });
        const data = await resposta.json();
        if (!data.sucesso) console.error("Falha no upload:", data.mensagem);
    } catch (erro) {
        console.error("Erro no upload:", erro);
    }
}

async function procure() {
    const id = document.getElementById("inputId_tipo_quarto").value;
    if (id === "" || !Number.isInteger(Number(id))) {
        mostrarAviso("Precisa ser um número inteiro");
        return;
    }
    oQueEstaFazendo = '';

    try {
        const resposta = await fetch(`${URL_API}/tipo_quarto/${id}`);
        const data = await resposta.json();

        if (data.sucesso) {
            document.getElementById("inputNome_tipo_quarto").value = data.tipo.tipo_quarto_nome;
            mostrarImagem(id);
            visibilidadeDosBotoes('inline', 'none', 'inline', 'inline', 'none');
            mostrarAviso("Achou no banco, pode alterar ou excluir");
        } else {
            limparAtributos();
            visibilidadeDosBotoes('inline', 'inline', 'none', 'none', 'none');
            mostrarAviso("Não achou no banco, pode inserir");
        }
    } catch (erro) {
        mostrarAviso("Erro ao conectar com o servidor.");
    }
}

function inserir() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'inserindo';
    mostrarAviso("INSERINDO - Digite o nome, escolha a foto e clique em salvar");
}

function alterar() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'alterando';
    mostrarAviso("ALTERANDO - Mude o nome ou a foto e clique em salvar");
}

function excluir() {
    bloquearAtributos(true);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'excluindo';
    mostrarAviso("EXCLUINDO - Clique em salvar para confirmar a exclusão");
}

async function salvar() {
    const id = document.getElementById("inputId_tipo_quarto").value;
    const nome = document.getElementById("inputNome_tipo_quarto").value;
    const cabecalho = { 'Content-Type': 'application/json' };
    const dados = JSON.stringify({ tipo_quarto_id: id, tipo_quarto_nome: nome });

    try {
        let resposta;
        if (oQueEstaFazendo === 'inserindo') {
            resposta = await fetch(`${URL_API}/tipo_quarto`, { method: 'POST', headers: cabecalho, body: dados });
        } else if (oQueEstaFazendo === 'alterando') {
            resposta = await fetch(`${URL_API}/tipo_quarto/${id}`, { method: 'PUT', headers: cabecalho, body: dados });
        } else if (oQueEstaFazendo === 'excluindo') {
            resposta = await fetch(`${URL_API}/tipo_quarto/${id}`, { method: 'DELETE' });
        }

        const data = await resposta.json();
        if (!data.sucesso) {
            mostrarAviso(data.mensagem || "Erro ao efetuar operação.");
            return;
        }

        if (oQueEstaFazendo !== 'excluindo') await uploadImagem(id);

        mostrarAviso("Operação realizada com sucesso!");
        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById("inputId_tipo_quarto").value = "";
        listar();
    } catch (erro) {
        mostrarAviso("Erro ao efetuar operação no servidor.");
    }
}

async function listar() {
    const corpo = document.getElementById("tabelaCorpo");
    try {
        const resposta = await fetch(`${URL_API}/tipo_quarto/listar`);
        const data = await resposta.json();

        if (!data.sucesso) {
            mostrarLinhaVazia(corpo, 3, data.mensagem || "Erro ao listar tipos.");
            return;
        }

        atualizarContador(data.unidades.length);
        if (data.unidades.length === 0) {
            mostrarLinhaVazia(corpo, 3, "Nenhum tipo cadastrado.");
            return;
        }

        corpo.innerHTML = '';
        data.unidades.forEach(t => {
            const tr = document.createElement('tr');

            const tdId = document.createElement('td');
            tdId.appendChild(criarBotaoId(t.tipo_quarto_id, selecionarTipo));

            const tdNome = document.createElement('td');
            tdNome.textContent = t.tipo_quarto_nome ?? '';

            const tdFoto = document.createElement('td');
            const foto = document.createElement('img');
            foto.className = 'miniatura';
            foto.loading = 'lazy';
            foto.alt = t.tipo_quarto_nome ?? 'Foto do tipo';
            foto.onerror = () => { foto.onerror = null; foto.src = SILHUETA_URL; };
            foto.src = `${URL_API}/imagens/tipos/tipo_${t.tipo_quarto_id}.png?t=${Date.now()}`;
            tdFoto.appendChild(foto);

            tr.append(tdId, tdNome, tdFoto);
            corpo.appendChild(tr);
        });
    } catch (erro) {
        mostrarLinhaVazia(corpo, 3, "Servidor offline.");
    }
}

// Clicou no ID da tabela: volta para o cadastro e carrega o registro
async function selecionarTipo(id) {
    mostrarAba('cadastro');
    document.getElementById("inputId_tipo_quarto").value = id;
    await procure();
}

function cancelarOperacao() {
    limparAtributos();
    visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
    mostrarAviso("Cancelou a operação");
}

function mostrarAviso(mensagem) {
    document.getElementById("divAviso").innerHTML = mensagem;
}

function limparAtributos() {
    oQueEstaFazendo = '';
    document.getElementById("inputNome_tipo_quarto").value = "";
    document.getElementById("inputImagem").value = "";
    mostrarImagem(null);
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    document.getElementById("inputId_tipo_quarto").readOnly = !soLeitura;
    document.getElementById("inputNome_tipo_quarto").readOnly = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
}

document.getElementById('imgTipo').addEventListener('click', acionarUpload);


// ===== Abas (Cadastro / Lista) =====
function mostrarAba(nome) {
    const ehCadastro = nome === 'cadastro';

    document.querySelector('.abas').dataset.ativa = nome;
    document.getElementById('painelCadastro').hidden = !ehCadastro;
    document.getElementById('painelLista').hidden = ehCadastro;

    const abaCadastro = document.getElementById('abaCadastro');
    const abaLista = document.getElementById('abaLista');

    abaCadastro.classList.toggle('ativa', ehCadastro);
    abaLista.classList.toggle('ativa', !ehCadastro);
    abaCadastro.setAttribute('aria-selected', ehCadastro);
    abaLista.setAttribute('aria-selected', !ehCadastro);
}

document.querySelectorAll('.aba').forEach(botao => {
    botao.addEventListener('click', () => mostrarAba(botao.dataset.aba));
});

// ===== Auxiliares da tabela =====
function atualizarContador(quantidade) {
    document.getElementById('contador').textContent = quantidade;
}

function mostrarLinhaVazia(corpo, colunas, texto) {
    corpo.innerHTML = '';
    const tr = document.createElement('tr');
    tr.className = 'linha-vazia';
    const td = document.createElement('td');
    td.colSpan = colunas;
    td.textContent = texto;
    tr.appendChild(td);
    corpo.appendChild(tr);
}

function criarBotaoId(id, aoClicar) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn-id';
    botao.textContent = id;
    botao.title = 'Abrir no cadastro';
    botao.addEventListener('click', () => aoClicar(id));
    return botao;
}