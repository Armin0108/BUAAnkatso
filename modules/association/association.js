const Intervenant = require('../intervenants/models/intervenants.models');
const TypeIntervenant = require('../typeintervenants/models/typeintervenants.models');
const Document= require('../documents/models/documents.models');
const TypeDocument= require('../typedocuments/models/typedocuments.models');
const Motcle = require('../motcles/models/motcles.models');

TypeIntervenant.hasMany(Intervenant, {
  foreignKey: 'TypeIntervenantId',
  as: 'intervenants'
});

Intervenant.belongsTo(TypeIntervenant, {
  foreignKey: 'TypeIntervenantId',
  as: 'type'
});

// Un TypeDocument peut avoir plusieurs documents
TypeDocument.hasMany(Document, {
    foreignKey: 'typeDocumentId', // doit correspondre à la clé étrangère dans Document
    as: 'documents',
  });
  
  // Un Document appartient à un seul TypeDocument
  Document.belongsTo(TypeDocument, {
    foreignKey: 'typeDocumentId',
    as: 'type',
  });
  
  Document.belongsToMany(Motcle, {
    through: 'DocumentMotcle',
    foreignKey: 'DocumentId',
    otherKey: 'MotcleId',
    as: 'motcles'
  });
  
  Motcle.belongsToMany(Document, {
    through: 'DocumentMotcle',
    foreignKey: 'MotcleId',
    otherKey: 'DocumentId',
    as: 'documents'
  });