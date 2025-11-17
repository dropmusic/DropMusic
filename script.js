// --- JAVASCRIPT: Lógica e Interatividade (ATUALIZADO com MODO ADMIN) ---

// VARIÁVEL DE ADMINISTRAÇÃO
const ADMIN_PASSWORD = "Adm987654@"; // *** DEFINA A SUA SENHA AQUI (ATENÇÃO: Este é um exemplo, use uma senha segura) ***
let isAdmin = false; // Estado inicial: Variável de controle que indica se o usuário está logado como administrador

// Garante que o código só execute depois que o documento HTML estiver totalmente carregado
document.addEventListener('DOMContentLoaded', () => {
    // Carrega o conteúdo salvo (notícias e reviews) ao iniciar a página
    loadContent('noticia');
    loadContent('review');

        // Configura os links de navegação
        document.querySelectorAll('.nav-link').forEach(link => { 
         link.addEventListener('click', function() { 
            showPage(this.getAttribute('data-page')); 
         });
    });

        // Configura o envio do formulário de contato
        document.getElementById('contact-form').addEventListener('submit', function(event) { 
         // !!! REMOVIDO: event.preventDefault(); !!!
        // A função sendContactForm será chamada, mas o envio nativo (mailto:) não será bloqueado.
         sendContactForm(event); // Passamos o evento para a função
    });

     // Adiciona listener para a tecla Enter na barra de pesquisa
     document.getElementById('search-input').addEventListener('keydown', handleSearchKey); 
});

// --- FUNÇÕES DE ADMINISTRAÇÃO ---

function showAdminPrompt() {
    if (isAdmin) { // Verifica se o usuário JÁ é admin
        // Se já estiver logado, faz logout
        logoutAdmin(); // Chama a função para sair do modo administrador
        return; // Sai da função
    }
    
    // Mostra uma caixa de diálogo para o usuário digitar a senha
    const password = prompt("Digite a senha de administrador:");
    
    if (password === ADMIN_PASSWORD) { // Compara a senha digitada com a senha definida
        loginAdmin(); // Se a senha estiver correta, chama a função de login
    } else if (password !== null) { // Se o usuário digitou algo, mas estava incorreto
        alert("Senha incorreta."); // Exibe um alerta de erro (usando 'alert' pois é um contexto de teste/admin)
    }
}

function loginAdmin() {
    isAdmin = true; // Define a variável de controle para true
    
    // 1. Exibe o status de Admin
    document.getElementById('btn-admin-login').textContent = 'Sair do Modo Admin'; // Altera o texto do botão
    document.getElementById('admin-status').style.display = 'inline'; // Mostra o indicador de status admin

    // 2. Exibe os botões de criação (Notícias e Reviews)
    document.getElementById('admin-tools-noticias').style.display = 'block'; // Mostra o botão para criar notícias
    document.getElementById('admin-tools-reviews').style.display = 'block'; // Mostra o botão para criar reviews

    // 3. Recarrega as listas para exibir os botões "Excluir" nos posts
    loadContent('noticia'); // Recarrega notícias
    loadContent('review'); // Recarrega reviews
}

function logoutAdmin() {
    isAdmin = false; // Define a variável de controle para false
    
    // 1. Exibe o status de Admin
    document.getElementById('btn-admin-login').textContent = 'Modo Administrador'; // Retorna o texto original do botão
    document.getElementById('admin-status').style.display = 'none'; // Esconde o indicador de status admin

    // 2. Esconde os botões de criação e o formulário se estiver aberto
    document.getElementById('admin-tools-noticias').style.display = 'none'; // Esconde o botão de ferramentas de notícia
    document.getElementById('admin-tools-reviews').style.display = 'none'; // Esconde o botão de ferramentas de review
    document.getElementById('postagem-noticia').style.display = 'none'; // Garante que o formulário de notícia esteja escondido
    document.getElementById('postagem-review').style.display = 'none'; // Garante que o formulário de review esteja escondido

    // 3. Recarrega as listas para esconder os botões "Excluir"
    loadContent('noticia'); // Recarrega notícias (sem botões de exclusão)
    loadContent('review'); // Recarrega reviews (sem botões de exclusão)
}

// FUNÇÃO DE NAVEGAÇÃO
function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => { // Seleciona todos os contêineres de página
        page.classList.remove('active'); // Remove a classe 'active' de todas as páginas (escondendo-as)
    });
    document.getElementById(pageId).classList.add('active'); // Adiciona a classe 'active' à página selecionada (mostrando-a)

    document.querySelectorAll('.nav-link').forEach(link => { // Seleciona todos os links de navegação
        link.classList.remove('active'); // Remove o estilo 'active' de todos os links
    });
    // Adiciona o estilo 'active' apenas ao link que corresponde à página atual
    document.querySelector(`.nav-link[data-page="${pageId}"]`).classList.add('active'); 
}

// FUNÇÃO PARA MOSTRAR/ESCONDER FORMULÁRIOS (Protegida)
function toggleForm(elementId) {
    if (!isAdmin) return; // Se não for admin, impede a execução e retorna
    
    const formContainer = document.getElementById(elementId); // Obtém o elemento do contêiner do formulário
    const type = elementId.split('-')[1]; // Extrai o tipo ('noticia' ou 'review') do ID do elemento
    const button = document.getElementById(`btn-abrir-${type}`); // Obtém o botão de abrir/esconder o formulário
    // Define o texto original do botão baseado no tipo de conteúdo
    const originalText = type === 'noticia' ? 'Criar Nova Notícia' : 'Criar Novo Review'; 

    if (formContainer.style.display === 'none') { // Verifica se o formulário está escondido
        formContainer.style.display = 'block'; // Mostra o formulário
        button.textContent = 'Esconder Formulário'; // Altera o texto do botão
    } else {
        formContainer.style.display = 'none'; // Esconde o formulário
        button.textContent = originalText; // Retorna o texto original do botão
    }
}

// --- FUNÇÕES DE ARMAZENAMENTO E EXIBIÇÃO (PROTEGIDA) ---

/**
 * Cria o HTML para exibir um post na lista.
 * BOTÃO EXCLUIR SÓ É INCLUÍDO SE isAdmin FOR TRUE.
 * @param {object} post - O objeto de postagem.
 * @param {string} type - 'noticia' ou 'review'.
 */
function createPostHtml(post, type) {
    // Define qual campo de imagem usar ('imageLink' para notícia, 'reviewImageLink' para review)
    const imageLink = type === 'noticia' ? post.imageLink : post.reviewImageLink; 

    // Inicia a string HTML do item de postagem com estilos embutidos para exibição
    let html = `<div class="post-item" style="border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 4px; overflow: hidden;">`;
    
    // BOTÃO DE EXCLUSÃO (VISÍVEL SOMENTE PARA ADMIN)
    if (isAdmin) { // Verifica se o usuário é administrador
        // Adiciona o botão de exclusão com um evento onclick que chama deletePost
        html += `<button onclick="deletePost('${type}', ${post.timestamp})" 
                        style="float: right; background-color: #dc3545; color: white; border: none; 
                                padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                        Excluir
                    </button>`;
    }
    
    html += `<h3>${post.title}</h3>`; // Adiciona o título do post
    
    if (type === 'review' && post.nota) { // Se for review e tiver nota
        html += `<p style="font-weight: bold; color: #ff6600;">Nota: ${post.nota}</p>`; // Adiciona a nota em destaque
    }
    
    if (imageLink) { // Se houver link de imagem
        // Adiciona a tag <img> com o link e estilos para ser responsiva
        html += `<img src="${imageLink}" alt="Imagem do Post" style="max-width: 100%; height: auto; margin: 10px 0;">`;
    }

    // Adiciona o corpo do texto, substituindo quebras de linha (\n) por <br> (para formatar parágrafos)
    html += `<p>${post.body.replace(/\n/g, '<br>')}</p>`; 
    html += `</div>`; // Fecha a div do post-item
    
    return html; // Retorna o HTML gerado
}

