# 📦 Auto Repack & Upload avec file d’attente

**Auto Repack & Upload** est un outil pour Windows qui :
- Automatise le nettoyage, le repack et la recompression d'un fichier `.rar`
- Insère un commentaire personnalisé dans chaque archive
- Upload automatiquement l'archive sur **PixelDrain**
- Génère un **lien public** et le copie dans le presse-papier
- 📥 Et surtout : permet de **préparer plusieurs tâches à la suite** grâce à une **file d'attente**

---

## ✨ Fonctionnalités principales
- Entrée des informations de chaque jeu via `main.bat`, même pendant un traitement en cours
- Traitement automatique des tâches une par une avec `worker.bat`
- Suppression automatique des fichiers inutiles `.url`
- Ajout automatique du fichier `logo.png` à chaque archive
- Commentaire injecté automatiquement depuis un modèle (`commentaire_template.txt`)
- Upload direct vers **PixelDrain** via leur API
- Lien final automatiquement copié dans le presse-papier

---

## ⚙️ Utilisation

### 1. Lance le traitement automatique
> Démarre `worker.bat` (en fond, en permanence)

```batch
double-clic sur worker.bat
```

Ce script surveille le dossier `queue\` et traite chaque jeu automatiquement.

---

### 2. Ajoute un nouveau jeu à traiter
> Lance `main.bat` à chaque fois que tu veux ajouter un jeu

```batch
double-clic sur main.bat
```

Il te demandera :
- Nom du jeu
- Version
- Nom du repacker
- Fichier `.rar`

Il enregistre ces infos dans une file d’attente pour traitement automatique par `worker.bat`.

---

## 🔧 Personnalisation

### Modifier votre Token API PixelDrain
1. Ouvre le fichier `worker.bat`
2. Remplace la valeur de `pixeldrain_api_key` :
   ```batch
   set "pixeldrain_api_key=VOTRE_CLE_API_ICI"
   ```

---

### Modifier le commentaire ajouté dans chaque archive
1. Ouvre `commentaire_template.txt`
2. Personnalise le texte.

> Le script remplacera automatiquement `%%REPACKER%%` par le nom que tu as indiqué !

---

### Changer le logo ajouté à l’archive
- Remplace simplement `logo.png` par ton image (garde le même nom).
- Elle sera ajoutée automatiquement dans chaque archive `.rar`.

---

## 📂 Structure du projet

```plaintext
main.bat                       <- Ajoute une tâche à la file d’attente
worker.bat                     <- Exécute automatiquement les tâches
commentaire_template.txt       <- Modèle de commentaire pour les .rar
logo.png                       <- Logo ajouté dans chaque archive
queue/                         <- Tâches en attente
Archives/                      <- Archives générées
```

---

## 📋 Notes importantes
- WinRAR doit être installé à :
  ```
  C:\Program Files\WinRAR\WinRAR.exe
  ```
- `curl` est requis (disponible nativement sur Windows 10 et 11)
- Compatible Windows 10/11 uniquement

---

## 🤝 Projet communautaire

Ce projet est développé pour la communauté **cFinder**.  
Merci de **ne pas redistribuer sans crédit** 🙏

**Crédit** : lolo04 / TourDaiglun
