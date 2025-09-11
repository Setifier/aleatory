# 🎨 Thème de couleurs Aleatory

## Couleurs principales

### 🟣 Primary (Violet) - #6161d8

Couleur principale de l'application, utilisée pour :

- Boutons principaux
- Liens actifs
- Focus states
- Animations importantes

**Variantes disponibles :**

- `primary-50` : #f4f3ff (très clair)
- `primary-100` : #ebe9fe
- `primary-200` : #d9d6fe
- `primary-300` : #bfb8fc
- `primary-400` : #a195f8
- `primary-500` : #6161d8 (couleur de base)
- `primary-600` : #5757c2
- `primary-700` : #4c4ba3
- `primary-800` : #403f85
- `primary-900` : #36356b (très foncé)

### 🟡 Secondary (Beige/Or) - #bcb88f

Couleur secondaire, utilisée pour :

- Arrière-plans doux
- Bordures
- Elements de navigation
- Zones de contenu

**Variantes disponibles :**

- `secondary-50` : #fdfcf9 (très clair)
- `secondary-100` : #fbf8f0
- `secondary-200` : #f6f0e0
- `secondary-300` : #ede4c7
- `secondary-400` : #e1d5a8
- `secondary-500` : #bcb88f (couleur de base)
- `secondary-600` : #a8a47b
- `secondary-700` : #8d8968
- `secondary-800` : #757158
- `secondary-900` : #5f5d4a (très foncé)

### 🔵 Accent (Bleu foncé) - #181854

Couleur d'accent, utilisée pour :

- Textes principaux
- Titres
- Elements de suppression/danger
- Contrastes élevés

**Variantes disponibles :**

- `accent-50` : #f5f5f9 (très clair)
- `accent-100` : #eaeaf2
- `accent-200` : #d6d7e6
- `accent-300` : #b8b9d3
- `accent-400` : #9497bc
- `accent-500` : #7678a8
- `accent-600` : #636397
- `accent-700` : #555587
- `accent-800` : #484971
- `accent-900` : #181854 (couleur de base)

## Utilisation dans les composants

### Boutons

- **Principal** : `bg-primary-500 hover:bg-primary-600`
- **Secondaire** : `bg-secondary-500 hover:bg-secondary-600`
- **Danger/Suppression** : `bg-accent-600 hover:bg-accent-700`

### Textes

- **Titres principaux** : `text-accent-900`
- **Textes normaux** : `text-accent-700`
- **Textes secondaires** : `text-accent-600`

### Arrière-plans

- **Principal** : `bg-secondary-50`
- **Cartes** : `bg-white` avec `border-secondary-200`
- **Focus/Succès** : `bg-primary-50` avec `border-primary-300`

### États interactifs

- **Focus** : `focus:ring-primary-500 focus:border-primary-500`
- **Hover liens** : `hover:text-primary-600`
- **Erreurs** : `text-accent-600 bg-accent-50 border-accent-200`

## Classes Tailwind personnalisées

Le thème est configuré dans `tailwind.config.js` et peut être utilisé avec les classes :

- `bg-primary-{shade}`
- `text-primary-{shade}`
- `border-primary-{shade}`
- `ring-primary-{shade}`

Et de même pour `secondary-{shade}` et `accent-{shade}`.
