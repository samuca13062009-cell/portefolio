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

## Backoffice

Em `http://localhost:4180/admin`. Permite gerir o site sem alterar o código:

- **Dashboard:** projetos publicados, mensagens por ler, visitas dos últimos 30 dias e descargas do CV
- **Projetos:** criar, editar, publicar ou deixar em rascunho, destacar na Home e eliminar
- **Conteúdos:** dados gerais e SEO, Home, Sobre mim, experiência, formação, competências e línguas, em português e inglês
- **Contactos:** ler, marcar como lida, responder por email e eliminar mensagens
- **Conta:** alterar a palavra-passe e terminar sessão

Na primeira execução é criada a conta `admin` e a palavra-passe inicial fica no ficheiro
`PRIMEIRA-PALAVRA-PASSE.txt`, que é apagado quando a palavra-passe é alterada.

Segurança: palavra-passe guardada com scrypt e salt, sessão em cookie `HttpOnly` e
`SameSite=Strict` com validade de 8 horas, token CSRF em todos os pedidos que alteram
dados, limite de 5 tentativas de login por 15 minutos e validação de tudo o que é
guardado. A conta, as mensagens e as estatísticas não fazem parte do repositório.

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
lib/admin.js       autenticação e API do backoffice
public/admin/      interface do backoffice
data/content.json  todos os conteúdos do site
public/            CSS, JavaScript, favicon e PDF do CV
tools/build-cv.js  gera os PDF do CV
```

## Autor

Samuel Camargo
