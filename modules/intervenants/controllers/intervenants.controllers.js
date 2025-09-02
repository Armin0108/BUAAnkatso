const Document= require('../../documents/models/documents.models');
const TypeDocument=require('../../typedocuments/models/typedocuments.models');
const Intervenant= require('../../intervenants/models/intervenants.models');
const TypeIntervenant= require('../../typeintervenants/models/typeintervenants.models');
const Motcle=require('../../motcles/models/motcles.models');
const UrlVideo= require('../../urlVideo/models/urlVideo.models');
const path = require('path');
const fs = require('fs');

//========COTE ADMIN======//

const createIntervenant= async(req, res)=> {
    try {
        const { documentId } = req.params;
        const { nom, prenom, typeIntervenantId, bio, urlVideo, duree, resume } = req.body;
        
        if(!documentId){
            return res.status(400).json({error: "Le document est obligatoire."});
        }

        const document= await Document.findByPk(documentId);
        if(!document){
            return res.status(404).json({error: "Document introuvable. "});
        }

        let TypeInterv= await TypeIntervenant.findOne({
            where: {typeIntervenants: typeIntervenantId}
        });
        if(!TypeInterv){
            TypeInterv= await TypeIntervenant.create({typeIntervenants: typeIntervenantId});
        }

        const imageFile = req.file;
        const imageName = imageFile ? imageFile.filename : null;


        let intervenant= await Intervenant.findOne({
            where: {nom, prenom }});

        if(!intervenant){
            //création s'il n'existe pas encore
            intervenant= await Intervenant.create({
                nom,
                prenom,
                typeIntervenantId: TypeInterv.id,
                bio:bio || null,
                image: imageName
            });
        }

//pour le vidéo

console.log(document.id, intervenant.id, urlVideo)
        let existingVideo = await UrlVideo.findOne({
            where: { documentId: document.id, intervenantId: intervenant.id }
        });

        if (existingVideo) {
            if (existingVideo.urlVideo === urlVideo) {
                return res.status(400).json({
                    error: "Cette vidéo existe déjà pour ce document et intervenant."
                });
            } else {
                const updateVideo= await existingVideo.update({
                    urlVideo,
                    duree,
                    resume:resume || null
                });
                return res.status(200).json({
                    message: "Vidéo remplacée avec succès.",
                    video: updateVideo
                });
            }
        }else {
            const newVideo = await UrlVideo.create({
                urlVideo,
                duree,
                resume:resume || null,
                documentId: document.id,
                intervenantId: intervenant.id
            });
            return res.status(201).json({
                message: "Intervenant et vidéo créés avec succès.",
                intervenant,
                video: newVideo
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
};


// -----------------------------
// LISTE DE TOUS INTERVENANT 
// -----------------------------

const listAllIntervenant = async (req, res) => {
    try {
      const interv = await Intervenant.findAll({
        attributes: ['id', 'nom','prenom', 'bio','image'],
        include: [
            { model: TypeIntervenant, as: "type", attributes: ['typeIntervenants'] }
        ]
      });
      res.status(200).json({ data: interv });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// -----------------------------
// UPDATE INTERVENANT
// -----------------------------
const updateIntervenant = async (req, res) => {
    try {
      const { id } = req.params; // ID de l’intervenant à modifier
      const { nom, prenom, bio, typeIntervenantId } = req.body;
      const imageFile = req.file;
      const newImageName = imageFile ? imageFile.filename : null;
  
      // Vérifier si l’intervenant existe
      let intervenant = await Intervenant.findByPk(id);
      if (!intervenant) {
        return res.status(404).json({ message: "Intervenant non trouvé" });
      }
  
      // Vérifier si le type existe déjà
      let type = await TypeIntervenant.findOne({
        where: { typeIntervenants: typeIntervenantId }
      });
  
      if (!type) {
        type = await TypeIntervenant.create({ typeIntervenants: typeIntervenantId });
      }

      if (newImageName && intervenant.image) {
        const oldImagePath = path.join(__dirname, '../../../uploads/intervenants', intervenant.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error("Erreur suppression ancienne image:", err);
            else console.log("Ancienne image supprimée:", oldImagePath);
          });
        }
      }
  
      // Mettre à jour l’intervenant
      await intervenant.update({
        nom: nom || intervenant.nom,
        prenom: prenom || intervenant.prenom,
        bio: bio !== undefined ? bio : intervenant.bio,
        image: newImageName || intervenant.image, // garder l’ancienne image si pas de nouvelle
        typeIntervenantId: type.id
      });
  
      res.status(200).json({
        message: "Intervenant mis à jour avec succès",
        data: intervenant
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  };
  

module.exports = { createIntervenant,listAllIntervenant,updateIntervenant};

