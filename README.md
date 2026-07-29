# DEXAI — Pokédex com chat de IA

![Bulbasaur](images/bulbasaur-preview.jpg)

Pokédex feita com a [PokeAPI](https://pokeapi.co/), com um chat lateral que usa a API do Gemini (Google) para responder perguntas específicas sobre o pokémon exibido no momento.

Baseado neste vídeo tutorial: https://www.youtube.com/watch?v=SjtdH3dWLa8

## Como usar

1. Abra o `index.html` no navegador (ou publique via GitHub Pages).
2. Na primeira vez, o painel de chat vai pedir sua chave da API do Gemini.
3. Gere uma chave gratuita em: https://aistudio.google.com/apikey
4. Cole a chave no campo e clique em **Salvar**.

Pronto, a partir daí você pode perguntar qualquer coisa sobre o pokémon que estiver na tela.

## Sobre a chave da API

Este projeto **não tem nenhuma chave fixa no código**. Cada pessoa que for usar cola a própria chave, que fica salva apenas no `localStorage` do navegador dela, nunca é enviada para nenhum servidor além da própria API do Google, e nunca aparece no código-fonte ou no repositório.

Isso significa que:
- ✅ Você pode deixar este repositório público sem se preocupar com sua chave sendo exposta.
- ✅ Cada visitante do site usa a própria cota gratuita do Gemini.
- ⚠️ Se você limpar os dados do navegador (ou usar outro navegador/computador), vai precisar colar a chave de novo.

## Estrutura do projeto

```
pokedex/
├── index.html
├── script.js
├── style.css
└── images/
    ├── pokedex.png
    ├── pokeball-png-45330.png
    └── bulbasaur-preview.jpg
```

## Tecnologias

- HTML, CSS e JavaScript puro (sem frameworks)
- [PokeAPI](https://pokeapi.co/) — dados dos pokémon
- [Gemini API](https://ai.google.dev/) — chat de IA
