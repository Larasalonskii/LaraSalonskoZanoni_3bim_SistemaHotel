const URL_API = 'http://localhost:3001';
const SKELETON_URL = `${URL_API}/imagens/tipos/skeleton.svg`;
const SILHUETA_URL = `${URL_API}/imagens/tipos/silhueta.png`;

let oQueEstaFazendo = '';
let quarto = null;
bloquearAtributos(true);

async function inicializar() {
    await carregarTipoQuarto();
    await listar();
    atualizarImagemDoTipo();   // mostra a silhueta ao abrir
}

async function carregarTipoQuarto() {
    const select = document.getElementById("selectId_tipo_quarto");
    try {
        const resposta = await fetch(`${URL_API}/tipo_quarto/listar`);
        const data = await resposta.json();
        if (data.sucesso) {
            select.innerHTML = '<option value="">-- Selecione um Tipo de Quarto --</option>';
            data.unidades.forEach(um => {
                select.innerHTML += `<option value="${um.tipo_quarto_id}">${um.tipo_quarto_id} - ${um.tipo_quarto_nome}</option>`;
            });
        }
    } catch (erro) {
        select.innerHTML = '<option value="">Erro ao carregar os tipos</option>';
    }
}

// Mostra a foto do tipo selecionado (somente visualização)
function atualizarImagemDoTipo() {
    const selectTipo = document.getElementById('selectId_tipo_quarto');
    const img = document.querySelector('.form-direita .img-container img');
    const idTipo = selectTipo.value;

    if (!idTipo) {
        img.src = SILHUETA_URL;
        img.removeAttribute('data-src');
        img.alt = 'Selecione um tipo de quarto';
        return;
    }

    const caminhoImagemReal = `${URL_API}/imagens/tipos/tipo_${idTipo}.png?t=${Date.now()}`;
    const nomeTipo = selectTipo.options[selectTipo.selectedIndex].text;

    img.id = `quarto-tipo-${idTipo}`;
    img.alt = `${nomeTipo} - Vibe Rosa`;

    // 1. Mostra o skeleton enquanto carrega
    img.src = SKELETON_URL;

    // 2. Guarda o caminho real e dispara o carregamento
    img.setAttribute('data-src', caminhoImagemReal);
    carregarImagemReal(img);
}

// Troca o skeleton pela imagem real (ou pela silhueta se não existir)
function carregarImagemReal(img) {
    const imagemReal = img.getAttribute('data-src');
    if (!imagemReal) return;

    const tempImg = new Image();

    tempImg.onload = () => {
        img.src = imagemReal;
        img.classList.add('loaded');
    };

    tempImg.onerror = () => {
        console.error(`❌ Erro ao carregar imagem real: ${imagemReal}`);
        img.src = SILHUETA_URL;
    };

    // O src vem DEPOIS de definir onload/onerror
    tempImg.src = imagemReal;
}

async function procurePorChavePrimaria(chave) {
    try {
        const resposta = await fetch(`${URL_API}/quarto/${chave}`);
        const data = await resposta.json();
        return data.sucesso ? data.quarto : null;
    } catch (erro) {
        return null;
    }
}

async function procure() {
    const id_quarto = document.getElementById("inputId_quarto").value;
    if (isNaN(id_quarto) || !Number.isInteger(Number(id_quarto)) || id_quarto === "") {
        mostrarAviso("Precisa ser um número inteiro");
        return;
    }

    quarto = await procurePorChavePrimaria(id_quarto);
    oQueEstaFazendo = '';

    if (quarto) {
        mostrarDadosQuarto(quarto);
        visibilidadeDosBotoes('inline', 'none', 'inline', 'inline', 'none');
        mostrarAviso("Achou no banco, pode alterar ou excluir");
    } else {
        limparAtributos();
        visibilidadeDosBotoes('inline', 'inline', 'none', 'none', 'none');
        mostrarAviso("Não achou no banco, pode inserir");
    }
}

function inserir() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'inserindo';
    mostrarAviso("INSERINDO - Digite a capacidade, escolha o tipo e clique em salvar");
}

function alterar() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'alterando';
    mostrarAviso("ALTERANDO - Altere os atributos e clique em salvar");
}

function excluir() {
    bloquearAtributos(true);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'excluindo';
    mostrarAviso("EXCLUINDO - Clique em salvar para confirmar a exclusão");
}

async function salvar() {
    const id_quarto = document.getElementById("inputId_quarto").value;
    const capacidade_quarto = document.getElementById("inputCapacidade_quarto").value;
    const tipo_quarto_id = document.getElementById("selectId_tipo_quarto").value || null;
    const dadosQuarto = { id_quarto, capacidade_quarto, tipo_quarto_id };

    try {
        if (oQueEstaFazendo === 'inserindo') {
            await fetch(`${URL_API}/quarto`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosQuarto) });
            mostrarAviso("Inserido no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'alterando') {
            await fetch(`${URL_API}/quarto/${id_quarto}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosQuarto) });
            mostrarAviso("Alterado no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'excluindo') {
            await fetch(`${URL_API}/quarto/${id_quarto}`, { method: 'DELETE' });
            mostrarAviso("Excluído do Banco de Dados!");
        }

        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById("inputId_quarto").value = "";
        listar();
    } catch (erro) {
        mostrarAviso("Erro ao efetuar operação no servidor.");
    }
}

async function listar() {
    try {
        const resposta = await fetch(`${URL_API}/quarto/listar`);
        const data = await resposta.json();
        if (data.sucesso) {
            let texto = "";
            for (let linha of data.quartos) {
                const tipo = linha.tipo_quarto_nome ? ` - Tipo: ${linha.tipo_quarto_nome}` : ' - Tipo: Não informado';
                texto += `Quarto ${linha.id_quarto} | Capacidade: ${linha.capacidade_quarto}${tipo}<br>`;
            }
            document.getElementById("outputSaida").innerHTML = texto || "Nenhum quarto cadastrado.";
        }
    } catch (erro) {
        document.getElementById("outputSaida").innerHTML = "Servidor offline.";
    }
}

function cancelarOperacao() {
    limparAtributos();
    bloquearAtributos(true);
    visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
    mostrarAviso("Cancelou a operação");
}

function mostrarAviso(mensagem) {
    document.getElementById("divAviso").innerHTML = mensagem;
}

function mostrarDadosQuarto(p) {
    document.getElementById("inputId_quarto").value = p.id_quarto;
    document.getElementById("inputCapacidade_quarto").value = p.capacidade_quarto;
    document.getElementById("selectId_tipo_quarto").value = p.tipo_quarto_id || "";
    bloquearAtributos(true);
    atualizarImagemDoTipo();
}

function limparAtributos() {
    quarto = null;
    oQueEstaFazendo = '';
    document.getElementById("inputCapacidade_quarto").value = "";
    document.getElementById("selectId_tipo_quarto").value = "";
    atualizarImagemDoTipo();
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    document.getElementById("inputId_quarto").readOnly = !soLeitura;
    document.getElementById("inputCapacidade_quarto").readOnly = soLeitura;
    document.getElementById("selectId_tipo_quarto").disabled = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
}