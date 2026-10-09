# Portefólio — Samuel Camargo

Portefólio profissional com páginas de apresentação, projetos, CV e contacto.
Disponível em português e inglês, com modo escuro.

## Funcionalidades

- Home, Sobre mim, Projetos, página individual de projeto, CV e Contacto
- Pesquisa e filtragem de projetos por categoria e tecnologia
- CV para consulta na página e em PDF (abrir ou descarregar)
- Formulário de contacto com validação no navegador e no servidor
- Envio das mensagens pelo Brevo, feito no servidor: a chave da API nunca chega ao navegador
- Versão em inglês (`/en`), modo escuro, SEO (meta, Open Graph, `sitemap.xml`, `robots.txt`)
- Contagem de visitas por página e por dia

## Tecnologias

HTML, CSS e JavaScript no cliente; Node.js no servidor, sem dependências externas.
As páginas são geradas no servidor a partir de `data/content.json`, por isso os
conteúdos mudam sem tocar no código.

## Como correr

É preciso ter o [Node.js](https://nodejs.org) 18 ou mais recente.

```bash
node server.js
```

O site fica em `http://localhost:4180`. No Windows também se pode abrir o `iniciar.bat`.

## Configurar o Brevo

1. Copiar `.env.example` para `.env`.
2. Preencher `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` (remetente verificado no Brevo) e
   `CONTACT_TO` (caixa que recebe as mensagens).
3. Reiniciar o servidor.

Sem estas definições o formulário continua a funcionar, mas as mensagens ficam apenas
guardadas em `data/messages.json`. O ficheiro `.env`, as mensagens e as estatísticas
não fazem parte do repositório.

## Atualizar o PDF do CV

Depois de alterar `data/content.json`:

```bash
npm run cv
```

Usa o Chrome ou o Edge instalados para gerar `public/cv/*.pdf`.

## Estrutura

```
server.js          servidor, rotas, API de contacto e Brevo
lib/render.js      geração das páginas (PT e EN)
data/content.json  todos os conteúdos do site
public/            CSS, JavaScript, favicon e PDF do CV
tools/build-cv.js  gera os PDF do CV
```

## Autor

Samuel Camargo
