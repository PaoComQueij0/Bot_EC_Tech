// =====================================
// IMPORTAÇÃO DE BIBLIOTECAS
// =====================================

const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const fs = require('fs')

// =====================================
// CONFIGURAÇÕES
// =====================================

const pastaOS = "./OS/"
const numeroTecnico = "5599999999999-@c.us" 

// =====================================
// INICIALIZAÇÃO DO CLIENTE WHATSAPP
// =====================================

const client = new Client({
    authStrategy: new LocalAuth()
})

client.on('qr', qr => {
    qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
    console.log("🤖 Bot EC Tech Online")
})

// =====================================
// MEMÓRIA DO BOT
// =====================================

const estados = {}
const dadosOS = {}

// =====================================
// MENU INICIAL
// =====================================

const menuInicial = `Olá! 👨‍💻
Eu sou o *Tec*, assistente virtual da *EC Tech*

Como posso ajudar?

1️⃣ Computadores e notebooks
2️⃣ Redes e internet
3️⃣ Videogames
4️⃣ Falar com especialista
5️⃣ Já sou cliente

0️⃣ Independente de onde você estiver, digitar 0 te traz de volta ao menu inicial`

// =====================================
// MENU COMPUTADORES E NOTEBOOKS
// =====================================

const menuComputadores = `💻 *Assistência para Computadores*

Escolha uma opção:

1️⃣ Equipamento com defeito
2️⃣ Limpeza e manutenção preventiva
3️⃣ Formatação
4️⃣ Falar com o técnico

0️⃣ Voltar ao menu inicial`

// =====================================
// MENU REDES
// =====================================

const menuRedes = `🌐 *Serviços de Rede*

Qual serviço você precisa?

1️⃣ Instalação de roteador
2️⃣ Configuração de Wi-Fi
3️⃣ Cabeamento residencial
4️⃣ Projeto de rede

0️⃣ Voltar ao menu inicial`

// =====================================
// MENU VIDEOGAMES
// =====================================

const menuGames = `🎮 *Assistência para Videogames*

Escolha:

1️⃣ Reparo de console ou controle
2️⃣ Manutenção preventiva
3️⃣ Desbloqueio ou jogos

0️⃣ Voltar ao menu inicial`

// =====================================
// MENU FORMATAÇÃO
// =====================================

const menuFormat = `💾 *Formatação EC Tech*

Inclui:

✔ Windows ativado
✔ Pacote Office ativado
✔ Winrar
✔ Leitor PDF

Escolha:

1️⃣ Formatação COM backup — R$100
2️⃣ Formatação SEM backup — R$85

0️⃣ Voltar ao menu`

// =====================================
// EVENTO DE MENSAGEM
// =====================================

