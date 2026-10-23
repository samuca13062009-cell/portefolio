'use strict';
// Textos legais (PT e EN). Cada secção tem um título e parágrafos/listas já em HTML seguro:
// os únicos valores variáveis (nome, email, endereços) são escapados por quem os passa.

const UPDATED = { pt: '23 de outubro de 2026', en: '23 October 2026' };
// Muda quando o texto da política de privacidade muda; fica registado com cada consentimento.
const PRIVACY_VERSION = '2026-10-23.2';

function legal(lang, v) {
  // v: { name, location, contact (HTML: email ou ligação para o formulário), privacyUrl, cookiesUrl, termsUrl, contactUrl }
  const pt = lang === 'pt';

  const privacy = pt ? {
    title: 'Política de Privacidade',
    intro: `Esta política explica que dados pessoais este website trata, porquê, durante quanto tempo e que direitos tem. Aplica-se o Regulamento Geral sobre a Proteção de Dados (RGPD) e a Lei n.º 58/2019.`,
    sections: [
      ['Quem é o responsável', [
        `<p>O responsável pelo tratamento é ${v.name}, pessoa singular, com residência em ${v.location}. Este é um website pessoal, sem fins comerciais: não vende produtos nem serviços.</p>`,
        `<p>Contacto para qualquer assunto de privacidade: ${v.contact}.</p>`,
      ]],
      ['Que dados são recolhidos e para quê', [
        `<p><strong>Formulário de contacto.</strong> Nome, email, assunto e mensagem, a data e hora do envio e o registo de que aceitou esta política. Servem apenas para ler e responder à sua mensagem. Fundamento: o seu consentimento (artigo 6.º, n.º 1, alínea a) do RGPD), dado ao marcar a caixa antes de enviar.</p>`,
        `<p><strong>Confirmação do email.</strong> Para garantir que o email existe e é seu, é verificado se o domínio do email pode receber mensagens e é-lhe enviado um email com uma ligação de confirmação. A mensagem só chega ao autor depois de confirmar. O email de confirmação não repete o texto da mensagem.</p>`,
        `<p><strong>Proteção contra abusos.</strong> O endereço IP de quem envia o formulário ou tenta entrar na área reservada é usado para limitar pedidos repetidos. Só é guardado transformado num código cifrado que não permite recuperar o IP, e apagado ao fim de 15 minutos no máximo. Fundamento: interesse legítimo em manter o website seguro (artigo 6.º, n.º 1, alínea f) do RGPD).</p>`,
        `<p><strong>Estatísticas de visitas.</strong> O servidor conta quantas vezes cada página é vista e quantas pessoas visitam o website por dia. Para não contar a mesma pessoa duas vezes no mesmo dia, calcula um código cifrado a partir do endereço IP e do navegador, com um segredo que muda todos os dias. O endereço IP não é guardado; o código não permite saber quem é nem seguir a mesma pessoa de um dia para o outro, e é apagado no dia seguinte. Não são usados cookies para isto. Fundamento: interesse legítimo em saber, de forma agregada, se o portefólio é visitado (artigo 6.º, n.º 1, alínea f) do RGPD).</p>`,
        `<p>Não são recolhidos dados de categorias especiais (por exemplo, saúde ou religião). Por favor, não os inclua na mensagem.</p>`,
      ]],
      ['É obrigatório dar estes dados?', [
        `<p>Não. Só são precisos se quiser escrever-me. Sem nome, email e mensagem não consigo responder-lhe. Também pode contactar-me pelo LinkedIn.</p>`,
      ]],
      ['Quem recebe os dados', [
        `<ul>
<li><strong>Brevo</strong> (Sendinblue SAS, França): entrega a mensagem por email ao responsável. Atua como subcontratante, segundo as suas condições de tratamento de dados, e guarda os dados na União Europeia.</li>
<li><strong>Fornecedor de email do responsável</strong>, onde a mensagem é recebida e respondida.</li>
<li><strong>Netlify, Inc.</strong> (Estados Unidos): aloja o website e guarda as mensagens do formulário. Como qualquer servidor web, regista dados técnicos dos pedidos, incluindo o endereço IP, segundo a sua própria política de privacidade.</li>
</ul>`,
        `<p>Os dados não são vendidos, nem usados para publicidade, nem partilhados com mais ninguém, salvo se a lei o exigir.</p>`,
      ]],
      ['Transferências para fora do Espaço Económico Europeu', [
        `<p>O Netlify está nos Estados Unidos, e o fornecedor de email pode tratar dados fora do Espaço Económico Europeu. Essas transferências só acontecem com as garantias previstas no RGPD: uma decisão de adequação da Comissão Europeia (como o Quadro de Privacidade de Dados UE-EUA) ou cláusulas contratuais-tipo, incluídas nos acordos de tratamento de dados destes fornecedores.</p>`,
      ]],
      ['Durante quanto tempo', [
        `<p>As mensagens do formulário são apagadas automaticamente 12 meses depois de recebidas, ou antes, se o pedir. Os emails trocados consigo seguem o mesmo prazo.</p>`,
        `<p>As mensagens cujo email não foi confirmado são apagadas ao fim de 48 horas. As que o sistema bloqueia como publicidade ou spam são apagadas ao fim de 30 dias e nunca são enviadas por email.</p>`,
      ]],
      ['Os seus direitos', [
        `<p>Pode pedir acesso aos seus dados, a sua correção, apagamento, limitação do tratamento ou portabilidade, e opor-se ao tratamento baseado em interesse legítimo. Pode retirar o consentimento a qualquer momento, o que não afeta o tratamento feito até aí. Basta escrever para ${v.contact}. A resposta é dada no prazo de um mês.</p>`,
        `<p>Se considerar que os seus dados não foram bem tratados, pode apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD), em <a href="https://www.cnpd.pt" target="_blank" rel="noopener">www.cnpd.pt<span class="sr"> (abre noutro separador)</span></a>.</p>`,
      ]],
      ['Decisões automatizadas', [
        `<p>Não há decisões automatizadas nem definição de perfis.</p>`,
      ]],
      ['Menores', [
        `<p>Este website destina-se a recrutadores, escolas e empresas. Se tiver menos de 13 anos, não envie dados pelo formulário (artigo 16.º da Lei n.º 58/2019).</p>`,
      ]],
      ['Cookies', [
        `<p>Veja a <a href="${v.cookiesUrl}">Política de Cookies</a>.</p>`,
      ]],
      ['Alterações', [
        `<p>Se esta política mudar, a nova versão é publicada nesta página com a data de atualização.</p>`,
      ]],
    ],
  } : {
    title: 'Privacy Policy',
    intro: `This policy explains what personal data this website processes, why, for how long and what rights you have. The EU General Data Protection Regulation (GDPR) and Portuguese Law 58/2019 apply.`,
    sections: [
      ['Who is responsible', [
        `<p>The data controller is ${v.name}, a private individual living in ${v.location}. This is a personal, non-commercial website: it does not sell products or services.</p>`,
        `<p>Contact for any privacy matter: ${v.contact}.</p>`,
      ]],
      ['What data is collected and why', [
        `<p><strong>Contact form.</strong> Your name, email, subject and message, the date and time it was sent, and a record that you accepted this policy. They are used only to read and reply to your message. Legal basis: your consent (GDPR Article 6(1)(a)), given by ticking the box before sending.</p>`,
        `<p><strong>Email confirmation.</strong> To make sure the email exists and is yours, the system checks that the email's domain can receive mail and sends you an email with a confirmation link. The message only reaches the author after you confirm. The confirmation email does not repeat your message.</p>`,
        `<p><strong>Abuse protection.</strong> The IP address of anyone sending the form or trying to sign in to the admin area is used to limit repeated requests. It is only stored converted into an encrypted code from which the IP cannot be recovered, and deleted after 15 minutes at most. Legal basis: legitimate interest in keeping the website secure (GDPR Article 6(1)(f)).</p>`,
        `<p><strong>Visit statistics.</strong> The server counts how many times each page is viewed and how many people visit the website per day. So as not to count the same person twice on the same day, it computes an encrypted code from the IP address and the browser, using a secret that changes every day. The IP address is not stored; the code cannot tell who you are or follow the same person from one day to the next, and it is deleted the next day. No cookies are used for this. Legal basis: legitimate interest in knowing, in aggregate, whether the portfolio is visited (Article 6(1)(f) GDPR).</p>`,
        `<p>No special category data (for example health or religion) is collected. Please do not include it in your message.</p>`,
      ]],
      ['Do you have to provide this data?', [
        `<p>No. It is only needed if you want to write to me. Without a name, email and message I cannot reply. You can also contact me on LinkedIn.</p>`,
      ]],
      ['Who receives the data', [
        `<ul>
<li><strong>Brevo</strong> (Sendinblue SAS, France): delivers the message by email to the controller. It acts as a processor under its data processing terms and stores the data in the European Union.</li>
<li><strong>The controller's email provider</strong>, where the message is received and answered.</li>
<li><strong>Netlify, Inc.</strong> (United States): hosts the website and stores contact form messages. Like any web server, it logs technical request data, including the IP address, under its own privacy policy.</li>
</ul>`,
        `<p>The data is not sold, not used for advertising and not shared with anyone else, unless the law requires it.</p>`,
      ]],
      ['Transfers outside the European Economic Area', [
        `<p>Netlify is based in the United States, and the email provider may process data outside the European Economic Area. These transfers only happen with the safeguards set out in the GDPR: a European Commission adequacy decision (such as the EU-US Data Privacy Framework) or standard contractual clauses, included in these providers' data processing agreements.</p>`,
      ]],
      ['How long', [
        `<p>Contact form messages are deleted automatically 12 months after they are received, or sooner if you ask. Emails exchanged with you follow the same period.</p>`,
        `<p>Messages whose email was not confirmed are deleted after 48 hours. Those the system blocks as advertising or spam are deleted after 30 days and are never sent by email.</p>`,
      ]],
      ['Your rights', [
        `<p>You can ask for access to your data, its correction, erasure, restriction of processing or portability, and object to processing based on legitimate interest. You can withdraw consent at any time, without affecting processing carried out before. Just write to ${v.contact}. You will get a reply within one month.</p>`,
        `<p>If you believe your data was not handled properly, you can complain to the Portuguese data protection authority (CNPD) at <a href="https://www.cnpd.pt" target="_blank" rel="noopener">www.cnpd.pt<span class="sr"> (opens in a new tab)</span></a>, or to the authority in your own EU country.</p>`,
      ]],
      ['Automated decisions', [
        `<p>There is no automated decision-making or profiling.</p>`,
      ]],
      ['Children', [
        `<p>This website is meant for recruiters, schools and companies. If you are under 13, do not send data through the form.</p>`,
      ]],
      ['Cookies', [
        `<p>See the <a href="${v.cookiesUrl}">Cookie Policy</a>.</p>`,
      ]],
      ['Changes', [
        `<p>If this policy changes, the new version is published on this page with its update date.</p>`,
      ]],
    ],
  };

  const cookies = pt ? {
    title: 'Política de Cookies',
    intro: `Este website não usa cookies de análise, de publicidade nem de terceiros, e não mostra conteúdos incorporados de outros sites. Por isso não precisa de lhe pedir consentimento para cookies.`,
    sections: [
      ['O que fica guardado no seu navegador', [
        `<div class="table-wrap"><table>
<thead><tr><th scope="col">Nome</th><th scope="col">Tipo</th><th scope="col">Para quê</th><th scope="col">Duração</th></tr></thead>
<tbody>
<tr><td><code>tema</code></td><td>Armazenamento local</td><td>Lembrar se escolheu o modo claro ou escuro.</td><td>Até o apagar no navegador</td></tr>
<tr><td><code>skin</code>, <code>skinBase</code></td><td>Armazenamento local</td><td>Lembrar o tema visual que escolheu no menu Tema.</td><td>Até o apagar no navegador</td></tr>
<tr><td><code>nao-contar</code></td><td>Cookie</td><td>Só no navegador do autor do website, quando ele o pede: faz com que as suas próprias visitas não contem nas estatísticas. Nunca é colocado aos visitantes.</td><td>2 anos</td></tr>
</tbody>
</table></div>`,
        `<p>As preferências <code>tema</code>, <code>skin</code> e <code>skinBase</code> só são guardadas quando carrega no botão correspondente, nunca são enviadas para o servidor e não o identificam.</p>`,
      ]],
      ['Porque não há aviso de cookies', [
        `<p>A lei portuguesa (artigo 5.º da Lei n.º 41/2004, que transpõe a Diretiva ePrivacy) só dispensa o consentimento para o que é estritamente necessário para prestar um serviço pedido expressamente por si. É o caso aqui: a sessão da área reservada e as preferências de aparência que escolhe. Não há mais nada guardado.</p>`,
      ]],
      ['Serviços de terceiros', [
        `<p>As fontes de letra estão alojadas neste próprio servidor, por isso a sua visita não é comunicada a nenhum serviço externo. As ligações para o LinkedIn e o GitHub são ligações simples: esses sites só aplicam as suas próprias políticas se as abrir.</p>`,
      ]],
      ['Como apagar', [
        `<p>Pode apagar estes dados a qualquer momento nas definições do seu navegador (dados de sites ou cookies). O website continua a funcionar, com o aspeto por omissão.</p>`,
      ]],
      ['Mais informação', [
        `<p>Veja a <a href="${v.privacyUrl}">Política de Privacidade</a>.</p>`,
      ]],
    ],
  } : {
    title: 'Cookie Policy',
    intro: `This website uses no analytics, advertising or third-party cookies, and shows no content embedded from other sites. That is why it does not need to ask for your consent to cookies.`,
    sections: [
      ['What is stored in your browser', [
        `<div class="table-wrap"><table>
<thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Purpose</th><th scope="col">Duration</th></tr></thead>
<tbody>
<tr><td><code>tema</code></td><td>Local storage</td><td>Remember whether you chose light or dark mode.</td><td>Until you clear it in your browser</td></tr>
<tr><td><code>skin</code>, <code>skinBase</code></td><td>Local storage</td><td>Remember the visual theme you picked in the Theme menu.</td><td>Until you clear it in your browser</td></tr>
<tr><td><code>nao-contar</code></td><td>Cookie</td><td>Only in the website author's own browser, when he asks for it: stops his own visits from counting in the statistics. Never set for visitors.</td><td>2 years</td></tr>
</tbody>
</table></div>`,
        `<p>The <code>tema</code>, <code>skin</code> and <code>skinBase</code> preferences are only stored when you press the matching button, are never sent to the server and do not identify you.</p>`,
      ]],
      ['Why there is no cookie banner', [
        `<p>Portuguese law (Article 5 of Law 41/2004, which implements the ePrivacy Directive) exempts from consent only what is strictly necessary to provide a service you explicitly asked for. That is the case here: the admin area session and the appearance preferences you choose. Nothing else is stored.</p>`,
      ]],
      ['Third-party services', [
        `<p>Fonts are hosted on this server, so your visit is not reported to any outside service. The LinkedIn and GitHub links are plain links: those sites only apply their own policies if you open them.</p>`,
      ]],
      ['How to delete', [
        `<p>You can delete this data at any time in your browser settings (site data or cookies). The website keeps working with its default look.</p>`,
      ]],
      ['More information', [
        `<p>See the <a href="${v.privacyUrl}">Privacy Policy</a>.</p>`,
      ]],
    ],
  };

  const terms = pt ? {
    title: 'Termos de Utilização',
    intro: `Ao usar este website aceita estes termos. São curtos porque o website é simples: serve para apresentar o percurso e os projetos de ${v.name}.`,
    sections: [
      ['Quem gere o website', [
        `<p>${v.name}, pessoa singular, ${v.location}. Contacto: ${v.contact}. O website não tem fins comerciais: não vende produtos nem serviços, e por isso não há preços, pagamentos, encomendas nem devoluções.</p>`,
      ]],
      ['Conteúdos e direitos de autor', [
        `<p>Os textos, o design, o CV e o código deste website são de ${v.name}, salvo indicação em contrário. Pode ver, imprimir e partilhar ligações para as páginas e descarregar o CV para avaliar uma candidatura. Não pode copiar nem republicar os conteúdos sem autorização.</p>`,
        `<p>O código-fonte está publicado no GitHub para consulta. Enquanto o repositório não indicar uma licença, a sua reutilização também precisa de autorização.</p>`,
        `<p>As fontes de letra são usadas ao abrigo da licença SIL Open Font License 1.1. LinkedIn, GitHub, Android, Arduino e outros nomes referidos pertencem aos respetivos titulares e são mencionados apenas para descrever tecnologias e ligações.</p>`,
      ]],
      ['Formulário de contacto', [
        `<p>Use o formulário apenas para contactos legítimos. Não é permitido enviar publicidade não solicitada, conteúdos ilegais ou tentar comprometer a segurança do website. O tratamento dos dados enviados está descrito na <a href="${v.privacyUrl}">Política de Privacidade</a>.</p>`,
      ]],
      ['Exatidão e disponibilidade', [
        `<p>A informação sobre experiência, formação e projetos é dada de boa-fé e atualizada sempre que possível. O website pode estar indisponível por manutenção ou falhas técnicas.</p>`,
      ]],
      ['Ligações externas', [
        `<p>As ligações para outros sites (por exemplo, LinkedIn e GitHub) são dadas por conveniência. Esses sites têm os seus próprios termos e políticas.</p>`,
      ]],
      ['Responsabilidade', [
        `<p>Na medida permitida por lei, ${v.name} não responde por danos resultantes do uso do website ou da impossibilidade de o usar. Nada nestes termos limita direitos que a lei lhe garanta e que não possam ser afastados.</p>`,
      ]],
      ['Lei aplicável', [
        `<p>Estes termos regem-se pela lei portuguesa. Os litígios são resolvidos pelos tribunais portugueses competentes nos termos da lei.</p>`,
      ]],
      ['Alterações', [
        `<p>Estes termos podem ser atualizados. A versão em vigor é a publicada nesta página, com a data de atualização.</p>`,
      ]],
    ],
  } : {
    title: 'Terms of Use',
    intro: `By using this website you accept these terms. They are short because the website is simple: it presents the background and projects of ${v.name}.`,
    sections: [
      ['Who runs the website', [
        `<p>${v.name}, a private individual, ${v.location}. Contact: ${v.contact}. The website is non-commercial: it does not sell products or services, so there are no prices, payments, orders or refunds.</p>`,
      ]],
      ['Content and copyright', [
        `<p>The text, design, CV and code of this website belong to ${v.name}, unless stated otherwise. You may view and print the pages, share links to them and download the CV to assess an application. You may not copy or republish the content without permission.</p>`,
        `<p>The source code is published on GitHub for reference. Until the repository states a licence, reusing it also requires permission.</p>`,
        `<p>The fonts are used under the SIL Open Font License 1.1. LinkedIn, GitHub, Android, Arduino and other names mentioned belong to their owners and are used only to describe technologies and links.</p>`,
      ]],
      ['Contact form', [
        `<p>Use the form only for legitimate contact. Sending unsolicited advertising or unlawful content, or trying to compromise the website's security, is not allowed. How the data you send is handled is described in the <a href="${v.privacyUrl}">Privacy Policy</a>.</p>`,
      ]],
      ['Accuracy and availability', [
        `<p>Information about experience, education and projects is given in good faith and kept up to date where possible. The website may be unavailable during maintenance or technical failures.</p>`,
      ]],
      ['External links', [
        `<p>Links to other sites (for example LinkedIn and GitHub) are provided for convenience. Those sites have their own terms and policies.</p>`,
      ]],
      ['Liability', [
        `<p>To the extent permitted by law, ${v.name} is not liable for damage resulting from using or being unable to use the website. Nothing in these terms limits rights the law gives you that cannot be excluded.</p>`,
      ]],
      ['Governing law', [
        `<p>These terms are governed by Portuguese law. Disputes are settled by the Portuguese courts that have jurisdiction under the law.</p>`,
      ]],
      ['Changes', [
        `<p>These terms may be updated. The version in force is the one published on this page, with its update date.</p>`,
      ]],
    ],
  };

  return { privacy, cookies, terms, updated: UPDATED[lang] };
}

module.exports = { legal, PRIVACY_VERSION };
