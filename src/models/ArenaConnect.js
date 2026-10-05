const fs = require('fs');
const path = require('path');

const Modalidade = require('./Modalidade');
const CadastroFactory = require('./CadastroFactory');

class ArenaConnect {

    static #instancia = null;

    // ==============================
    // SINGLETON
    // ==============================

    static getInstancia() {

        if (!ArenaConnect.#instancia) {
            ArenaConnect.#instancia = new ArenaConnect();
        }

        return ArenaConnect.#instancia;
    }

    constructor() {

        if (ArenaConnect.#instancia) {
            throw new Error(
                'ArenaConnect já existe. Use ArenaConnect.getInstancia().'
            );
        }

        // ==============================
        // DADOS DO SISTEMA
        // ==============================

        this.turmas = [];
        this.atletas = [];
        this.arbitros = [];
        this.equipes = [];

        // ==============================
        // CONTADORES
        // ==============================

        this.idTurmaContador = 1;
        this.idAtletaContador = 1;
        this.idArbitroContador = 1;
        this.idEquipeContador = 1;

        // ==============================
        // CARREGAR JSON
        // ==============================

        this.carregarDados();
    }

    // ==================================================
    // JSON - CAMINHO DO ARQUIVO
    // ==================================================

    obterCaminhoArquivo() {

        const pasta = path.join(
            __dirname,
            '../../dados'
        );

        // Cria a pasta caso ela não exista
        if (!fs.existsSync(pasta)) {

            fs.mkdirSync(
                pasta,
                {
                    recursive: true
                }
            );
        }

        return path.join(
            pasta,
            'arena.json'
        );
    }

    // ==================================================
    // JSON - SALVAR
    // ==================================================

    salvarDados() {

        const dados = {

            turmas: this.turmas,

            atletas: this.atletas,

            arbitros: this.arbitros,

            equipes: this.equipes,

            idTurmaContador:
                this.idTurmaContador,

            idAtletaContador:
                this.idAtletaContador,

            idArbitroContador:
                this.idArbitroContador,

            idEquipeContador:
                this.idEquipeContador
        };

        const arquivo =
            this.obterCaminhoArquivo();

        try {

            fs.writeFileSync(

                arquivo,

                JSON.stringify(
                    dados,
                    null,
                    4
                ),

                'utf8'
            );

        } catch (erro) {

            console.log(
                `✖ Erro ao salvar os dados: ${erro.message}`
            );
        }
    }

    // ==================================================
    // JSON - CARREGAR
    // ==================================================

    carregarDados() {

        const arquivo =
            this.obterCaminhoArquivo();

        // Se o arquivo ainda não existe,
        // começa com os arrays vazios.
        if (!fs.existsSync(arquivo)) {
            return;
        }

        try {

            const dados = JSON.parse(

                fs.readFileSync(
                    arquivo,
                    'utf8'
                )
            );

            // ==========================================
            // TURMAS
            // ==========================================

            this.turmas =
                (dados.turmas || []).map(
                    turma => {

                        return CadastroFactory.criarTurma(
                            turma.id,
                            turma.nome
                        );
                    }
                );

            // ==========================================
            // ATLETAS
            // ==========================================

            this.atletas =
                (dados.atletas || []).map(
                    atleta => {

                        return CadastroFactory.criarAtleta(
                            atleta.id,
                            atleta.nome,
                            atleta.idTurma
                        );
                    }
                );

            // ==========================================
            // ÁRBITROS
            // ==========================================

            this.arbitros =
                (dados.arbitros || []).map(
                    arbitro => {

                        return CadastroFactory.criarArbitro(
                            arbitro.id,
                            arbitro.nome,
                            arbitro.numeroCredencial,
                            arbitro.anosExperiencia
                        );
                    }
                );

            // ==========================================
            // EQUIPES
            // ==========================================

            this.equipes =
                (dados.equipes || []).map(
                    equipe => {

                        const novaEquipe =
                            CadastroFactory.criarEquipe(
                                equipe.id,
                                equipe.idTurma,
                                equipe.modalidade
                            );

                        // Recupera os atletas
                        // que estavam na equipe
                        if (
                            Array.isArray(
                                equipe.atletas
                            )
                        ) {

                            equipe.atletas.forEach(
                                idAtleta => {

                                    novaEquipe.adicionarAtleta(
                                        idAtleta
                                    );
                                }
                            );
                        }

                        return novaEquipe;
                    }
                );

            // ==========================================
            // CONTADORES
            // ==========================================

            this.idTurmaContador =
                dados.idTurmaContador || 1;

            this.idAtletaContador =
                dados.idAtletaContador || 1;

            this.idArbitroContador =
                dados.idArbitroContador || 1;

            this.idEquipeContador =
                dados.idEquipeContador || 1;

            console.log(
                '✔ Dados carregados do JSON!'
            );

        } catch (erro) {

            console.log(
                `✖ Erro ao carregar os dados: ${erro.message}`
            );
        }
    }

