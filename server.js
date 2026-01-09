const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());
// Servir les fichiers statiques
app.use(express.static(__dirname));

// ============================================
// CONFIGURATION DES POSITIONS (À MODIFIER !)
// ============================================
// Remplace ces valeurs par les coordonnées de TON PNG
const POSITIONS = {
    nomPrenom: { x: 150, y: 200 },  // À MODIFIER
    adresse: { x: 150, y: 250 },     // À MODIFIER
    dateEntree: { x: 150, y: 300 },  // À MODIFIER
    dateValidation: { x: 150, y: 350 } // À MODIFIER
};

// Route pour générer le PDF
app.post('/generate-pdf', (req, res) => {
    const { nomPrenom, adresse, dateEntree, dateValidation } = req.body;
    
    // Créer le PDF
    const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });
    
    // Configurer la réponse
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="attestation.pdf"');
    
    // Lier le PDF à la réponse
    doc.pipe(res);
    
    // ============================================
    // ÉTAPE CRITIQUE : AJOUTER TON PNG EN FOND
    // ============================================
    // 1. Place ton fichier PNG dans le même dossier que server.js
    // 2. Décommente la ligne suivante :
    // doc.image('ton-attestation.png', 0, 0, { width: 595, height: 842 });
    
    // Pour l'instant, on crée un fond blanc
    doc.rect(0, 0, 595, 842).fill('#ffffff');
    
    // Ajouter un titre (temporaire - sera caché par ton PNG)
    doc.fontSize(24)
       .fillColor('#333')
       .text('ATTESTATION DE LOYER', 100, 50);
    
    // ============================================
    // ÉCRITURE DES INFORMATIONS SUR LE PDF
    // ============================================
    
    // Nom et Prénom
    doc.fontSize(12)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text(nomPrenom.toUpperCase(), POSITIONS.nomPrenom.x, POSITIONS.nomPrenom.y);
    
    // Adresse
    doc.font('Helvetica')
       .text(adresse, POSITIONS.adresse.x, POSITIONS.adresse.y);
    
    // Formater les dates
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR');
    };
    
    // Date d'entrée
    doc.text(`Date d'entrée: ${formatDate(dateEntree)}`, 
             POSITIONS.dateEntree.x, POSITIONS.dateEntree.y);
    
    // Date de validation
    doc.text(`Date de validation: ${formatDate(dateValidation)}`, 
             POSITIONS.dateValidation.x, POSITIONS.dateValidation.y);
    
    // Finaliser le PDF
    doc.end();
});

// Route pour vérifier que le serveur fonctionne
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Serveur actif' });
});

// Route par défaut
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
    console.log(`🌐 Accédez à : http://localhost:${PORT}`);
    console.log(`📄 Route PDF : POST http://localhost:${PORT}/generate-pdf`);
});