/**
 * Carrega e exibe os posts salvos no localStorage.
 * @param {string} type - 'noticia' ou 'review'.
 */
function loadContent(type) {
    const key = `dropmusic_${type}s`; // Define a chave do localStorage (ex: 'dropmusic_noticias')
    // Recupera os dados do localStorage e os converte de JSON para objeto (ou um array vazio se não houver dados)
    const posts = JSON.parse(localStorage.getItem(key)) || []; 
    const listContainer = document.getElementById(`lista-${type}s`); // Obtém o contêiner onde os posts serão exibidos
    
    if (listContainer) { // Verifica se o contêiner existe
        if (posts.length === 0) { // Se não houver posts salvos
            listContainer.innerHTML = `<p>Nenhum ${type} publicado ainda.</p>`; // Exibe uma mensagem de vazio
        } else {
            listContainer.innerHTML = ''; // Limpa o conteúdo atual do contêiner
            // Itera sobre o array de posts
            posts.forEach(post => { 
                // Adiciona o HTML de cada post ao contêiner
                listContainer.innerHTML += createPostHtml(post, type); 
            });
        }
    }
}


// --- FUNÇÃO DE EXCLUSÃO (PROTEGIDA) ---

function deletePost(type, timestamp) {
    if (!isAdmin) { // Verifica se o usuário não é admin
        alert("Você precisa estar no Modo Administrador para excluir conteúdo."); // Alerta o usuário
        return; // Sai da função
    }
    
    // Pede confirmação antes de excluir
    if (!confirm("Tem certeza que deseja excluir esta postagem?")) { 
        return; // Se o usuário cancelar, sai da função
    }

    const key = `dropmusic_${type}s`; // Define a chave do localStorage
    let posts = JSON.parse(localStorage.getItem(key)) || []; // Carrega os posts

    // Filtra o array, mantendo apenas os posts cujo timestamp é diferente do post a ser excluído
    posts = posts.filter(post => post.timestamp !== timestamp); 

    // Salva o novo array (sem o post excluído) de volta no localStorage
    localStorage.setItem(key, JSON.stringify(posts)); 

    loadContent(type); // Recarrega e exibe a lista atualizada
}


// --- FUNÇÕES DE POSTAGEM (PROTEGIDA) ---