    // ==================================================
    // TURMAS
    // ==================================================

    adicionarTurma() {

        const nome =
            prompt(
                "Nome da nova turma: "
            );

        try {

            const novaTurma =
                CadastroFactory.criarTurma(
                    this.idTurmaContador,
                    nome
                );

            this.turmas.push(
                novaTurma
            );

            this.idTurmaContador++;

            this.salvarDados();

            console.log(
                "✔ Turma registrada com sucesso!"
            );

        } catch (erro) {

            console.log(
                `✖ Turma não registrada: ${erro.message}`
            );
        }
    }

    listarTurmas() {

        console.log(
            "\n=== LISTA DE TURMAS ==="
        );

        if (
            this.turmas.length === 0
        ) {

            return console.log(
                "Nenhuma turma no sistema."
            );
        }

        this.turmas.forEach(
            turma => turma.exibir()
        );
    }

    buscarTurmaOuFalhar(idTurma) {

        const turma =
            this.turmas.find(
                turma =>
                    turma.id === idTurma
            );

        if (!turma) {

            throw new Error(
                `Turma com ID ${idTurma} não existe.`
            );
        }

        return turma;
    }

    // ==================================================
    // ATLETAS
    // ==================================================

    buscarAtletaOuFalhar(idAtleta) {

        const atleta =
            this.atletas.find(
                atleta =>
                    atleta.id === idAtleta
            );

        if (!atleta) {

            throw new Error(
                `Atleta com ID ${idAtleta} não existe.`
            );
        }

        return atleta;
    }

    adicionarAtleta(idT, nome) {

        const turma =
            this.buscarTurmaOuFalhar(idT);

        const novoAtleta =
            CadastroFactory.criarAtleta(
                this.idAtletaContador,
                nome,
                idT
            );

        this.idAtletaContador++;

        this.atletas.push(
            novoAtleta
        );

        this.salvarDados();

        return {
            atleta: novoAtleta,
            turma: turma
        };
    }

    listarAtletas() {

        return this.atletas.map(
            atleta => {

                return {

                    atleta: atleta,

                    nomeTurma:
                        this.turmas.find(
                            turma =>
                                turma.id ===
                                atleta.idTurma
                        )?.nome ??
                        'Turma não encontrada'
                };
            }
        );
    }

    // ==================================================
    // ÁRBITROS
    // ==================================================

    adicionarArbitro() {

        const nome =
            prompt(
                "Nome do Árbitro: "
            );

        const numeroCredencial =
            parseInt(
                prompt(
                    "Número de Credencial: "
                )
            );

        const anosExperiencia =
            parseInt(
                prompt(
                    "Anos de Experiência: "
                )
            );

        try {

            const novoArbitro =
                CadastroFactory.criarArbitro(
                    this.idArbitroContador,
                    nome,
                    numeroCredencial,
                    anosExperiencia
                );

            this.idArbitroContador++;

            this.arbitros.push(
                novoArbitro
            );

            this.salvarDados();

            console.log(
                "✔ Árbitro registrado com sucesso!"
            );

        } catch (erro) {

            console.log(
                `✖ Árbitro não registrado: ${erro.message}`
            );
        }
    }

    listarArbitros() {

        console.log(
            "\n=== LISTA DE ÁRBITROS ==="
        );

        if (
            this.arbitros.length === 0
        ) {

            return console.log(
                "Nenhum árbitro no sistema."
            );
        }

        this.arbitros.forEach(
            arbitro =>
                arbitro.exibir()
        );
    }

    // ==================================================
    // EQUIPES
    // ==================================================

    buscarEquipeOuFalhar(idEquipe) {

        const equipe =
            this.equipes.find(
                equipe =>
                    equipe.id === idEquipe
            );

        if (!equipe) {

            throw new Error(
                `Equipe com ID ${idEquipe} não existe.`
            );
        }

        return equipe;
    }

    equipeJaExiste(
        idTurma,
        modalidade
    ) {

        return this.equipes.some(
            equipe =>
                equipe.idTurma === idTurma &&
                equipe.modalidade === modalidade
        );
    }

