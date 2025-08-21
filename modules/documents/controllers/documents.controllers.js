const Document= require('../models/documents.models');
const TypeDocument=require('../../typedocuments/models/typedocuments.models');
const Intervenant= require('../../intervenants/models/intervenants.models');
const TypeIntervenant= require('../../typeintervenants/models/typeintervenants.models');
const Motcle=require('../../motcles/models/motcles.models');
const UrlVideo= require('../../urlVideo/models/urlVideo.models');

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
       const pdfPath = `uploads/documents/${pdfFile.filename}`;

        //Vérification et création document
        let document= await Document.findOne({where:{titre}});
        if(!document){
            document= await Document.create({
                titre,
                typeDocumentId: typeDoc.id,
                auteur,
                domaine,
                bio,
                mention,
                datepub,
                urlLivre: pdfPath
            });
        }

        // Gestion TypeIntervenant
        // -----------------------------
        let typeInterv = await TypeIntervenant.findOne({ where: { typeIntervenants: intervData.typeIntervenantId } });
        if (!typeInterv) {
            typeInterv = await TypeIntervenant.create({ typeIntervenants: intervData.typeIntervenantId });
        }

        //Vérification et Création intervenant
        const imageFile = req.files.imageFile?.[0];
        const imagePath = imageFile ? `uploads/intervenants/${imageFile.filename}` : null;

        let intervenant= await Intervenant.findOne({where: {nom:intervData.nom,prenom:intervData.prenom}});
        if (!intervenant){
            intervenant= await Intervenant.create({
                nom: intervData.nom,
                prenom: intervData.prenom,
                typeIntervenantId: typeInterv.id,
                bio: intervData.bio||null,
                image: imagePath
            });
        }

        //Création vidéo
        const urlVideo= await UrlVideo.create({
            urlVideo: videoData.url,
            duree: videoData.duree,
            resume: videoData.resume|| null,
            documentId: document.id,
            intervenantId: intervenant.id  
        });

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