function postContent(type) {
    if (!isAdmin) { // Verifica se o usuário não é admin
        alert("Você precisa estar no Modo Administrador para postar conteúdo."); // Alerta
        return; // Sai da função
    }
    
    let title, body, nota, statusElementId; // Declara variáveis
    let newPost = {}; // Cria um novo objeto para o post
    const key = `dropmusic_${type}s`; // Define a chave do localStorage

    if (type === 'noticia') { // Lógica específica para Notícia
        title = document.getElementById('noticia-titulo').value; // Captura o valor do título
        body = document.getElementById('noticia-corpo').value; // Captura o valor do corpo
        newPost.imageLink = document.getElementById('noticia-imagem').value; // Captura o link da imagem
        statusElementId = 'noticia-status'; // Define o ID do elemento de status

        if (!title || !body) { // Validação de campos obrigatórios
             document.getElementById(statusElementId).textContent = "Preencha o título e o corpo da notícia."; // Mensagem de erro
             document.getElementById(statusElementId).style.color = 'red'; // Cor vermelha para erro
             return; // Sai da função
        }
    } else if (type === 'review') { // Lógica específica para Review
        title = document.getElementById('review-titulo').value; // Captura o valor do título
        body = document.getElementById('review-corpo').value; // Captura o valor do corpo
        nota = document.getElementById('review-nota').value; // Captura o valor da nota
        newPost.reviewImageLink = document.getElementById('review-imagem').value; // Captura o link da imagem
        statusElementId = 'review-status'; // Define o ID do elemento de status
        newPost.nota = nota; // Adiciona a nota ao objeto

        if (!title || !body || !nota) { // Validação de campos obrigatórios
             document.getElementById(statusElementId).textContent = "Preencha o título, o corpo do review e a nota."; // Mensagem de erro
             document.getElementById(statusElementId).style.color = 'red'; // Cor vermelha para erro
             return; // Sai da função
        }
    }
    
    newPost.title = title; // Adiciona o título ao objeto
    newPost.body = body; // Adiciona o corpo ao objeto
    newPost.timestamp = new Date().getTime(); // Adiciona um timestamp único para identificação (e ordenação)
    
    const posts = JSON.parse(localStorage.getItem(key)) || []; // Carrega os posts existentes
    posts.unshift(newPost); // Adiciona o novo post no início do array (para aparecer primeiro)
    localStorage.setItem(key, JSON.stringify(posts)); // Salva o array atualizado no localStorage
    
    loadContent(type); // Recarrega a lista de conteúdo na página

    document.getElementById(statusElementId).textContent = `Conteúdo (${type}) salvo e publicado!`; // Mensagem de sucesso
    document.getElementById(statusElementId).style.color = 'green'; // Cor verde para sucesso
    
    document.querySelector(`#${type} .content-form`).reset(); // Limpa os campos do formulário
    toggleForm(`postagem-${type}`); // Esconde o formulário após postar
}


// --- FUNÇÕES DE CONTATO E BUSCA (ATUALIZADAS) ---

function sendContactForm(event) {
    const nome = document.getElementById('contato-nome').value; 
    const email = document.getElementById('contato-email').value; 
    const mensagem = document.getElementById('contato-mensagem').value; 
    const statusElement = document.getElementById('contato-status'); 

     // Validação (feita pelo HTML 'required' e pelo JS)
     if (!nome || !email || !mensagem) {
         statusElement.textContent = "Preencha todos os campos."; 
            statusElement.style.color = 'red'; 
        // Se a validação falhar, ainda precisamos prevenir o envio, 
        // pois o preventDefault foi removido do listener principal.
        event.preventDefault(); 
        return; 
    }

    // SIMULAÇÃO: Envio de Contato (no mundo real, aqui haveria uma chamada a um servidor)
    console.log(`Formulário de Contato enviado:`); // Log no console
    console.log(`- Nome: ${nome}`); // Log do nome
    console.log(`- Email: ${email}`); // Log do email
    console.log(`- Mensagem: ${mensagem}`); // Log da mensagem
    
    statusElement.textContent = `Obrigado, ${nome}! Sua mensagem foi enviada.`; // Mensagem de sucesso para o usuário
    statusElement.style.color = 'blue'; // Cor azul para o status

    document.getElementById('contact-form').reset(); // Limpa o formulário após o envio
}

function searchSite() {
    const query = document.getElementById('search-input').value; // Captura o termo de busca
    if (query.trim() === "") { // Verifica se a busca está vazia ou só com espaços
        alert("Por favor, digite algo para pesquisar."); // Alerta o usuário
        return; // Sai da função
    }
    console.log(`Simulando busca por: "${query}"`); // Log no console
    alert(`Simulando busca no site por: "${query}"`); // Alerta a simulação de busca (Contexto de teste)
}

function handleSearchKey(event) {
    if (event.key === 'Enter') { // Se a tecla pressionada for 'Enter'
        searchSite(); // Chama a função de busca
    }
}
function handlePostKey(event, type) {
    if (event.key === 'Enter') { // Se a tecla pressionada for 'Enter'
        event.preventDefault(); // Impede o comportamento padrão do Enter (como envio de formulário)
        postContent(type); // Chama a função de postagem
    }
}
function handleContactKey(event) {
    // Esta função está aqui apenas para conformidade e não faz nada, pois o formulário é tratado no evento 'submit'
}