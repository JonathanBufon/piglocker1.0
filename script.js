document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES GLOBAIS ---
    const loginScreen = document.getElementById('login-screen');
    const mainScreen = document.getElementById('main-screen');
    const contentTitle = document.getElementById('content-title');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    const contentSections = document.querySelectorAll('.content-section');
    const listaCredenciaisContainer = document.getElementById('lista-credenciais-container');
    const tableBody = listaCredenciaisContainer.querySelector('.table-body-custom');

    const showFormNovaCredencialBtn = document.getElementById('show-form-nova-credencial');
    const profileIconTrigger = document.getElementById('profile-icon-trigger');
    const profileMenuDropdown = document.getElementById('profile-menu-dropdown');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const logoutBtn = document.getElementById('logout-btn');

    const novoForm = document.getElementById('novo-form');
    const editForm = document.getElementById('edit-form');
    
    const modalExcluir = document.getElementById('modal-excluir-item');
    const confirmarExclusaoBtn = document.getElementById('confirmar-exclusao-btn');
    const cancelarExclusaoBtn = document.getElementById('cancelar-exclusao-btn');
    let itemIdParaExcluir = null;

    // --- FUNÇÕES DE LÓGICA PRINCIPAL ---

    // Verifica se já existe uma sessão ativa ao carregar a página
    const checkUserSession = async () => {
        try {
            // AJUSTE: Adicionado 'backend/' ao caminho
            const response = await fetch('backend/check_session.php');
            const result = await response.json();
            if (result.status === 'success' && result.loggedin) {
                showMainScreen(result.email); // Se logado, mostra a tela principal
            } else {
                showLoginScreen(); // Senão, mostra a tela de login
            }
        } catch (error) {
            console.error("Erro ao verificar sessão:", error);
            showLoginScreen();
        }
    };

    const showLoginScreen = () => {
        loginScreen.classList.add('active');
        mainScreen.classList.remove('active');
    };

    const showMainScreen = (userEmail) => {
        loginScreen.classList.remove('active');
        mainScreen.classList.add('active');
        document.getElementById('mc-email').value = userEmail; // Atualiza e-mail na seção "Minha Conta"
        const initial = userEmail.substring(0, 2).toUpperCase();
        profileIconTrigger.textContent = initial; // Atualiza ícone do perfil
        switchContentSection('lista-credenciais-container', 'Todos os cofres');
        carregarCredenciais();
    };

    // Lógica de Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.style.display = 'none';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // AJUSTE: Adicionado 'backend/' ao caminho
            const response = await fetch('backend/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();

            if (result.status === 'success') {
                showMainScreen(email);
            } else {
                loginError.textContent = result.message || 'Erro desconhecido.';
                loginError.style.display = 'block';
            }
        } catch (error) {
            loginError.textContent = 'Erro de comunicação com o servidor.';
            loginError.style.display = 'block';
            console.error("Erro no fetch (login):", error);
        }
    });

    // Lógica de Logout
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            // AJUSTE: Adicionado 'backend/' ao caminho
            await fetch('backend/logout.php');
            window.location.reload(); // Recarrega a página, o checkUserSession vai mostrar a tela de login
        } catch (error) {
            console.error("Erro no logout:", error);
            alert("Não foi possível encerrar a sessão.");
        }
    });

    // Carrega e renderiza as credenciais na tabela
    const carregarCredenciais = async () => {
        try {
            // AJUSTE: Adicionado 'backend/' ao caminho
            const response = await fetch('backend/listar_credenciais.php');
            const result = await response.json();

            tableBody.innerHTML = ''; // Limpa a tabela antes de preencher

            if (result.status === 'success' && result.data.length > 0) {
                result.data.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'table-row-custom';
                    row.dataset.id = item.id; // IMPORTANTE: Armazena o ID do BD
                    row.dataset.nome = item.nome;
                    row.dataset.login = item.login;
                    row.dataset.site = item.site;

                    row.innerHTML = `
                        <input type="checkbox" />
                        <span>${item.nome}</span>
                        <span>${item.login}</span>
                        <div class="actions-menu">
                            <button class="action-btn">&#8942;</button>
                            <div class="actions-dropdown" style="display:none;">
                                <a href="#" class="edit-credential-btn">[E] Editar</a>
                                <a href="#" class="delete-credential-btn delete-action">[X] Excluir</a>
                            </div>
                        </div>
                    `;
                    tableBody.appendChild(row);
                });
            }
            updateEmptyListMessage();
        } catch (error) {
            console.error("Erro ao carregar credenciais:", error);
        }
    };
    
    // --- FUNÇÕES AUXILIARES E EVENT LISTENERS ---

    function switchContentSection(targetSectionId, newTitle) {
        contentSections.forEach(section => {
            section.style.display = 'none';
        });
        const targetSection = document.getElementById(targetSectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            if (contentTitle) contentTitle.textContent = newTitle;
        }
        closeAllDropdowns();
    }
    
    function updateEmptyListMessage() {
        const emptyMessage = listaCredenciaisContainer.querySelector('.empty-list-message');
        const items = tableBody.querySelectorAll('.table-row-custom');
        emptyMessage.style.display = items.length === 0 ? 'block' : 'none';
    }

    showFormNovaCredencialBtn.addEventListener('click', () => {
        novoForm.reset();
        switchContentSection('form-nova-credencial-container', 'Criar nova credencial');
    });

    // Delegação de eventos para botões de ação (Editar, Excluir, etc.)
    listaCredenciaisContainer.addEventListener('click', (e) => {
        // Dropdown de ações (...)
        if (e.target.classList.contains('action-btn')) {
            e.stopPropagation();
            const dropdown = e.target.nextElementSibling;
            const currentDisplay = dropdown.style.display;
            closeAllDropdowns();
            dropdown.style.display = currentDisplay === 'block' ? 'none' : 'block';
        }
        // Botão Editar
        if (e.target.classList.contains('edit-credential-btn')) {
            e.preventDefault();
            const row = e.target.closest('.table-row-custom');
            const { id, nome, login, site } = row.dataset;
            
            document.getElementById('edit-credential-id').value = id;
            document.getElementById('edit-nome-item').value = nome;
            document.getElementById('edit-login').value = login;
            document.getElementById('edit-site').value = site || '';
            document.getElementById('edit-senha').value = '';

            switchContentSection('form-editar-credencial-container', 'Editar credencial');
        }
        // Botão Excluir
        if (e.target.classList.contains('delete-credential-btn')) {
            e.preventDefault();
            const row = e.target.closest('.table-row-custom');
            itemIdParaExcluir = row.dataset.id;
            abrirModalExclusao();
        }
    });

    // Salvar nova credencial
    novoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new URLSearchParams();
        formData.append('nome', document.getElementById('novo-nome-item').value);
        formData.append('login', document.getElementById('novo-login').value);
        formData.append('senha', document.getElementById('novo-senha').value);
        formData.append('site', document.getElementById('novo-site').value);

        try {
            // AJUSTE: Adicionado 'backend/' ao caminho
            const response = await fetch('backend/salvar_senha.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.status === 'success') {
                alert(result.message);
                switchContentSection('lista-credenciais-container', 'Todos os cofres');
                carregarCredenciais();
            } else {
                alert(result.message || 'Erro ao salvar.');
            }
        } catch (error) {
            console.error("Erro no fetch (nova credencial):", error);
            alert("Erro de comunicação ao tentar salvar.");
        }
    });

    // Salvar edição de credencial
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-credential-id').value;
        const data = {
            id: id,
            nome: document.getElementById('edit-nome-item').value,
            login: document.getElementById('edit-login').value,
            site: document.getElementById('edit-site').value,
            senha: document.getElementById('edit-senha').value // Envia mesmo se vazio, o backend decide o que fazer
        };

        try {
            // AJUSTE: Adicionado 'backend/' ao caminho
            const response = await fetch('backend/atualizar_senha.php', {
                method: 'POST', // ou PUT
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            alert(result.message);
            if (result.status === 'success') {
                switchContentSection('lista-credenciais-container', 'Todos os cofres');
                carregarCredenciais();
            }
        } catch (error) {
            console.error("Erro no fetch (editar credencial):", error);
            alert("Erro de comunicação ao tentar salvar.");
        }
    });

    // Delegação para o botão de excluir dentro do formulário de edição
    editForm.querySelector('.delete-from-edit-btn').addEventListener('click', () => {
        itemIdParaExcluir = document.getElementById('edit-credential-id').value;
        abrirModalExclusao();
    });

    // Confirmar exclusão no modal
    confirmarExclusaoBtn.addEventListener('click', async () => {
        if (!itemIdParaExcluir) return;
        
        try {
            // AJUSTE: Adicionado 'backend/' ao caminho
            const response = await fetch('backend/excluir_senha.php', {
                method: 'POST', // ou DELETE
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: itemIdParaExcluir })
            });
            const result = await response.json();
            alert(result.message);
            if (result.status === 'success') {
                fecharModalExclusao();
                switchContentSection('lista-credenciais-container', 'Todos os cofres');
                carregarCredenciais();
            }
        } catch (error) {
            console.error("Erro no fetch (excluir credencial):", error);
            alert("Erro de comunicação ao tentar excluir.");
        }
    });

    // --- Outros Listeners e Funções (navegação, modais, etc.) ---
    function abrirModalExclusao() {
        if (modalExcluir) modalExcluir.style.display = 'flex';
    }
    function fecharModalExclusao() {
        if (modalExcluir) modalExcluir.style.display = 'none';
        itemIdParaExcluir = null;
    }

    cancelarExclusaoBtn.addEventListener('click', fecharModalExclusao);
    if (modalExcluir) {
        modalExcluir.querySelector('.modal-close-btn')?.addEventListener('click', fecharModalExclusao);
        modalExcluir.addEventListener('click', (e) => {
            if (e.target === modalExcluir) fecharModalExclusao();
        });
    }
    
    document.querySelectorAll('.cancel-form-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchContentSection('lista-credenciais-container', 'Todos os cofres');
        });
    });

    function closeAllDropdowns() {
        if (profileMenuDropdown) profileMenuDropdown.style.display = 'none';
        document.querySelectorAll('.actions-dropdown').forEach(dd => dd.style.display = 'none');
    }
    profileIconTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentDisplay = profileMenuDropdown.style.display;
        closeAllDropdowns();
        profileMenuDropdown.style.display = currentDisplay === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', () => closeAllDropdowns());
    
    // Lembrar e-mail
    const rememberLink = document.querySelector('#login-screen .link');
    const emailLoginInput = document.getElementById('email');
    if (localStorage.getItem('savedEmail')) {
        emailLoginInput.value = localStorage.getItem('savedEmail');
    }
    rememberLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (emailLoginInput.value) {
            localStorage.setItem('savedEmail', emailLoginInput.value);
            alert('E-mail salvo para o próximo acesso!');
        }
    });
    
    // --- INICIALIZAÇÃO ---
    checkUserSession();
});