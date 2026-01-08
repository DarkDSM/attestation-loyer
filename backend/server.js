const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Route pour générer le PDF
app.post('/generate-pdf', (req, res) => {
    const { 
        nom, 
        prenom, 
        adresse, 
        dateEntree, 
        dateValidation 
    } = req.body;

    try {
        // Créer un nouveau document PDF
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });

        // Configurer les headers pour le téléchargement
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=attestation-loyer.pdf');

        // Pipe le PDF dans la réponse
        doc.pipe(res);

        // Titre
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text('ATTESTATION DE LOYER', { align: 'center' })
           .moveDown(2);

        // Texte d'introduction
        doc.fontSize(12)
           .font('Helvetica')
           .text('Je soussigné(e), propriétaire du logement situé à l\'adresse ci-dessous, atteste que :')
           .moveDown();

        // Informations du locataire
        doc.font('Helvetica-Bold')
           .text(`Nom : ${nom.toUpperCase()}`);
        doc.text(`Prénom : ${prenom}`)
           .moveDown();

        // Adresse de la propriété
        doc.text('Adresse de la propriété :')
           .font('Helvetica')
           .text(adresse)
           .moveDown();

        // Dates
        doc.font('Helvetica-Bold')
           .text('Date d\'entrée dans le logement :')
           .font('Helvetica')
           .text(new Date(dateEntree).toLocaleDateString('fr-FR'))
           .moveDown();

        doc.font('Helvetica-Bold')
           .text('Date de validation de l\'attestation :')
           .font('Helvetica')
           .text(new Date(dateValidation).toLocaleDateString('fr-FR'))
           .moveDown(2);

        // Signature
        doc.text('Fait à ________________________________')
           .moveDown(2);
        doc.text('Le _______________________________')
           .moveDown(2);
        doc.text('Signature :')
           .moveDown(3);
        doc.text('_______________________________');

        // Finaliser le PDF
        doc.end();

    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
    }
});

// Route pour générer un PNG (optionnel)
app.post('/generate-png', async (req, res) => {
    // Pour PNG, on pourrait utiliser une librairie comme puppeteer
    // ou générer d'abord un PDF puis le convertir
    res.status(501).json({ message: 'Fonctionnalité PNG à implémenter' });
});

// Route de test
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Serveur en ligne' });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});
