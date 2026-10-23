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
- Contagem de visitas por página e por dia, sem cookies nem endereços IP
- Política de Privacidade, Política de Cookies e Termos de Utilização (PT e EN)
- Consentimento obrigatório no formulário e mensagens apagadas automaticamente ao fim de 12 meses
- Fontes alojadas no próprio servidor: nenhum pedido a serviços de terceiros ao visitar o site

## Tecnologias

HTML, CSS e JavaScript no cliente; Node.js no servidor. Localmente não há dependências
externas; no Netlify usa-se só o pacote `@netlify/blobs`.
As páginas são geradas no servidor a partir de `data/content.json`, por isso os
conteúdos mudam sem tocar no código.

## Como correr

É preciso ter o [Node.js](https://nodejs.org) 18 ou mais recente.

```bash
node server.js
```

O site fica em `http://localhost:4180`. No Windows também se pode abrir o `iniciar.bat`.

## Publicar no Netlify

O site está preparado para o Netlify (`netlify.toml`): os ficheiros de `public/` são servidos
diretamente e as páginas e APIs correm na função `netlify/functions/site.mjs`, com os dados
(conteúdos editados, mensagens, conta, estatísticas) guardados no Netlify Blobs.

1. Em netlify.com, **Add new site > Import an existing project > GitHub** e escolher este repositório.
   As definições de build vêm do `netlify.toml`.
2. Em **Site configuration > Environment variables**, criar:
   - `ADMIN_PASSWORD`: palavra-passe inicial do backoffice (10 caracteres ou mais)
   - `PUBLIC_EMAIL`: email para pedidos de privacidade
   - `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `CONTACT_TO`: envio das mensagens
   - `SITE_URL`: só se usar um domínio próprio (por omissão usa o endereço do Netlify)
3. **Deploy**. A conta do backoffice é criada no primeiro acesso a `/admin` com a `ADMIN_PASSWORD`;
   depois de a mudar em Backoffice > Conta, a variável deixa de ser usada.

Notas:
- Depois da primeira edição no backoffice, os conteúdos passam a viver no Netlify Blobs:
  alterações posteriores ao `data/content.json` no GitHub já não se aplicam ao site publicado.
- O botão "Atualizar PDF do CV" só funciona localmente (precisa do Chrome). No Netlify,
  gera-se o PDF no computador com `npm run cv` e envia-se para o GitHub.

## Configurar o Brevo

1. Copiar `.env.example` para `.env`.
2. Preencher `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` (remetente verificado no Brevo) e
   `CONTACT_TO` (caixa que recebe as mensagens).
3. Preencher `PUBLIC_EMAIL` com o email que aparece nas páginas legais para pedidos de privacidade.
4. Reiniciar o servidor.

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

## Fontes

As fontes estão em `public/fonts` (licença SIL Open Font License 1.1, ver `public/fonts/LICENCAS.txt`).
Para voltar a descarregá-las depois de mudar a lista em `lib/themes.js`:

```bash
npm run fonts
```

## Atualizar o PDF do CV

Depois de alterar `data/content.json`:

```bash
npm run cv
```

Usa o Chrome ou o Edge instalados para gerar `public/cv/*.pdf`.

## Estrutura

```
server.js          servidor local
lib/app.js         núcleo do site: páginas, contacto e Brevo (local e Netlify)
lib/store.js       armazenamento: ficheiros locais ou Netlify Blobs
netlify/functions/ função do Netlify
lib/render.js      geração das páginas (PT e EN)
lib/admin.js       autenticação e API do backoffice
lib/legal.js       textos legais (privacidade, cookies, termos)
lib/themes.js      temas visuais
admin/            interface do backoffice (só no servidor local)
data/content.json  todos os conteúdos do site
public/            CSS, JavaScript, favicon e PDF do CV
tools/build-cv.js  gera os PDF do CV
```

## Autor

Samuel Camargo
