const User = require('../models/users.models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Demand = require('../../users/models/demand.models');

// Créer une nouvelle demande
exports.createDemand = async (req, res) => {
    const { login, requestedRole } = req.body;
    if (!login || !requestedRole) {
        return res.status(400).json({ message: 'Login et rôle demandé sont requis.' });
    }
    if (!['admin', 'SuperAdmin'].includes(requestedRole)) {
        return res.status(400).json({ message: 'Rôle demandé invalide.' });
    }

    try {
        const existingDemand = await Demand.findOne({ where: { login } });
        const existingUser = await User.findOne({ where: { login } });

        if (existingDemand || existingUser) {
            return res.status(409).json({ message: 'Login déjà utilisé ou demande en attente.' });
        }

        const demand = await Demand.create({ login, requestedRole });
        res.status(201).json({ message: 'Demande créée avec succès.', demand });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// Lister toutes les demandes (SuperAdmin)
exports.listDemands = async (req, res) => {
    try {
        const demands = await Demand.findAll({ where: { status: 'pending' } });
        res.status(200).json({ data: demands });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// Valider une demande et créer le User
exports.approveDemand = async (req, res) => {
  const { id } = req.params; // id de la demande
  const { password } = req.body; // mot de passe fourni par le SuperAdmin

  try {
      const demand = await Demand.findByPk(id);
      if (!demand) return res.status(404).json({ message: 'Demande introuvable.' });

      if (!password || password.length < 6) {
          return res.status(400).json({ message: 'Mot de passe requis (au moins 6 caractères).' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
          login: demand.login,
          password: hashedPassword,
          role: demand.requestedRole
      });

      // Supprimer la demande validée
      await demand.destroy();

      res.status(201).json({ message: 'Utilisateur créé et demande supprimée.', user: newUser });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


// Rejeter une demande (optionnel)
exports.rejectDemand = async (req, res) => {
    const { id } = req.params;
    try {
        const demand = await Demand.findByPk(id);
        if (!demand) return res.status(404).json({ message: 'Demande introuvable.' });

        await demand.destroy();
        res.status(200).json({ message: 'Demande rejetée et supprimée.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// ========================
// Authentification
// ========================

// Connexion
exports.loginUser = async (req, res) => {
    const { login, password } = req.body;
    try {
      const user = await User.findOne({ where: { login } });
      if (!user) {
        return res.status(401).json({ message: 'Identifiants invalides' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Mot de passe incorrect' });
      }
  
      // Créer le token JWT avec le rôle
      const token = jwt.sign(
        {
          userId: user.ID,
          login: user.login,
          role: user.role, //  c'était oublié ici
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.json({
        message: 'Connexion réussie',
        token,
        user: {
          ID: user.ID,
          login: user.login,
          role: user.role,
        }
      });
    } catch (error) {
      console.error('Erreur de connexion :', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };  
  

exports.logoutUser = (req, res) => {
    res.json({ message: 'Déconnexion réussie' });
};
  