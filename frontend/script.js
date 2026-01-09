// Configuration
const API_URL = 'http://localhost:3000';
const API_PDF_ENDPOINT = `${API_URL}/api/generate-pdf`;
const API_HEALTH_ENDPOINT = `${API_URL}/api/health`;

// Éléments DOM
const form = document.getElementById('attestationForm');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// Éléments d'aperçu
const previewNom = document.getElementById('previewNom');
const previewPrenom = document.getElementById('previewPrenom');
const previewAdresse = document.getElementById('previewAdresse');
const previewDateEntree = document.getElementById('previewDateEntree');
const previewDateValidation = document.getElementById('previewDateValidation');

// Éléments de statut
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Initialiser l'application
function initApp() {
    // Configurer les dates par défaut
    setDefaultDates();
    
    // Écouter les changements dans le formulaire
    setupFormListeners();
    
    // Configurer les boutons
    setupButtons();
    
    // Vérifier la connexion au serveur
    checkServerStatus();
    
    // Mettre à jour l'aperçu initial
    updatePreview();
}

// Configurer les dates par défaut
function setDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Date d'entrée : aujourd'hui
    document.getElementById('dateEntree').valueAsDate = today;
    
    // Date de validation : demain (par défaut)
    document.getElementById('dateValidation').valueAsDate = tomorrow;
    document.getElementById('dateValidation').min = today.toISOString().split('T')[0];
}

// Configurer les écouteurs d'événements du formulaire
function setupFormListeners() {
    const formInputs = form.querySelectorAll('input, textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview);
    });
    
    // Empêcher la soumission du formulaire par défaut
    form.addEventListener('submit', (e) => e.preventDefault());
}

// Configurer les boutons
function setupButtons() {
    // Bouton Générer
    generateBtn.addEventListener('click', handleGenerateClick);
    
    // Bouton Réinitialiser
    resetBtn.addEventListener('click', () => {
        setDefaultDates();
        updatePreview();
        showNotification('Formulaire réinitialisé', 'info');
    });
}

// Mettre à jour l'aperçu en temps réel
function updatePreview() {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Nom (en majuscules)
    previewNom.textContent = data.nom ? data.nom.toUpperCase() : '[À remplir]';
    previewNom.style.color = data.nom ? '#4361ee' : '#6c757d';
    previewNom.style.fontWeight = data.nom ? '600' : '400';
    
    // Prénom
    previewPrenom.textContent = data.prenom || '[À remplir]';
    previewPrenom.style.color = data.prenom ? '#4361ee' : '#6c757d';
    previewPrenom.style.fontWeight = data.prenom ? '600' : '400';
    
    // Adresse
    previewAdresse.textContent = data.adresse || '[À remplir]';
    previewAdresse.style.color = data.adresse ? '#4361ee' : '#6c757d';
    previewAdresse.style.fontWeight = data.adresse ? '600' : '400';
    previewAdresse.style.whiteSpace = 'pre-wrap';
    
    // Date d'entrée
    if (data.dateEntree) {
        const dateEntree = new Date(data.dateEntree);
        previewDateEntree.textContent = dateEntree.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        previewDateEntree.style.color = '#4361ee';
        previewDateEntree.style.fontWeight = '600';
    } else {
        previewDateEntree.textContent = '[À remplir]';
        previewDateEntree.style.color = '#6c757d';
        previewDateEntree.style.fontWeight = '400';
    }
    
    // Date de validation
    if (data.dateValidation) {
        const dateValidation = new Date(data.dateValidation);
        previewDateValidation.textContent = dateValidation.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        previewDateValidation.style.color = '#7209b7';
        previewDateValidation.style.fontWeight = '600';
    } else {
        previewDateValidation.textContent = '[À remplir]';
        previewDateValidation.style.color = '#6c757d';
        previewDateValidation.style.fontWeight = '400';
    }
}

// Gérer le clic sur le bouton Générer
async function handleGenerateClick() {
    // Valider le formulaire
    if (!validateForm()) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    // Récupérer les données
    const formData = new FormData(form);
    const data = {
        nom: formData.get('nom'),
        prenom: formData.get('prenom'),
        adresse: formData.get('adresse'),
        dateEntree: formData.get('dateEntree'),
        dateValidation: formData.get('dateValidation')
    };
    
    // Afficher le chargement
    showLoading(true);
    
    try {
        // Générer le PDF
        await generatePDF(data);
        
        // Succès
        showNotification('Attestation générée avec succès !', 'success');
        
        // Réinitialiser après succès (optionnel)
        // setTimeout(() => {
        //     form.reset();
        //     setDefaultDates();
        //     updatePreview();
        // }, 2000);
        
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la génération du PDF', 'error');
    } finally {
        // Cacher le chargement
        showLoading(false);
    }
}

// Valider le formulaire
function validateForm() {
    const requiredFields = ['nom', 'prenom', 'adresse', 'dateEntree', 'dateValidation'];
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#f72585';
        } else {
            field.style.borderColor = '';
        }
    });
    
    return isValid;
}

// Générer le PDF
async function generatePDF(data) {
    const response = await fetch(API_PDF_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Erreur serveur');
    }
    
    // Créer un blob et télécharger
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Nom du fichier avec date
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `attestation-loyer-${data.nom.toLowerCase()}-${timestamp}.pdf`;
    
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Vérifier l'état du serveur
async function checkServerStatus() {
    try {
        statusText.textContent = 'Connexion au serveur...';
        statusDot.className = 'status-dot';
        
        const response = await fetch(API_HEALTH_ENDPOINT, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            timeout: 5000
        });
        
        if (response.ok) {
            statusDot.className = 'status-dot connected';
            statusText.textContent = 'Serveur connecté';
            generateBtn.disabled = false;
        } else {
            throw new Error('Serveur non disponible');
        }
    } catch (error) {
        console.warn('Serveur non disponible:', error);
        statusDot.className = 'status-dot disconnected';
        statusText.textContent = 'Serveur déconnecté';
        generateBtn.disabled = true;
        
        // Réessayer après 10 secondes
        setTimeout(checkServerStatus, 10000);
    }
}

// Afficher/cacher le chargement
function showLoading(show) {
    if (show) {
        loadingOverlay.style.display = 'flex';
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Génération en cours...</span>';
    } else {
        loadingOverlay.style.display = 'none';
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-file-pdf"></i><span>Générer l\'Attestation PDF</span>';
    }
}

// Afficher une notification
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Icône selon le type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Styles de la notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#4CAF50' : 
                   type === 'error' ? '#f72585' : 
                   type === 'warning' ? '#f8961e' : '#4361ee',
        color: 'white',
        padding: '15px 25px',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease-out',
        maxWidth: '400px',
        fontSize: '0.95rem'
    });
    
    // Ajouter l'animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Ajouter au document
    document.body.appendChild(notification);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        
        const outroStyle = document.createElement('style');
        outroStyle.textContent = `
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(outroStyle);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
            document.head.removeChild(outroStyle);
        }, 300);
    }, 5000);
}

// Ajouter un style pour le placeholder
const style = document.createElement('style');
style.textContent = `
    ::placeholder {
        color: #adb5bd;
        opacity: 1;
    }
    
    :-ms-input-placeholder {
        color: #adb5bd;
    }
    
    ::-ms-input-placeholder {
        color: #adb5bd;
    }
    
    input:invalid, textarea:invalid {
        border-color: #f72585;
    }
    
    input:valid, textarea:valid {
        border-color: #4CAF50;
    }
`;
document.head.appendChild(style);
