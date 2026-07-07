// ======================
// Array das tarefas
// ======================

let tarefas = [];
let tarefaEmEdicao = null;

// ======================
// Elementos do html
// ======================

const formulario = document.getElementById("form-tarefa");
const listaTarefas = document.getElementById("lista-tarefas");

const totalTarefas = document.getElementById("total-tarefas");
const pendentes = document.getElementById("pendentes");
const concluidas = document.getElementById("concluidas");

const barraProgresso = document.getElementById("progresso");
const percentual = document.getElementById("percentual");

const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");

const btnTema = document.getElementById("btn-tema");

// ======================
// Função para o carregamento dos dados
// ======================

function carregarDados() {

    const dados = localStorage.getItem("tarefas");

    if (dados) {
        tarefas = JSON.parse(dados);
    }

    renderizarTarefas();
}

// ======================
// Função para o salvamento dos dados
// ======================

function salvarDados() {
    localStorage.setItem(
        "tarefas",
        JSON.stringify(tarefas)
    );
}

// ======================
// Implementação da funcionalidade de adicionar tarefas
// ======================

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const disciplina = document.getElementById("disciplina").value;
    const data = document.getElementById("data").value;
    const descricao = document.getElementById("descricao").value;
    const prioridade = document.getElementById("prioridade").value;

    if (tarefaEmEdicao !== null) {

        const tarefa = tarefas.find(
            tarefa => tarefa.id === tarefaEmEdicao
        );

        tarefa.titulo = titulo;
        tarefa.disciplina = disciplina;
        tarefa.descricao = descricao;
        tarefa.data = data;
        tarefa.prioridade = prioridade;

        tarefaEmEdicao = null;

        btnSalvar.textContent =
            "Adicionar Tarefa";

        btnCancelar.style.display =
            "none";

    } else {

        const novaTarefa = {
            id: Date.now(),
            titulo,
            disciplina,
            descricao,
            data,
            prioridade,
            status: "pendente"
        };

        tarefas.push(novaTarefa);
    }

    salvarDados();
    renderizarTarefas();

    formulario.reset();
});

/*
Função para apresentar as tarefas, classificar suas prioridades, aviso de vencimento, e as opções
relacionadas as tarefas.
*/ 

function renderizarTarefas(lista = tarefas) {

    listaTarefas.innerHTML = "";

    lista.forEach(tarefa => {

        const item = document.createElement("li");

        let classePrioridade = "";

        if (tarefa.prioridade === "Alta") {
            classePrioridade = "alta";
        } else if (tarefa.prioridade === "Média") {
            classePrioridade = "media";
        } else {
            classePrioridade = "baixa";
        }

        item.classList.add("tarefa");
        item.classList.add(classePrioridade);

        if (tarefa.status === "concluida") {
            item.classList.add("concluida");
        }

        item.innerHTML = `
            <h3>${tarefa.titulo}</h3>

            <p><strong>Disciplina:</strong> ${tarefa.disciplina}</p>

            ${tarefa.descricao ?
            `
            <p>
                <strong>Descrição:</strong>
                ${tarefa.descricao}
            </p>
            `
            : ""}

            <p><strong>Data:</strong> ${tarefa.data}</p>

            ${tarefa.status !== "concluida" &&
            obterAvisoPrazo(tarefa.data)
            ? `
            <p class="aviso-prazo">
                ${obterAvisoPrazo(tarefa.data)}
            </p>
            `
            : ""}

            <p>
                <strong>Status:</strong>
                ${obterStatusVisual(tarefa.status)}
            </p>

            <div class="acoes">

                <button
                    class="btn-editar"
                    onclick="editarTarefa(${tarefa.id})">
                    Editar
                </button>

                <button
                    class="btn-andamento"
                    onclick="iniciarTarefa(${tarefa.id})">
                    Iniciar
                </button>

                <button
                    class="btn-concluir"
                    onclick="concluirTarefa(${tarefa.id})">
                    Concluir
                </button>

                <button
                    class="btn-excluir"
                    onclick="excluirTarefa(${tarefa.id})">
                    Excluir
                </button>

            </div>
        `;

        listaTarefas.appendChild(item);
    });


    atualizarDashboard();
}

function iniciarTarefa(id){

    const tarefa = tarefas.find(
        tarefa => tarefa.id === id
    );

    tarefa.status = "andamento";

    salvarDados();
    renderizarTarefas();
}

function concluirTarefa(id){

    const tarefa = tarefas.find(
        tarefa => tarefa.id === id
    );

    tarefa.status = "concluida";

    salvarDados();
    renderizarTarefas();
}

