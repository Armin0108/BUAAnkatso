const Document= require('../models/documents.models');
const TypeDocument=require('../../typedocuments/models/typedocuments.models');
const Intervenant= require('../../intervenants/models/intervenants.models');
const TypeIntervenant= require('../../typeintervenants/models/typeintervenants.models');
const Motcle=require('../../motcles/models/motcles.models');

const createFullDocument = async (req, res) => {
    try {
        const {
            typeDocumentId,
            Titre,
            Auteur,
            DateEdition,
            Domaine,
            Mention,
            UrlDOC,
            UrlVideo,
            Resume,
            intervenants, // tableau [{ Nom, Prenom, typeIntervenantId, Bio, Photo, UrlVideo }]
            motcles // tableau ["IA", "ML"]
        } = req.body;

        // 1. Chercher si le document existe
        let document = await Document.findOne({
            where: { Titre, Auteur, DateEdition }
        });

        // 2. Sinon créer un nouveau document
        if (!document) {
            document = await Document.create({
                typeDocumentId,
                Titre,
                Auteur,
                DateEdition,
                Domaine,
                Mention,
                UrlDOC,
                UrlVideo,
                Resume
            });
        }

        // 3. Ajouter chaque intervenant, même si doublon
        if (intervenants && intervenants.length > 0) {
            for (const data of intervenants) {
                const newIntervenant = await Intervenant.create(data);
                await document.addIntervenant(newIntervenant); // liaison M:N
            }
        }

        // 4. Ajouter les mots-clés
        if (motcles && motcles.length > 0) {
            for (const mot of motcles) {
                const [motcle, created] = await Motcle.findOrCreate({
                    where: { Motcles: mot }
                });
                await document.addMotcle(motcle);
            }
        }

        return res.status(201).json({
            message: 'Document créé ou lié avec intervenants multiples',
            document
        });
    } catch (error) {
        console.error('Erreur création:', error);
        return res.status(500).json({
            message: "Erreur interne du serveur",
            error: error.message
        });
    }
};
