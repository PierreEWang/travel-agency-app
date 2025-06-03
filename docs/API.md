# Travel Agency API - Guide curl

## Démarrage rapide
```bash
# Démarrer le serveur
cd server
npm run dev
```

## POST - Créer une destination

### Exemple basique
```bash
curl -X POST http://localhost:5000/api/destinations \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Rome, Italie",
    "description": "Ville éternelle riche en histoire et culture",
    "prix": 750,
    "duree": 4,
    "categorie": "culture",
    "dateDepart": "2024-08-15",
    "placesDisponibles": 20
  }'
```

### Exemple avec activités
```bash
curl -X POST http://localhost:5000/api/destinations \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Barcelone, Espagne",
    "description": "Architecture moderniste et plages méditerranéennes",
    "prix": 650,
    "duree": 5,
    "image": "https://example.com/barcelona.jpg",
    "categorie": "ville",
    "activites": ["Sagrada Familia", "Park Güell", "Las Ramblas"],
    "dateDepart": "2024-09-01",
    "placesDisponibles": 25
  }'
```

## POST - Créer une réservation

```bash
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
	"destinationId": 1,
	"client": {
	  "nom": "Dupont",
	  "prenom": "Marie",
	  "email": "marie.dupont@email.com",
	  "telephone": "0123456789"
	},
	"nombrePersonnes": 2,
	"dateVoyage": "2025-07-15",
	"commentaires": "Voyage anniversaire"
  }'
```

## PUT - Modifier une destination

### Modification complète (destination ID 1)
```bash
curl -X PUT http://localhost:5000/api/destinations/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Paris, France - Édition Luxe",
    "description": "La ville lumière avec expérience premium",
    "prix": 1299,
    "duree": 7,
    "categorie": "ville",
    "placesDisponibles": 15,
    "disponible": true
  }'
```

### Modification partielle (prix seulement)
```bash
curl -X PUT http://localhost:5000/api/destinations/2 \
  -H "Content-Type: application/json" \
  -d '{
    "prix": 999
  }'
```

### Désactiver une destination
```bash
curl -X PUT http://localhost:5000/api/destinations/3 \
  -H "Content-Type: application/json" \
  -d '{
    "disponible": false
  }'
```

## Réponses types

### Succès (201/200)
```json
{
  "success": true,
  "message": "Destination créée avec succès",
  "data": {
    "id": 5,
    "nom": "Rome, Italie",
    "prix": 750,
    "disponible": true
  }
}
```

### Erreur (400)
```json
{
  "success": false,
  "message": "Données invalides",
  "erreurs": [
    "Le nom doit contenir au moins 3 caractères",
    "Le prix doit être supérieur à 0"
  ]
}
```

## Champs obligatoires

### Destination
- `nom` (min 3 caractères)
- `description` (min 10 caractères)  
- `prix` (> 0)
- `duree` (> 0)
- `categorie`

### Réservation
- `destinationId`
- `client.nom` (min 2 caractères)
- `client.prenom` (min 2 caractères)
- `client.email` (format email)
- `client.telephone` (min 10 caractères)
- `nombrePersonnes` (1-10)
- `dateVoyage` (future)