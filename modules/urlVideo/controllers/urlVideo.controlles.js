const Document= require('../../documents/models/documents.models');
const TypeDocument=require('../../typedocuments/models/typedocuments.models');
const Intervenant= require('../../intervenants/models/intervenants.models');
const TypeIntervenant= require('../../typeintervenants/models/typeintervenants.models');
const Motcle=require('../../motcles/models/motcles.models');
const UrlVideo= require('../../urlVideo/models/urlVideo.models');
const { Op } = require("sequelize");


// -----------------------------
// Liste globale + recherche par mot-clé RECHERCHE MOTEUR DE RECHERCHE
// -----------------------------

const listVideos = async (req, res) => {
    try {
      const { keyword } = req.body;
  
      if (!keyword || !keyword.trim()) {
        return res.status(400).json({ message: "Mot-clé requis" });
      }
  
      const keywords = keyword.split(/\s+|,/).map(k => k.trim());
  
      const whereClause = {
        [Op.or]: keywords.map(k => ({
          [Op.or]: [
            { "$document.titre$": { [Op.iLike]: `%${k}%` } },
            { "$document.auteur$": { [Op.iLike]: `%${k}%` } },
            { "$document.domaine$": { [Op.iLike]: `%${k}%` } },
            { "$document.type.typeDocuments$": { [Op.iLike]: `%${k}%` } },
            { "$document.motcles.motcles$": { [Op.iLike]: `%${k}%` } },
            { "$intervenant.nom$": { [Op.iLike]: `%${k}%` } },
            { "$intervenant.prenom$": { [Op.iLike]: `%${k}%` } },
            { "$intervenant.type.typeIntervenants$": { [Op.iLike]: `%${k}%` } }
          ]
        }))
      };
  
      const videos = await UrlVideo.findAll({
        attributes: ['id','resume'],//id pour le details
        where: whereClause,
        include: [
          { model: Document, as: "document",
            attributes: ['titre','auteur'],
             include: [{ model: TypeDocument, as: "type", attributes:[]},{ model: Motcle, as: "motcles" , attributes:[]}] },
          { model: Intervenant, as: "intervenant", 
            attributes:['nom','prenom','image'],
            include: [{ model: TypeIntervenant, as: "type" , attributes:[]}] }
        ]
      });
  
      if (!videos.length) return res.status(200).json({ message: "Aucun résultat trouvé, veuillez vérifier les données entrées", data: [] });
  
      res.status(200).json({ data: videos });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  };

// -----------------------------
// Détails de l'une des liste après clic  AFFICHAGE DU RESULTAT
// -----------------------------
const VideosDetails = async (req, res) => {
    try {
      const { id } = req.params;//id urlVideo
  
      const videos = await UrlVideo.findByPk(id,{
        attributes: ['urlVideo', 'duree', 'resume'],
        
        include: [
          { model: Document, as: "document",
            attributes: ['titre','auteur', 'datepub','domaine','bio', 'urlLivre','mention'],
            include: [{ model: TypeDocument, as: "type", attributes:['typeDocuments']},{ model: Motcle, as: "motcles" , attributes:[]}] },
          { model: Intervenant, as: "intervenant", 
            attributes:['nom','prenom','image','bio'],
            include: [{ model: TypeIntervenant, as: "type" , attributes:['typeIntervenants']}] }
        ]
      });
  
      if (!videos) return res.status(200).json({ message: "Aucun résultat trouvé, veuillez vérifier les données entrées", data: [] });
  
      res.status(200).json({ data: videos });
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
      const { nomIntervenant, prenomIntervenant, titreDocument, auteurDocument } = req.body;
  
      const videos = await UrlVideo.findAll({
        attributes: ['id','urlVideo','resume'], //pour details
        include: [
          { model: Intervenant, as: "intervenant", 
            attributes:['nom','prenom','image'],
            include: [{ model: TypeIntervenant, as: "type", attributes:[] }], required: true },
          { model: Document, as: "document", 
            attributes: ['titre','auteur'],
            include: [{ model: TypeDocument, as: "type", attributes:[] }], required: true }
        ],
        where: {
          ...(nomIntervenant && { "$intervenant.nom$": { [Op.iLike]: `%${nomIntervenant}%` } }),
          ...(prenomIntervenant && { "$intervenant.prenom$": { [Op.iLike]: `%${prenomIntervenant}%` } }),
          ...(titreDocument && { "$document.titre$": { [Op.iLike]: `%${titreDocument}%` } }),
          ...(auteurDocument && { "$document.auteur$": { [Op.iLike]: `%${auteurDocument}%` } })
        },
        //limit: 1
      });

        if (!videos || videos.length === 0) {
            return res.status(200).json({ message: "Aucun résultat trouvé, veuillez vérifier les données entrées", data: [] });
        }

        res.status(200).json(videos);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};



//=========COTE ADMINISTRATION========//


// -----------------------------
// LISTE DE TOUS LES VIDEOS - INTERVENANT- DOCUMENTS POUR VOIR LA LIAISON ENTRE DOC ET VIDEO
// -----------------------------

const listAllVideos = async (req, res) => {
  try {
    const videos = await UrlVideo.findAll({
      attributes: ['id', 'urlVideo'],
      include: [
        { model: Document, as: "document",
          attributes: ['id','titre','auteur'],
          include: [
            { model: TypeDocument, as: "type", attributes: ['typeDocuments'] },
            { model: Motcle, as: "motcles", attributes: [] }
          ]
        },
        { model: Intervenant, as: "intervenant",
          attributes: ['id','nom','prenom','image'],
          include: [
            { model: TypeIntervenant, as: "type", attributes: ['typeIntervenants'] }
          ]
        }
      ]
    });

    res.status(200).json({ data: videos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// -----------------------------
// UPDATE VIDEO (URL, durée, résumé)
// -----------------------------
const updateVideo = async (req, res) => {
  try {
    const { id } = req.params; // id de la vidéo
    const { urlVideo, duree, resume } = req.body;

    // Chercher la vidéo
    const video = await UrlVideo.findByPk(id);
    if (!video) {
      return res.status(404).json({ message: "Vidéo non trouvée" });
    }

    // Mettre à jour seulement les champs autorisés
    if (urlVideo) video.urlVideo = urlVideo;
    if (duree) video.duree = duree;
    if (resume !== undefined) video.resume = resume;

    await video.save();

    res.status(200).json({ message: "Vidéo mise à jour avec succès", data: video });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// =================== SUPPRESSION D'UNE VIDEO / PAS LE DOC NI INTERVENANT===================
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params; // id video à supprimer après clic sur listAllVideos

    // Vérifie si la vidéo existe
    const video = await UrlVideo.findByPk(id);
    if (!video) {
      return res.status(404).json({ message: "Vidéo introuvable" });
    }

    // Supprimer uniquement la vidéo
    await video.destroy();

    res.status(200).json({ message: "Vidéo supprimée avec succès" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};



module.exports = { listVideos, VideosDetails, advancedSearch, listAllVideos,updateVideo, deleteVideo };