# auto-game-up
Auto Repack &amp; Upload est un outil simple pour Windows qui automatise totalement le processus de :  Repack d'un fichier .rar  Nettoyage des fichiers indésirables  Ajout d'un commentaire personnalisé dans l'archive  Upload automatique de l'archive vers PixelDrain  Génération et copie du lien public de téléchargement..



# 📦 Auto Repack & Upload

**Auto Repack & Upload** est un outil simple pour Windows qui :
- Automatise le nettoyage, repack et la recompression d'un fichier `.rar`
- Ajoute un commentaire personnalisé à l'archive
- Upload automatiquement l'archive sur **PixelDrain**
- Génère un **lien public** prêt à partager

---

## ✨ Fonctionnalités principales
- Suppression automatique des fichiers inutiles `.url`
- Ajout automatique d'un fichier `logo.png` à l'archive
- Commentaire personnalisé injecté dans l'archive (`commentaire_template.txt`)
- Upload direct sur **PixelDrain** via API
- Copie automatique du lien final dans le presse-papier

---

## 🔧 Personnalisation

### Modifier votre Token API PixelDrain
1. Ouvrez le fichier `auto_repack_pixeldrain.bat`
2. Remplacez la valeur de `pixeldrain_api_key` par **votre** clé API personnelle :
   ```batch
   set "pixeldrain_api_key=votre-clé-api-ici"
   ```


---

### Modifier le commentaire inséré dans l'archive
1. Ouvrez le fichier `commentaire_template.txt`
2. Personnalisez le texte comme vous voulez.
   
⚡ Le script remplacera automatiquement `%%REPACKER%%` par le nom du repacker que vous donnez au lancement ! repacker = le crédit de la personne qui a créé le fichié 

---

### Modifier le logo intégré
- Remplacez simplement le fichier `logo.png` par votre propre image (même nom).
- Le fichier sera ajouté automatiquement dans toutes les archives générées.

---

## 📂 Structure du projet

```plaintext
/auto_repack_pixeldrain.bat      <- Le script principal
/commentaire_template.txt        <- Le modèle de commentaire à insérer
/logo.png                        <- Le logo à insérer dans chaque archive
/Archives/                       <- Dossier où les archives générées sont stockées
```

---

## 📋 Notes importantes
- Assurez-vous que **WinRAR** est installé et accessible au chemin :
  ```
  C:\Program Files\WinRAR\WinRAR.exe
  ```
- Utilisation recommandée sous **Windows 10 ou 11**.
- Nécessite **curl** installé (normalement présent nativement sous Windows 10/11).






Ce projet est développé pour la communauté cFinder.xyz
Merci de ne pas redistribuer sans crédit ! ❤️

Crédit : lolo04 / TourDaiglun