    adicionarEquipe() {

        this.listarTurmas();

        const idT =
            parseInt(
                prompt(
                    "ID da Turma: "
                )
            );

        try {

            const turma =
                this.buscarTurmaOuFalhar(
                    idT
                );

            console.log(
                "\nModalidades disponíveis:"
            );

            Object.values(
                Modalidade
            ).forEach(
                modalidade =>
                    console.log(
                        `- ${modalidade}`
                    )
            );

            const modalidade =
                prompt(
                    "Modalidade (copie exatamente como está na lista acima): "
                );

            if (
                this.equipeJaExiste(
                    idT,
                    modalidade
                )
            ) {

                throw new Error(
                    `a turma ${turma.nome} já tem uma equipe em "${modalidade}".`
                );
            }

            const novaEquipe =
                CadastroFactory.criarEquipe(
                    this.idEquipeContador,
                    idT,
                    modalidade
                );

            this.idEquipeContador++;

            this.equipes.push(
                novaEquipe
            );

            this.salvarDados();

            console.log(
                `✔ Equipe registrada: ${turma.nome} em "${modalidade}"!`
            );

        } catch (erro) {

            console.log(
                `✖ Equipe não registrada: ${erro.message}`
            );
        }
    }

    listarEquipes() {

        console.log(
            "\n=== LISTA DE EQUIPES ==="
        );

        if (
            this.equipes.length === 0
        ) {

            return console.log(
                "Nenhuma equipe no sistema."
            );
        }

        this.equipes.forEach(
            equipe => {

                const turma =
                    this.turmas.find(
                        turma =>
                            turma.id ===
                            equipe.idTurma
                    );

                const nomesAtletas =
                    equipe.atletas

                        .map(
                            idAtleta =>
                                this.atletas.find(
                                    atleta =>
                                        atleta.id ===
                                        idAtleta
                                )
                        )

                        .filter(
                            atleta => atleta
                        )

                        .map(
                            atleta =>
                                atleta.nome
                        );

                equipe.exibir(

                    turma
                        ? turma.nome
                        : "TURMA NÃO ENCONTRADA",

                    nomesAtletas
                );
            }
        );
    }

    // ==================================================
    // REMOVER EQUIPE
    // ==================================================

    removerEquipe() {

        this.listarEquipes();

        const idE =
            parseInt(
                prompt(
                    "ID da Equipe a remover: "
                )
            );

        try {

            const equipe =
                this.buscarEquipeOuFalhar(
                    idE
                );

            this.equipes =
                this.equipes.filter(
                    equipeAtual =>
                        equipeAtual.id !==
                        equipe.id
                );

            this.salvarDados();

            console.log(
                `✔ Equipe removida. Os atletas continuam no sistema (total de atletas: ${this.atletas.length}).`
            );

        } catch (erro) {

            console.log(
                `✖ Não foi possível remover: ${erro.message}`
            );
        }
    }

    // ==================================================
    // VINCULAR ATLETA À EQUIPE
    // ==================================================

    vincularAtletaEquipe() {

        this.listarEquipes();

        const idE =
            parseInt(
                prompt(
                    "ID da Equipe: "
                )
            );

        try {

            const equipe =
                this.buscarEquipeOuFalhar(
                    idE
                );

            this.listarAtletas();

            const idA =
                parseInt(
                    prompt(
                        "ID do Atleta: "
                    )
                );

            const atleta =
                this.buscarAtletaOuFalhar(
                    idA
                );

            if (
                atleta.idTurma !==
                equipe.idTurma
            ) {

                throw new Error(
                    `${atleta.nome} não pertence à turma dessa equipe.`
                );
            }

            if (
                !equipe.adicionarAtleta(
                    idA
                )
            ) {

                throw new Error(
                    `${atleta.nome} já está nessa equipe.`
                );
            }

            this.salvarDados();

            console.log(
                `✔ ${atleta.nome} vinculado à equipe de "${equipe.modalidade}"!`
            );

        } catch (erro) {

            console.log(
                `✖ Não foi possível vincular: ${erro.message}`
            );
        }
    }

    // ==================================================
    // DESVINCULAR ATLETA
    // ==================================================

    desvincularAtletaEquipe() {

        this.listarEquipes();

        const idE =
            parseInt(
                prompt(
                    "ID da Equipe: "
                )
            );

        try {

            const equipe =
                this.buscarEquipeOuFalhar(
                    idE
                );

            const idA =
                parseInt(
                    prompt(
                        "ID do Atleta a remover da equipe: "
                    )
                );

            const atleta =
                this.buscarAtletaOuFalhar(
                    idA
                );

            if (
                !equipe.removerAtleta(
                    idA
                )
            ) {

                throw new Error(
                    `${atleta.nome} não está nessa equipe.`
                );
            }

            this.salvarDados();

            console.log(
                `✔ ${atleta.nome} removido da equipe. Ele continua no sistema (total de atletas: ${this.atletas.length}).`
            );

        } catch (erro) {

            console.log(
                `✖ Não foi possível desvincular: ${erro.message}`
            );
        }
    }
}

module.exports = ArenaConnect;