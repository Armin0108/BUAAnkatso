const Document= require('../../documents/models/documents.models');
const TypeDocument=require('../../typedocuments/models/typedocuments.models');
const Intervenant= require('../../intervenants/models/intervenants.models');
const TypeIntervenant= require('../../typeintervenants/models/typeintervenants.models');
const Motcle=require('../../motcles/models/motcles.models');
const UrlVideo= require('../../urlVideo/models/urlVideo.models');
const path = require('path');
const fs = require('fs');

const createIntervenant= async(req, res)=> {
    try {
        const{intervenant:intervData, video: videoData, documentId}= req.body;
        if(!documentId){
            return res.status(400).json({error: "Le document est obligatoire."});
        }

        const document= await Document.findByPk(documentId);
        if(!document){
            return res.status(404).json({error: "Document introuvable. "});
        }

        let TypeInterv= await TypeIntervenant.findOne({
            where: {typeIntervenants: intervData.typeIntervenantId}
        });
        if(!TypeInterv){
            TypeInterv= await TypeIntervenant.create({typeIntervenants: intervData.typeIntervenantId});
        }

        const imageFile = req.file;
        const imageName = imageFile ? imageFile.filename : null;


        let intervenant= await Intervenant.findOne({
            where: {
                nom: intervData.nom,
                prenom: intervData.prenom
            }
        });

        if(!intervenant){
            intervenant= await Intervenant.create({
                nom: intervData.nom,
                prenom: intervData.prenom,
                typeIntervenantId: TypeInterv.id,
                bio: intervData.bio || null,
                image: imageName
            });
        }else{
            let updated= false;

            // Mise à jour du typeIntervenant
            if (TypeInterv.id !== intervenant.typeIntervenantId) {
                intervenant.typeIntervenantId = TypeInterv.id;
                updated = true;
            }

            if (intervData.bio && intervData.bio !==intervenant.bio){
                intervenant.bio= intervData.bio;
                updated= true;
            }
            if (imageName ){
                const oldImageName= intervenant.image;
                intervenant.image= imageName;
                updated= true;

                // Supprimer l'ancienne image si elle existe
                if (oldImageName) {
                    const fullPath = path.join(__dirname, "../../../uploads/intervenants", oldImageName);
                    fs.unlink(fullPath, (err) => {
                        if (err) console.error("Erreur suppression ancienne image:", err);
                        else console.log("Ancienne image supprimée:", fullPath);
                    });
                }
            }
            if(updated) await intervenant.save();
        }

        let existingVideo = await UrlVideo.findOne({
            where: { documentId: document.id, intervenantId: intervenant.id }
        });

        if (existingVideo) {
            if (existingVideo.urlVideo === videoData.url) {
                return res.status(400).json({
                    error: "Cette vidéo existe déjà pour ce document et intervenant."
                });
            } else {
                await existingVideo.update({
                    urlVideo: videoData.url,
                    duree: videoData.duree,
                    resume: videoData.resume || null
                });
                return res.status(200).json({
                    message: "Vidéo remplacée avec succès.",
                    video: existingVideo
                });
            }
        }else {
            const urlVideo = await UrlVideo.create({
                urlVideo: videoData.url,
                duree: videoData.duree,
                resume: videoData.resume || null,
                documentId: document.id,
                intervenantId: intervenant.id
            });
            return res.status(201).json({
                message: "Intervenant et vidéo créés avec succès.",
                intervenant,
                video: urlVideo
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur', error: error.message });
        }
};



module.exports = { createIntervenant };

