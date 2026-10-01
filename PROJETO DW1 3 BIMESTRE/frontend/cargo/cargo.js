const URL_API = 'http://localhost:3001';

let oQueEstaFazendo = '';
let cargo = null;
bloquearAtributos(true);

async function procurePorChavePrimaria(chave) {
    try {
        const resposta = await fetch(`${URL_API}/cargo/${chave}`);
        const data = await resposta.json();
        return data.sucesso ? data.cargo : null;
    } catch (erro) {
        return null;
    }
}

async function procure() {
    const id_cargo = parseInt(document.getElementById("inputId_cargo").value, 10);
    if (isNaN(id_cargo)) {
        mostrarAviso("O ID do Cargo não pode ser vazio e deve ser um número.");
        return;
    }

    cargo = await procurePorChavePrimaria(id_cargo);
    oQueEstaFazendo = '';
    
    if (cargo) {
        mostrarDadosCargo(cargo);
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
    mostrarAviso("INSERINDO - Digite o nome do cargo e clique em salvar");
}

function alterar() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'alterando';
    mostrarAviso("ALTERANDO - Digite o novo nome e clique em salvar");
}

function excluir() {
    bloquearAtributos(true);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'excluindo';
    mostrarAviso("EXCLUINDO - Clique em salvar para confirmar a exclusão");
}

async function salvar() {
    const id_cargo = parseInt(document.getElementById("inputId_cargo").value, 10);
    const nome_cargo = document.getElementById("inputNome_cargo").value.trim();

    if (isNaN(id_cargo)) {
        mostrarAviso("O ID do cargo deve ser um número válido.");
        return;
    }

    const dadosCargo = { id_cargo, nome_cargo };

    try {
        if (oQueEstaFazendo === 'inserindo') {
            const resp = await fetch(`${URL_API}/cargo`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(dadosCargo) 
            });
            const data = await resp.json();
            if (!data.sucesso) return mostrarAviso(data.mensagem);
            mostrarAviso("Inserido no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'alterando') {
            const resp = await fetch(`${URL_API}/cargo/${id_cargo}`, { 
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(dadosCargo) 
            });
            const data = await resp.json();
            if (!data.sucesso) return mostrarAviso(data.mensagem);
            mostrarAviso("Alterado no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'excluindo') {
            const resposta = await fetch(`${URL_API}/cargo/${id_cargo}`, { method: 'DELETE' });
            const data = await resposta.json();
            if (!data.sucesso) {
                mostrarAviso(data.mensagem || "Erro ao excluir no servidor.");
                return;
            }
            mostrarAviso("Excluído do Banco de Dados!");
        }

        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById("inputId_cargo").value = "";
        listar();
    } catch (erro) {
        mostrarAviso("Erro ao efetuar operação no servidor.");
    }
}

async function listar() {
    const corpo = document.getElementById("tabelaCorpo");
    try {
        const resposta = await fetch(`${URL_API}/cargo/listar`);
        const data = await resposta.json();

        if (!data.sucesso) {
            mostrarLinhaVazia(corpo, 2, `Erro no banco: ${data.mensagem}`);
            return;
        }

        atualizarContador(data.cargos.length);
        if (data.cargos.length === 0) {
            mostrarLinhaVazia(corpo, 2, "Nenhum cargo cadastrado.");
            return;
        }

        corpo.innerHTML = '';
        data.cargos.forEach(c => {
            const tr = document.createElement('tr');

            const tdId = document.createElement('td');
            tdId.appendChild(criarBotaoId(c.id_cargo, selecionarCargo));

            const tdNome = document.createElement('td');
            tdNome.textContent = c.nome_cargo ?? '';

            tr.append(tdId, tdNome);
            corpo.appendChild(tr);
        });
    } catch (erro) {
        console.error("Erro ao listar:", erro);
        mostrarLinhaVazia(corpo, 2, "Servidor offline ou erro de conexão (CORS).");
    }
}

// Clicou no ID da tabela: volta para o cadastro e carrega o registro
async function selecionarCargo(id) {
    mostrarAba('cadastro');
    document.getElementById("inputId_cargo").value = id;
    await procure();
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

function mostrarDadosCargo(u) {
    document.getElementById("inputId_cargo").value = u.id_cargo;
    document.getElementById("inputNome_cargo").value = u.nome_cargo;
    bloquearAtributos(true);
}

function limparAtributos() {
    cargo = null;
    oQueEstaFazendo = '';
    document.getElementById("inputNome_cargo").value = "";
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    document.getElementById("inputId_cargo").readOnly = !soLeitura;
    document.getElementById("inputNome_cargo").readOnly = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
}


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