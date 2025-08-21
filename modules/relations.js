// relations.js
const Intervenant = require('../modules/intervenants/models/intervenants.models');
const TypeIntervenant = require('../modules/typeintervenants/models/typeintervenants.models');
const Document = require('../modules/documents/models/documents.models');
const TypeDocument = require('../modules/typedocuments/models/typedocuments.models');
const Motcle = require('../modules/motcles/models/motcles.models');
const UrlVideo = require('../modules/urlVideo/models/urlVideo.models');

// -----------------------
// TypeIntervenant -- Intervenant
// -----------------------
TypeIntervenant.hasMany(Intervenant, { foreignKey: 'typeIntervenantId', as: 'intervenants' });
Intervenant.belongsTo(TypeIntervenant, { foreignKey: 'typeIntervenantId', as: 'type' });

// -----------------------
// TypeDocument -- Document
// -----------------------
TypeDocument.hasMany(Document, { foreignKey: 'typeDocumentId', as: 'documents' });
Document.belongsTo(TypeDocument, { foreignKey: 'typeDocumentId', as: 'type' });

// -----------------------
// Document -- Motcle (Many-to-Many via table pivot automatique)
// -----------------------
Document.belongsToMany(Motcle, { through: 'DocumentMotcle', foreignKey: 'DocumentId', otherKey: 'MotcleId', as: 'motcles' });
Motcle.belongsToMany(Document, { through: 'DocumentMotcle', foreignKey: 'MotcleId', otherKey: 'DocumentId', as: 'documents' });

// -----------------------
// Document -- Intervenant via UrlVideo (pivot “riche”)
// -----------------------
Intervenant.hasMany(UrlVideo, { foreignKey: 'intervenantId', as: 'videos' });
UrlVideo.belongsTo(Intervenant, { foreignKey: 'intervenantId', as: 'intervenant' });

Document.hasMany(UrlVideo, { foreignKey: 'documentId', as: 'videos' });
UrlVideo.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });
