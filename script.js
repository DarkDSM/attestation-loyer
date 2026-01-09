document.addEventListener('DOMContentLoaded', function() {
    // Définir les dates par défaut
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Date d'entrée : aujourd'hui
    document.getElementById('dateEntree').valueAsDate = today;
    
    // Date validation : demain
    document.getElementById('dateValidation').valueAsDate = tomorrow;
    document.getElementById('dateValidation').min = today.toISOString().split('T')[0];
    
    // Gestion du bouton générer
    document.getElementById('generateBtn').addEventListener('click', generatePDF);
});

async function generatePDF() {
    // Récupérer les valeurs
    const nomPrenom = document.getElementById('nomPrenom').value.trim();
    const adresse = document.getElementById('adresse').value.trim();
    const dateEntree = document.getElementById('dateEntree').value;
    const dateValidation = document.getElementById('dateValidation').value;
    
    // Validation simple
    if (!nomPrenom || !adresse || !dateEntree || !dateValidation) {
        alert('Veuillez remplir tous les champs !');
        return;
    }
    
    // Afficher le chargement
    document.getElementById('loading').style.display = 'flex';
    
    // Préparer les données
    const data = {
        nomPrenom: nomPrenom,
        adresse: adresse,
        dateEntree: dateEntree,
        dateValidation: dateValidation
    };
    
    try {
        // Envoyer au serveur
        const response = await fetch('/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Erreur serveur');
        }
        
        // Télécharger le PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attestation-loyer-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la génération du PDF. Vérifiez que le serveur est démarré.');
    } finally {
        // Cacher le chargement
        document.getElementById('loading').style.display = 'none';
    }
}
