const pokemonName = document.querySelector('.pokemon_name');
const pokemonNumber = document.querySelector('.pokemon_number');
const pokemonImage = document.querySelector('.pokemon_image');
const form = document.querySelector('.form');
const input = document.querySelector('.input_search');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');
let searchpokemon = 1;
const MAX_POKEMON = 1025;

// ---------- Chat com IA (Gemini) ----------
// Cada pessoa que usar esse projeto cola a própria chave da API do Gemini
// (gratuita em https://aistudio.google.com/apikey). A chave fica salva
// apenas no localStorage do navegador de quem está usando, e é enviada
// unicamente para a API do Google ao fazer uma pergunta - nunca é enviada
// para nenhum outro servidor, nem fica visível no código-fonte do projeto.
const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_KEY_STORAGE = "dexai_gemini_api_key";

const chatMessages = document.querySelector('.chat-messages');
const chatForm = document.querySelector('.chat-form');
const chatInput = document.querySelector('.chat-input');
const chatSend = document.querySelector('.chat-send');
const chatCurrentPokemon = document.querySelector('.chat-current-pokemon');
const chatKeyBtn = document.querySelector('.chat-key-btn');
const chatKeySetup = document.querySelector('.chat-key-setup');
const chatKeyInput = document.querySelector('.chat-key-input');
const chatKeySave = document.querySelector('.chat-key-save');

let currentPokemonData = null;
let chatHistory = []; 
function getGeminiApiKey() {
    return localStorage.getItem(GEMINI_KEY_STORAGE) || "";
}

function setGeminiApiKey(key) {
    localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
}

function toggleKeySetup(forceShow) {
    const shouldShow = forceShow !== undefined ? forceShow : !chatKeySetup.classList.contains('visible');
    chatKeySetup.classList.toggle('visible', shouldShow);
}


if (!getGeminiApiKey()) {
    toggleKeySetup(true);
} else {
    chatKeyInput.value = getGeminiApiKey();
}

chatKeyBtn.addEventListener('click', () => toggleKeySetup());

chatKeySave.addEventListener('click', () => {
    const key = chatKeyInput.value.trim();
    if (!key) {
        addChatMessage("Cole uma chave válida antes de salvar.", 'ai', 'error');
        return;
    }
    setGeminiApiKey(key);
    toggleKeySetup(false);
    addChatMessage("Chave salva! Agora você já pode perguntar sobre o pokémon.", 'ai');
});

const fetchpokemon = async (pokemon) => {
    
    const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    if (APIResponse.status == 200) {
    const data  = await APIResponse.json();
    return data;
    }
}

const renderPokemon = async(pokemon) => {
    pokemonName.innerHTML = "Loading..."
    const data = await fetchpokemon(pokemon);

    if (data){
    pokemonImage.style.display = '';
    pokemonName.innerHTML = data.name;
    pokemonNumber.innerHTML = data.id;
    pokemonImage.src = data.sprites.other.showdown.front_default;
    input.value = ""
    searchpokemon = data.id

    // atualiza o contexto usado pelo chat de IA
    currentPokemonData = data;
    chatHistory = [];n
    chatMessages.innerHTML = "";
    chatCurrentPokemon.textContent = data.name;
    addChatMessage(`Pode perguntar o que quiser sobre ${capitalize(data.name)}!`, 'ai');
    } else {
        pokemonImage.style.display = 'none';
        pokemonNumber.innerHTML = ""
        pokemonName.innerHTML = "Not Found :("

        currentPokemonData = null;
        chatCurrentPokemon.textContent = "-";
    }
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}



form.addEventListener('submit', (event) => {
    event.preventDefault();
    renderPokemon(input.value.toLowerCase())
});




buttonPrev.addEventListener('click', () => {
    if (searchpokemon > 1){
    searchpokemon -= 1
    }
    renderPokemon(searchpokemon)
});


buttonNext.addEventListener('click', () => {
    if (searchpokemon < MAX_POKEMON){
    searchpokemon += 1
    }
    renderPokemon(searchpokemon);
});

renderPokemon(searchpokemon)


// Parte do chat

function addChatMessage(text, role, extraClass = "") {
    const msgEl = document.createElement('div');
    msgEl.classList.add('chat-message', role);
    if (extraClass) msgEl.classList.add(extraClass);
    msgEl.textContent = text;
    chatMessages.appendChild(msgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgEl;
}

function buildPokemonContext(data) {
    
    const types = data.types.map(t => t.type.name).join(', ');
    const abilities = data.abilities.map(a => a.ability.name).join(', ');
    const moves = data.moves.slice(0, 20).map(m => m.move.name).join(', ');
    const stats = data.stats
        .map(s => `${s.stat.name}: ${s.base_stat}`)
        .join(', ');

    return `
Nome: ${data.name}
Número na Pokédex: ${data.id}
Altura: ${data.height / 10} m
Peso: ${data.weight / 10} kg
Tipo(s): ${types}
Habilidades: ${abilities}
Estatísticas base: ${stats}
Alguns golpes que ele pode aprender: ${moves}
    `.trim();
}

async function askGemini(question) {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
        toggleKeySetup(true);
        throw new Error("Configure sua chave da API do Gemini (clique no ⚙ acima) antes de perguntar.");
    }

    const context = buildPokemonContext(currentPokemonData);

    const systemInstruction = `Você é um assistente de Pokédex especializado em responder perguntas sobre o Pokémon abaixo. Responda sempre em português, de forma curta e direta, usando apenas as informações fornecidas. Se a pergunta pedir algo que não está nos dados fornecidos, responda com seu conhecimento geral sobre Pokémon.

Dados do Pokémon atual:
${context}`;

    const contents = [
        ...chatHistory,
        { role: "user", parts: [{ text: question }] }
    ];

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: contents
            })
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        let message = errorData?.error?.message || `Erro ${response.status} ao consultar a IA.`;

        
        if (response.status === 400 || response.status === 403) {
            toggleKeySetup(true);
            message += " Verifique se a chave configurada está correta.";
        }

        throw new Error(message);
    }

    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
        throw new Error("A IA não retornou uma resposta válida.");
    }

    return answer;
}

chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const question = chatInput.value.trim();
    if (!question) return;

    if (!currentPokemonData) {
        addChatMessage("Busque um pokémon na pokedex antes de perguntar algo.", 'ai', 'error');
        return;
    }

    addChatMessage(question, 'user');
    chatInput.value = "";
    chatInput.disabled = true;
    chatSend.disabled = true;

    const loadingEl = addChatMessage("Pensando...", 'ai', 'loading');

    try {
        const answer = await askGemini(question);

    
        chatHistory.push({ role: "user", parts: [{ text: question }] });
        chatHistory.push({ role: "model", parts: [{ text: answer }] });

        loadingEl.remove();
        addChatMessage(answer, 'ai');
    } catch (error) {
        loadingEl.remove();
        addChatMessage(error.message, 'ai', 'error');
    } finally {
        chatInput.disabled = false;
        chatSend.disabled = false;
        chatInput.focus();
    }
});