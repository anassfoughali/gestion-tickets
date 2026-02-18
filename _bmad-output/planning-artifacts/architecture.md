---
stepsCompleted: [1, 2]
inputDocuments: ['specifications-utilisateur-fournies']
workflowType: 'architecture'
project_name: 'gestion-tickets'
user_name: 'Anass'
date: '2026-02-18'
---

# Architecture Decision Document - Gestion des Tickets

_Ce document se construit collaborativement à travers une découverte étape par étape. Les sections sont ajoutées au fur et à mesure que nous travaillons ensemble sur chaque décision architecturale._

## Context du Projet

Une application web de gestion de tickets permettant aux clients de créer et suivre des tickets, et aux administrateurs de les gérer avec un tableau de bord statistique.

**Utilisateurs:**
- **Clients**: Créer tickets, suivre statut, communiquer
- **Admin**: Tableau de bord, gestion tickets, statistiques

**Exigences fonctionnelles clés:**
- Authentification JWT avec rôles (ROLE_ADMIN / ROLE_CLIENT)
- Gestion complète des tickets (CRUD + statuts + priorités)
- Tableau de bord admin avec statistiques
- Système de commentaires sur les tickets

## Analyse du Contexte du Projet

### Vue d'ensemble des exigences

**Exigences fonctionnelles:**

L'application de gestion de tickets doit supporter deux types d'utilisateurs avec des capacités distinctes :

- **Clients** : Inscription/connexion, création de tickets, consultation de leurs propres tickets, ajout de commentaires, suivi du statut
- **Administrateurs** : Accès au dashboard, visualisation de tous les tickets, filtrage, modification de statut, assignation de priorités, consultation des statistiques

Chaque ticket contient : id, titre, description, statut (OPEN/IN_PROGRESS/CLOSED), priorité (LOW/MEDIUM/HIGH), dates de création/mise à jour, et référence au client.

**Exigences non-fonctionnelles:**

- **Sécurité** : Authentification JWT obligatoire, mots de passe chiffrés (BCrypt), contrôle d'accès basé sur les rôles (RBAC)
- **Performance** : Dashboard admin doit afficher des statistiques agrégées efficacement
- **Maintenabilité** : Structure de données claire et extensible

**Échelle & Complexité:**

- Domaine principal: **Application web full-stack**
- Niveau de complexité: **Moyen**
- Composants architecturaux estimés: **6-8 composants**
- Type de projet: Application CRUD avec dashboard analytique

### Contraintes & Dépendances techniques

- Utilisation obligatoire de JWT pour l'authentification
- Encryption des mots de passe via BCrypt
- Base de données relationnelle requise (relations client-ticket)
- API REST comme interface backend-frontend

### Préoccupations transversales identifiées

1. **Authentification & Autorisation** : Système JWT avec vérification de rôles sur chaque endpoint sensible
2. **Validation des données** : Validation côté serveur obligatoire pour tous les inputs utilisateur
3. **Gestion des erreurs** : Codes HTTP appropriés et messages d'erreur cohérents
4. **Audit & Traçabilité** : Historique des changements de statut et actions administratives
5. **Sécurité web** : Protection CORS, XSS, CSRF, rate limiting pour prévenir les abus
6. **Séparation des préoccupations** : Isolation stricte entre logique client et admin