// ======================
// Função para exlcuir as tarefas
// ======================

function excluirTarefa(id) {

    tarefas = tarefas.filter(
        tarefa => tarefa.id !== id
    );

    salvarDados();
    renderizarTarefas();
}

// ======================
// Função para criar a dashboard (na verdade ainda não é uma dashboard completa rsrs!)
// ======================

function atualizarDashboard() {

    const total = tarefas.length;

    const totalConcluidas =
        tarefas.filter(
        tarefa => tarefa.status === "concluida"
    ).length;

    const totalPendentes =
        total - totalConcluidas;

    totalTarefas.textContent = total;
    pendentes.textContent = totalPendentes;
    concluidas.textContent = totalConcluidas;

    let progresso = 0;

    if (total > 0) {
        progresso = Math.round(
            (totalConcluidas / total) * 100
        );
    }

    barraProgresso.style.width = progresso + "%";
    percentual.textContent = progresso + "%";
}

// ======================
// Implementação dos filtros Todas, Pendentes e Concluidas para as atividades
// ======================

document
    .getElementById("btn-todas")
    .addEventListener("click", () => {

        renderizarTarefas(tarefas);
    });

document
    .getElementById("btn-pendentes")
    .addEventListener("click", () => {

        const filtradas = tarefas.filter(
            tarefa => tarefa.status !== "concluida"
        );

        renderizarTarefas(filtradas);
    });

document
    .getElementById("btn-concluidas")
    .addEventListener("click", () => {

        const filtradas = tarefas.filter(
            tarefa => tarefa.status === "concluida"
        );

        renderizarTarefas(filtradas);
    });

function editarTarefa(id){

    const tarefa = tarefas.find(
        tarefa => tarefa.id === id
    );

    document.getElementById("titulo").value =
        tarefa.titulo;

    document.getElementById("disciplina").value =
        tarefa.disciplina;

    document.getElementById("descricao").value =
        tarefa.descricao || "";

    document.getElementById("data").value =
        tarefa.data;

    document.getElementById("prioridade").value =
        tarefa.prioridade;

    tarefaEmEdicao = id;

    btnSalvar.textContent =
        "Salvar Alterações";

    btnCancelar.style.display =
        "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function cancelarEdicao(){

    tarefaEmEdicao = null;

    formulario.reset();

    btnSalvar.textContent =
        "Adicionar Tarefa";

    btnCancelar.style.display =
        "none";
}

btnCancelar.addEventListener(
    "click",
    cancelarEdicao
);

// ====================
// Função para criar o tema escuro
// ==================

function alternarTema() {

    document.body.classList.toggle("dark-mode");

    const temaEscuro =
        document.body.classList.contains("dark-mode");

    localStorage.setItem(
        "tema",
        temaEscuro ? "escuro" : "claro"
    );

    btnTema.textContent =
        temaEscuro
            ? "☀️ Modo Claro"
            : "🌙 Modo Escuro";
}

btnTema.addEventListener(
    "click",
    alternarTema
);

function carregarTema() {

    const tema =
        localStorage.getItem("tema");

    if (tema === "escuro") {

        document.body.classList.add(
            "dark-mode"
        );

        btnTema.textContent =
            "☀️ Modo Claro";
    }
}

function obterStatusVisual(status){

    if(status === "pendente"){
        return "📝 Pendente";
    }

    if(status === "andamento"){
        return "⏳ Em andamento";
    }

    if(status === "concluida"){
        return "✅ Concluída";
    }

    return "📝 Pendente";
}


function obterAvisoPrazo(dataEntrega){

    const hoje = new Date();

    hoje.setHours(0,0,0,0);

    const partes = dataEntrega.split("-");

    const entrega = new Date(
        partes[0],
        partes[1] - 1,
        partes[2]
    );

    entrega.setHours(0,0,0,0);

    const diferencaDias =
        Math.round(
            (entrega - hoje) /
            (1000 * 60 * 60 * 24)
        );

    console.log("Data da tarefa:", dataEntrega);
    console.log("Hoje:", hoje);
    console.log("Entrega:", entrega);
    console.log("Diferença:", diferencaDias);

    if(diferencaDias < 0){
        return "❌ Prazo expirado";
    }

    if(diferencaDias === 0){
        return "🚨 Vence hoje";
    }

    if(diferencaDias === 1){
        return "⚠️ Vence amanhã";
    }

    if(diferencaDias <= 3){
        return `⏳ Restam ${diferencaDias} dias`;
    }

    return "";
}
// ======================
// Aqui vai ocorrer o inicialização dos dados para o site
// ======================

carregarTema();
carregarDados();