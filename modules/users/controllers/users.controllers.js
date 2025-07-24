const User = require('../models/users.models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const {sequilize}= require('../../../configs/sequelize');

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
  
      // ✅ Créer le token JWT avec le rôle
      const token = jwt.sign(
        {
          userId: user.ID,
          login: user.login,
          role: user.role, // 🟡 c'était oublié ici
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

exports.createUser = async (req, res) => {
    const { login, password, role } = req.body;
  
    if (!login || !password) {
      return res.status(400).json({ message: 'Login et mot de passe sont requis.' });
    }
  
    if (role && !['admin', 'SuperAdmin'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide.' });
    }
  
    try {
      const existingUser = await User.findOne({ where: { login } });
      if (existingUser) {
        return res.status(409).json({ message: 'Ce login est déjà utilisé.' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await User.create({
        login,
        password: hashedPassword,
        role: role || 'admin'  // par défaut si non fourni
      });
  
      return res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: {
          ID: newUser.ID,
          login: newUser.login,
          role: newUser.role
        }
      });
  
    } catch (error) {
      console.error('Erreur lors de la création :', error);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  };
  

exports.logoutUser = (req, res) => {
    res.json({ message: 'Déconnexion réussie' });
};
  