client.on('message', async (msg) => {

    // Ignorar grupos
    if(msg.from.includes("@g.us")) return

    const numero = msg.from
    const texto = msg.body ? msg.body.toLowerCase().trim() : ""
    const telefone = numero.split("@")[0]

    console.log("Mensagem:", texto)
    console.log("Estado:", estados[numero])

    // Usuário novo
    if(!estados[numero]){
        estados[numero] = "menu"
        await msg.reply(menuInicial)
        return
    }

    // Voltar ao menu
    if(texto === "0"){
        estados[numero] = "menu"
        await msg.reply(menuInicial)
        return
    }

    // =====================================
    // MENU PRINCIPAL
    // =====================================

    if(estados[numero] === "menu"){

        if(texto === "1"){
            estados[numero] = "menu_pc"
            await msg.reply(menuComputadores)
            return
        }

        if(texto === "2"){
            estados[numero] = "menu_redes"
            await msg.reply(menuRedes)
            return
        }

        if(texto === "3"){
            estados[numero] = "menu_games"
            await msg.reply(menuGames)
            return
        }

        if(texto === "4" || texto === "5"){
            await msg.reply("Assim que possível um técnico entrará em contato. ⏰ Atendimento a partir das 12:00")
            return
        }

        return
    }

    // =====================================
    // MENU COMPUTADORES
    // =====================================

    if(estados[numero] === "menu_pc"){

        let servico = ""
        if(texto === "1") servico = "Orçamento manutenção"
        else if(texto === "2") servico = "Limpeza preventiva"
        else if(texto === "3"){
            estados[numero] = "menu_format"
            await msg.reply(menuFormat)
            return
        }
        else if(texto === "4"){
            await msg.reply("Assim que possível um técnico entrará em contato. ⏰ Atendimento a partir das 12:00")
            return
        }
        else return

        iniciarOS(numero, servico, telefone, "pc")
        await msg.reply("Vamos abrir uma OS.\nQual seu nome?")
        estados[numero] = "os_nome"
        return
    }

    // =====================================
    // MENU FORMATAÇÃO
    // =====================================

    if(estados[numero] === "menu_format"){

        let servico = ""
        if(texto === "1") servico = "Formatação COM backup"
        else if(texto === "2") servico = "Formatação SEM backup"
        else return

        iniciarOS(numero, servico, telefone, "pc")
        await msg.reply("Qual seu nome?")
        estados[numero] = "os_nome"
        return
    }

    // =====================================
    // MENU REDES
    // =====================================

    if(estados[numero] === "menu_redes"){

        let servico = ""
        if(texto === "1") servico = "Instalação de roteador"
        else if(texto === "2") servico = "Configuração WiFi"
        else if(texto === "3") servico = "Cabeamento residencial"
        else if(texto === "4") servico = "Projeto de rede"
        else return

        iniciarOS(numero, servico, telefone, "rede")
        await msg.reply("Qual seu nome?")
        estados[numero] = "os_nome"
        return
    }

    // =====================================
    // MENU VIDEOGAMES
    // =====================================

    if(estados[numero] === "menu_games"){

        let servico = ""
        if(texto === "1") servico = "Reparo console"
        else if(texto === "2") servico = "Manutenção preventiva console"
        else if(texto === "3") servico = "Desbloqueio console"
        else return

        iniciarOS(numero, servico, telefone, "console")
        await msg.reply("Qual seu nome?")
        estados[numero] = "os_nome"
        return
    }

    // =====================================
    // COLETA DE DADOS OS
    // =====================================

    if(estados[numero] === "os_nome"){

        dadosOS[numero].nome = texto

        // Pergunta conforme tipo
        if(dadosOS[numero].tipo === "pc"){
            await msg.reply("Equipamento:\n1️⃣ Notebook\n2️⃣ PC")
            estados[numero] = "os_tipo"
        } else if(dadosOS[numero].tipo === "rede"){
            await msg.reply("Informe o endereço ou local do serviço:")
            estados[numero] = "os_local"
        } else if(dadosOS[numero].tipo === "console"){
            await msg.reply("Qual o console? (PS5, Xbox, Switch, etc.)")
            estados[numero] = "os_console_tipo"
        }

        return
    }

    // PC
    if(estados[numero] === "os_tipo"){
        dadosOS[numero].equipamento = (texto === "1") ? "Notebook" : "PC"
        await msg.reply("Informe marca ou especificações:")
        estados[numero] = "os_modelo"
        return
    }

    if(estados[numero] === "os_modelo"){
        dadosOS[numero].modelo = texto
        await finalizarOS(numero,msg)
        return
    }

    // Rede
    if(estados[numero] === "os_local"){
        dadosOS[numero].local = texto
        await finalizarOS(numero,msg)
        return
    }

    // Console
    if(estados[numero] === "os_console_tipo"){
        dadosOS[numero].console = texto
        await msg.reply("Descreva o defeito ou serviço desejado:")
        estados[numero] = "os_console_defeito"
        return
    }

    if(estados[numero] === "os_console_defeito"){
        dadosOS[numero].defeito = texto
        await finalizarOS(numero,msg)
        return
    }

})

// =====================================
// FUNÇÕES AUXILIARES
// =====================================

function iniciarOS(numero, servico, telefone, tipo){
    dadosOS[numero] = {
        servico: servico,
        telefone: telefone,
        tipo: tipo
    }
}

// =====================================
// FINALIZAÇÃO DA OS
// =====================================

async function finalizarOS(numero, msg){

    const data = new Date()
    const dia = String(data.getDate()).padStart(2,"0")
    const mes = String(data.getMonth()+1).padStart(2,"0")
    const ano = String(data.getFullYear()).slice(-2)
    const numeroOS = gerarNumeroSequencial(dia+mes+ano)

    let conteudo = `OS: ${numeroOS}
Cliente: ${dadosOS[numero].nome}
Telefone: ${dadosOS[numero].telefone}
Serviço: ${dadosOS[numero].servico}
Data: ${data.toLocaleDateString()}
Hora: ${data.toLocaleTimeString()}
`

    if(dadosOS[numero].tipo === "pc"){
        conteudo += `Equipamento: ${dadosOS[numero].equipamento}
Modelo: ${dadosOS[numero].modelo}\n`
    } else if(dadosOS[numero].tipo === "rede"){
        conteudo += `Local/Endereço: ${dadosOS[numero].local}\n`
    } else if(dadosOS[numero].tipo === "console"){
        conteudo += `Console: ${dadosOS[numero].console}
Defeito/Serviço: ${dadosOS[numero].defeito}\n`
    }

    if(!fs.existsSync(pastaOS)) fs.mkdirSync(pastaOS)
    fs.writeFileSync(`${pastaOS}/OS_${numeroOS}.txt`,conteudo)

    await msg.reply(`Sua OS foi registrada com sucesso! 📄
Número: ${numeroOS}
Em breve entraremos em contato.`)

    try{
        await client.sendMessage(numeroTecnico, `📄 Nova OS criada\n\n${conteudo}`)
    } catch(e){
        console.log("Falha ao notificar técnico:", e.message)
    }

    estados[numero] = "menu"
}

// =====================================
// GERADOR DE OS
// =====================================

function gerarNumeroSequencial(prefixo){
    if(!fs.existsSync(pastaOS)) fs.mkdirSync(pastaOS)
    const arquivos = fs.readdirSync(pastaOS)
    const hoje = arquivos.filter(a => a.includes(prefixo))
    return prefixo + String(hoje.length + 1).padStart(2,"0")
}

// =====================================
// INICIALIZAÇÃO DO CLIENTE
// =====================================

client.initialize()