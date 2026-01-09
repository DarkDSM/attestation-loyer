const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Initialiser l'application Express
const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Autoriser les requêtes depuis le frontend
app.use(bodyParser.json()); // Pour parser les données JSON

// Servir les fichiers statiques du frontend (en production)
app.use(express.static(path.join(__dirname, '../frontend')));

// Route pour vérifier que le serveur fonctionne
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Serveur de génération PDF actif' 
    });
});

// Route principale pour générer le PDF
app.post('/api/generate-pdf', (req, res) => {
    try {
        // 1. Récupérer les données du formulaire
        const { nom, prenom, adresse, dateEntree, dateValidation } = req.body;
        
        // 2. Valider les données
        if (!nom || !prenom || !adresse || !dateEntree || !dateValidation) {
            return res.status(400).json({ 
                error: 'Tous les champs sont obligatoires' 
            });
        }
        
        // 3. Créer un nouveau document PDF
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });
        
        // 4. Configurer les en-têtes de la réponse
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="attestation-${nom}.pdf"`);
        
        // 5. Envoyer le PDF directement dans la réponse
        doc.pipe(res);
        
        // ============================================
        // 6. CONCEPTION DE L'ATTESTATION (À PERSONNALISER)
        // ============================================
        
        // --- EN-TÊTE ---
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text('ATTESTATION DE LOYER', { align: 'center' })
           .moveDown(1);
        
        doc.fontSize(14)
           .font('Helvetica')
           .text('Document officiel', { align: 'center' })
           .moveDown(2);
        
        // --- SECTION 1 : DÉCLARATION ---
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('Je soussigné(e), propriétaire du logement, atteste que :')
           .moveDown(1);
        
        // --- SECTION 2 : INFORMATIONS DU LOCATAIRE ---
        doc.font('Helvetica-Bold')
           .text('INFORMATIONS DU LOCATAIRE :')
           .moveDown(0.5);
        
        doc.font('Helvetica')
           .text(`Nom : ${nom.toUpperCase()}`)
           .text(`Prénom : ${prenom}`)
           .moveDown(1);
        
        // --- SECTION 3 : ADRESSE ---
        doc.font('Helvetica-Bold')
           .text('ADRESSE DU LOGEMENT :')
           .moveDown(0.5);
        
        doc.font('Helvetica')
           .text(adresse)
           .moveDown(1);
        
        // --- SECTION 4 : DATES ---
        doc.font('Helvetica-Bold')
           .text('DATES IMPORTANTES :')
           .moveDown(0.5);
        
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        };
        
        doc.font('Helvetica')
           .text(`Date d'entrée dans le logement : ${formatDate(dateEntree)}`)
           .text(`Date de validation de l'attestation : ${formatDate(dateValidation)}`)
           .moveDown(2);
        
        // --- SECTION 5 : SIGNATURE ---
        doc.font('Helvetica-Bold')
           .text('Signature et cachet :')
           .moveDown(2);
        
        doc.font('Helvetica')
           .text('_________________________')
           .moveDown(0.5);
        
        doc.fontSize(10)
           .text('(Signature du propriétaire)')
           .moveDown(2);
        
        doc.fontSize(10)
           .font('Helvetica-Oblique')
           .text('Document généré le ' + new Date().toLocaleDateString('fr-FR'), { align: 'right' });
        
        // 7. Finaliser le PDF
        doc.end();
        
    } catch (error) {
        console.error('Erreur lors de la génération :', error);
        res.status(500).json({ 
            error: 'Erreur lors de la génération du PDF' 
        });
    }
});

// 8. Démarrer le serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📄 Route PDF : POST http://localhost:${PORT}/api/generate-pdf`);
    console.log(`🏥 Vérification : GET http://localhost:${PORT}/api/health`);
});
