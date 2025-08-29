const Document= require('../models/documents.models');
const TypeDocument=require('../../typedocuments/models/typedocuments.models');
const Intervenant= require('../../intervenants/models/intervenants.models');
const TypeIntervenant= require('../../typeintervenants/models/typeintervenants.models');
const Motcle=require('../../motcles/models/motcles.models');
const UrlVideo= require('../../urlVideo/models/urlVideo.models');
const fs = require('fs'); // au début du fichier
const path = require('path');

const createFullDocument = async (req, res) => {
    try {
        const{
            titre,
            typeDocumentId,
            auteur,
            domaine,
            bio,
            mention,
            datepub,
            intervenant: intervData, video: videoData,motscles
        }= req.body;

        // Gestion TypeDocument
        let typeDoc = await TypeDocument.findOne({ where: { typeDocuments: typeDocumentId } });
        if (!typeDoc) {
            typeDoc = await TypeDocument.create({ typeDocuments: typeDocumentId });
        }

       // Récupération pdf 
       const pdfFile = req.files.pdfFile?.[0];
       //Vérification et création document
       let document= await Document.findOne({where:{titre,auteur,typeDocumentId:typeDoc.id}});
        
        if(!document){
            document= await Document.create({
                titre,
                typeDocumentId: typeDoc.id,
                auteur,
                domaine,
                bio,
                mention,
                datepub,
                urlLivre: pdfFile ? pdfFile.filename: null
            });
        }else if (pdfFile) {
            // Document existant + nouveau PDF → remplacer l'ancien
            const oldPdfPath = document.urlLivre;
            document.urlLivre = pdfFile.filename;
            await document.save();
        
            // Supprimer l'ancien fichier PDF
            if (oldPdfPath) {
                const fullPath= path.join(__dirname,'../../../uploads/documents',oldPdfPath);
                if(fs.existsSync(fullPath)){
                    fs.unlink(fullPath,(err)=>{
                        if(err) console.error("Erreur de suppression ancien PDF:", err);
                        else console.log("Ancien PDF supprimé: ", fullPath);
                    });
                }else {
                    console.warn("Ancien PDF introuvable : ", fullPath);
                }
            }
        }

        // Gestion TypeIntervenant
        // -----------------------------
        let typeInterv = await TypeIntervenant.findOne({ where: { typeIntervenants: intervData.typeIntervenantId } });
        if (!typeInterv) {
            typeInterv = await TypeIntervenant.create({ typeIntervenants: intervData.typeIntervenantId });
        }

        //Vérification et Création intervenant
        const imageFile = req.files.imageFile?.[0];

        let intervenant= await Intervenant.findOne({where: {nom:intervData.nom,prenom:intervData.prenom}});
        
        if (!intervenant){
            intervenant= await Intervenant.create({
                nom: intervData.nom,
                prenom: intervData.prenom,
                typeIntervenantId: typeInterv.id,
                bio: intervData.bio||null,
                image: imageFile ? imageFile.filename :  null
            });
        }else {
            intervenant.typeIntervenantId = typeInterv.id;  
            intervenant.bio = intervData.bio || intervenant.bio;
            if (imageFile) {
            // Intervenant existant + nouvelle image → remplacer l'ancienne
            const oldImagePath = intervenant.image;
            intervenant.image = imageFile.filename;
            await intervenant.save();
        
            // Supprimer l'ancienne image
                if (oldImagePath ) {
                    const fullPath = path.join(__dirname, '../../../uploads/intervenants', oldImagePath);
                    fs.unlink(fullPath,(err) => {
                        if (err) console.error("Erreur suppression ancienne image:", err);
                        else console.log("Ancienne image supprimé: ",fullPath);
                    });
                }else{
                    console.warn("Ancienne image introuvable: ",fullPath);
                }
            }
        }
        
        //Création vidéo
        let urlVideo;
        let existingVideo=await UrlVideo.findOne({
            where: {documentId: document.id, intervenantId:intervenant.id}
        });

        if(existingVideo){
            if(existingVideo.urlVideo===videoData.url){
                //même video deja enregistree
                return res.status(400).json({
                    error: "cette Vidéo existe déjà pour ce document et intervenant"
                });
            }else{
                //Même doc + même intervenant mais vidéo différenete== on remplace l'ancienne video
                await existingVideo.update({
                    urlVideo: videoData.url,
                    duree: videoData.duree,
                    resume: videoData.resume||null
                });

                return res.status(200).json({
                    message: "Vidéo remplacée avec succès.",
                    video: existingVideo
                });
            }
        }else{
                const urlVideo= await UrlVideo.create({
                urlVideo: videoData.url,
                duree: videoData.duree,
                resume: videoData.resume|| null,
                documentId: document.id,
                intervenantId: intervenant.id  
            });
        }

        
        //création motcles
        if (motscles) {
            let motsclesArray = [];
        
            // Si Postman envoie une string : "Informatique, Linux, Système, open source"
            if (typeof motscles === "string") {
                motsclesArray = motscles
                    .split(",")
                    .map(m => m.trim())
                    .filter(m => m.length > 0);
            }
            // Si déjà un tableau : ["Informatique", "Linux"]
            else if (Array.isArray(motscles)) {
                motsclesArray = motscles.map(m => m.trim());
            }
        
            // Normaliser les mots-clés (évite doublons "Linux" / "linux")
            motsclesArray = motsclesArray.map(m => m.toLowerCase());
        
            for (let mot of motsclesArray) {
                // Vérifie si le mot-clé existe, sinon crée
                const [motcle] = await Motcle.findOrCreate({
                    where: { motcles: mot }
                });
        
                // Vérifie si la relation Document-Motcle existe déjà
                const existingRelation = await document.hasMotcle(motcle);
        
                if (!existingRelation) {
                    await document.addMotcle(motcle);
                }
            }
        }
        

        return res.status(201).json({
            message: 'Document, intervenat, video et mot-cleés créés avec succès',
            document,
            intervenant,
            urlVideo,
            motscles
        });

    }catch (error){
        console.error(error);
        return res.status(500).json({message:'Ereur server',error : error.message});
    }
};

module.exports= {createFullDocument};