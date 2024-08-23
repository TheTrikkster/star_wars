# Instructions pour le Projet Star Wars

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les dépendances nécessaires. Vous aurez besoin de :

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

## Installation et Exécution

1. Clonez le dépôt sur votre machine locale :

    ```bash
    git clone https://github.com/TheTrikkster/star_wars.git
    ```

2. Accédez au répertoire du projet :

    ```bash
    cd star_wars
    ```

### Pour le Front-End

1. Accédez au répertoire du front-end :

    ```bash
    cd rebels_alliance_front
    ```

2. Installez les dépendances front-end :

    ```bash
    yarn
    ```

3. Démarrez le serveur de développement front-end :

    ```bash
    yarn start
    ```

   Le front-end sera accessible à [http://localhost:3000](http://localhost:3000)

### Pour le Back-End

1. Accédez au répertoire du back-end :

    ```bash
    cd ../rebels_alliance_api
    ```

2. Installez les dépendances back-end :

    ```bash
    yarn
    ```

3. Démarrez le serveur back-end :

    ```bash
    nodemon server.js
    ```

   Le back-end sera accessible à [http://localhost:1234](http://localhost:1234)
