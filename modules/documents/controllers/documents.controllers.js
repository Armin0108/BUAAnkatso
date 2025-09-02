const Document= require('../models/documents.models');
const TypeDocument=require('../../typedocuments/models/typedocuments.models');
const Intervenant= require('../../intervenants/models/intervenants.models');
const TypeIntervenant= require('../../typeintervenants/models/typeintervenants.models');
const Motcle=require('../../motcles/models/motcles.models');
const UrlVideo= require('../../urlVideo/models/urlVideo.models');
const fs = require('fs'); // au début du fichier
const path = require('path');
const checkRole = require('../../../middlewares/checkRole');

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
        } else if (pdfFile) {
            // Document existant + nouveau PDF → remplacer l'ancien
            const oldPdf = document.urlLivre;
            document.urlLivre = pdfFile.filename;
            await document.save();
        
            // Supprimer l'ancien PDF si il existe
            if (oldPdf) {
                const fullPath = path.join(__dirname, '../../../uploads/documents', oldPdf);
                if (fs.existsSync(fullPath)) {
                    fs.unlink(fullPath, (err) => {
                        if (err) console.error("Erreur suppression ancien PDF:", err);
                        else console.log("Ancien PDF supprimé:", fullPath);
                    });
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
        
        const newImageName = imageFile ? imageFile.filename : null;

        let intervenant= await Intervenant.findOne({where: {nom:intervData.nom,prenom:intervData.prenom}});
        
        if (!intervenant){
            intervenant= await Intervenant.create({
                nom: intervData.nom,
                prenom: intervData.prenom,
                typeIntervenantId: typeInterv.id,
                bio: intervData.bio||null,
                image: newImageName
            });
        } else if (newImageName) {
            // Intervenant existant + nouvelle image → remplacer l'ancienne
            const oldImage = intervenant.image;
        
            intervenant.image = newImageName;
            await intervenant.save();
        
            // Supprimer l'ancienne image si elle existe
            if (oldImage) {
                const fullPath = path.join(__dirname, "../../../uploads/intervenants", oldImage);
                if (fs.existsSync(fullPath)) {
                    fs.unlink(fullPath, (err) => {
                        if (err) console.error("Erreur suppression ancienne image:", err);
                        else console.log("Ancienne image supprimée:", fullPath);
                    });
                }
            }
        }
        
        //Création vidéo
        let urlVideoInstance; //pour stocké la video
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
                urlVideoInstance= await existingVideo.update({
                    urlVideo: videoData.url,
                    duree: videoData.duree,
                    resume: videoData.resume||null
                });
            }
        }else{
            urlVideoInstance= await UrlVideo.create({
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
            urlVideo: urlVideoInstance,
            motscles
        });

    }catch (error){
        console.error(error);
        return res.status(500).json({message:'Ereur server',error : error.message});
    }
};


// -----------------------------
// LISTE DE TOUS DOCUMENTS pour Créer UN AUTRE INTERVENANT AUSSI
// -----------------------------

const listAllDocuments = async (req, res) => {
    try {
      const doc = await Document.findAll({
        attributes: ['id', 'titre','auteur', 'bio','domaine','mention','datepub'],
        include: [
            { model: TypeDocument, as: "type", attributes: ['typeDocuments'] }
        ]
      });
      res.status(200).json({ data: doc });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  };


//UPDATE DOCUMENT SUPERADMIN SEULEMENT//
//---------------------------//

const updateDocument = async (req, res) => {
    try {
      const { id } = req.params; //id doc 
      const { titre, typeDocument, datepub, domaine, auteur, bio } = req.body;
  
      const document = await Document.findByPk(id);
      if (!document) return res.status(404).json({ message: "Document introuvable" });
  
      // Si un typeDocument est fourni, on le crée ou récupère
      if (typeDocument) {
        let typeDoc = await TypeDocument.findOne({ where: { typeDocuments: typeDocument } });
        if (!typeDoc) {
          typeDoc = await TypeDocument.create({ typeDocuments: typeDocument });
        }
        document.typeDocumentId = typeDoc.id;
      }
  
      // Mise à jour seulement des champs fournis
      if (titre) document.titre = titre;
      if (datepub) document.datepub = datepub;
      if (domaine) document.domaine = domaine;
      if (auteur) document.auteur = auteur;
      if (bio) document.bio = bio;
  
      await document.save();
      res.json({ message: "Document mis à jour avec succès", document });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};


module.exports= {createFullDocument,listAllDocuments,updateDocument};//