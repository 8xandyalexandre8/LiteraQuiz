# LiteraQuiz — versão híbrida

## Arquivos
- `index.html`: estrutura da página.
- `style.css`: aparência e responsividade.
- `script.js`: lógica do quiz.
- `perguntas.json`: banco local prioritário.
- `favicon.svg`: ícone do navegador.

## Como funciona
1. O JavaScript lê `perguntas.json`.
2. Perguntas locais completas são utilizadas primeiro.
3. Se houver menos de 10 perguntas locais, consulta a Open Trivia Database oficial na categoria 10 (Entertainment: Books), tipo múltipla escolha.
4. Perguntas da API são complementares. Se a API estiver fora do ar, as perguntas locais continuam funcionando.

## Atenção aos dez IDs do trabalho
Os IDs 18926, 8379, 8309, 7875, 6860, 5740, 5031, 4702, 4470 e 2564 foram preservados em `perguntas.json`.
A OpenTDB oficial não oferece busca por IDs individuais. O serviço que acrescenta IDs, Open Triviata, apresentou erro de certificado no navegador do usuário. Por isso, não é possível recuperar com segurança os enunciados exatos desses IDs neste momento.
Os campos estão vazios intencionalmente: preencha-os com os enunciados e alternativas reais. Não foram inventadas perguntas nem associadas respostas a IDs sem confirmação.

## Formato de cada pergunta local
Cada objeto deve conter:
- `id`: identificador do trabalho.
- `pergunta`: enunciado em português.
- `respostaCorreta`: alternativa correta.
- `respostasIncorretas`: lista com exatamente três alternativas incorretas.

Exemplo de estrutura (texto meramente ilustrativo; substitua pelo conteúdo real):
```json
{
  "id": 18926,
  "pergunta": "ESCREVA A PERGUNTA REAL AQUI",
  "respostaCorreta": "RESPOSTA CORRETA",
  "respostasIncorretas": [
    "ALTERNATIVA INCORRETA 1",
    "ALTERNATIVA INCORRETA 2",
    "ALTERNATIVA INCORRETA 3"
  ]
}
```

## Como executar
Não abra o HTML diretamente pelo caminho `file:///`. Use a extensão Live Server no VS Code ou publique no GitHub Pages. Isso evita limitações de `fetch()` ao ler o JSON local.

## API
A Open Trivia Database oficial permite filtrar por categoria, dificuldade, quantidade e tipo, mas não por IDs individuais. Categoria 10 corresponde a Entertainment: Books. Documentação: https://opentdb.com/api_config.php

A tradução das perguntas complementares é tentada por um endpoint público de tradução. Se falhar, o texto original pode aparecer; revise as traduções antes de apresentar.
# Prompt
"Você é um programador que foi contratado para fazer a base de um jogo com responsividade inspirado no show do milhão, isto é possuir uma pergunta com algumas alternativas de respostas e apenas uma correta. O nome do jogo será LiteraQuiz. 
 
O jogo será feito no Vscode e estará disposto no github, será utilizado html, css, Vaiavascript e uma API. 
 
Deverá ter pelo menos os arquivos index.html, style.css, script.js e a API que deverá ser utilizada é a https://opentdb.com/.  
 
Será organizado de cima para baixo Com título/nome do jogo, perguntas e as  
alternativas 

Deve ter ícone do site  
 
As perguntas serão sobre livros, devem ser em português (caso esteja em inglês devem ser traduzidas) e serão selecionadas pelo id. 
As perguntas selecionadas são: 
18926 
8379 
8309 
7875 
6860 
5740 
5031 
4702 
4470 
2564 
 
Quando uma pergunta for acertada vai iniciar direto a próxima pergunta. 
 
Cada parte do código deve ser explicada no chat e através dos comentários  

No style deve possuir códigos para organizar as alternativas em duas fileiras, mudar a cor fonte e tamanho das letras, também deverá ter código para a cor dos botões, cor da borda dos botões e ao posicionar o mouse e cima dos botões a borda ficará expandindo e contraindo de maneira suave. Deverá haver um código para o título e outro para a pergunta, cada um com mudança de cor, tamanho da letra e mudança de fonte. No fundo deve ter uma imagem no fundo que se repete até preencher a tela. 
 
Todas a partes em que devem ser inseridos os tamanhos, fontes, cores e imagens devem estar vazias para que eu possa inserir posteriormente."
