const Document= require('../../documents/models/documents.models');
const TypeDocument=require('../../typedocuments/models/typedocuments.models');
const Intervenant= require('../../intervenants/models/intervenants.models');
const TypeIntervenant= require('../../typeintervenants/models/typeintervenants.models');
const Motcle=require('../../motcles/models/motcles.models');
const UrlVideo= require('../../urlVideo/models/urlVideo.models');
const path = require('path');
const fs = require('fs');
const { Op } = require("sequelize");


// -----------------------------
// Liste globale + recherche par mot-clé
// -----------------------------
const listVideos = async (req, res) => {
    try {
        const { search } = req.query;
        let whereClause = {};

        if (search) {
            const keywords = search.split(",").map(k => k.trim());

            whereClause = {
                [Op.or]: keywords.map(k => ({
                    [Op.or]: [
                        { "$Document.titre$": { [Op.iLike]: `%${k}%` } },
                        { "$Document.auteur$": { [Op.iLike]: `%${k}%` } },
                        { "$Document.domaine$": { [Op.iLike]: `%${k}%` } },
                        { "$Intervenant.nom$": { [Op.iLike]: `%${k}%` } },
                        { "$Intervenant.prenom$": { [Op.iLike]: `%${k}%` } }
                    ]
                }))
            };
        }

        const videos = await UrlVideo.findAll({
            where: whereClause,
            include: [
                { model: Document, as: "document" },
                { model: Intervenant, as: "intervenant" }
            ]
        });

        if (!videos || videos.length === 0) {
            return res.status(200).json({ message: "Aucun résultat trouvé", data: [] });
        }

        res.status(200).json(videos);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// -----------------------------
// Recherche avancée avec filtres spécifiques
// -----------------------------
const advancedSearch = async (req, res) => {
    try {
        const { nomIntervenant, prenomIntervenant, titreDocument, auteurDocument } = req.query;

        const videos = await UrlVideo.findAll({
            include: [
                {
                    model: Document,
                    where: titreDocument || auteurDocument ? {
                        ...(titreDocument && { titre: { [Op.iLike]: `%${titreDocument}%` } }),
                        ...(auteurDocument && { auteur: { [Op.iLike]: `%${auteurDocument}%` } })
                    } : {}
                },
                {
                    model: Intervenant,
                    where: nomIntervenant || prenomIntervenant ? {
                        ...(nomIntervenant && { nom: { [Op.iLike]: `%${nomIntervenant}%` } }),
                        ...(prenomIntervenant && { prenom: { [Op.iLike]: `%${prenomIntervenant}%` } })
                    } : {}
                }
            ]
        });

        if (!videos || videos.length === 0) {
            return res.status(200).json({ message: "Aucun résultat trouvé", data: [] });
        }

        res.status(200).json(videos);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

module.exports = { listVideos, advancedSearch };