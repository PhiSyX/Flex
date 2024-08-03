# Composant Vue

Le nom d'un répertoire de composant DOIT être nommé en `PascalCase`.

Le nom d'un fichier de composant DOIT être nommé en `PascalCase`. Le nom d'un fichier de composant doit être suivi de
`.template` s'il s'agit d'un composant principale. Les composants liés aux composants principaux peuvent être suivi de
`.template` mais n'est pas obligatoire.

## Exemple

```bash
┌───(PhiSyX@フィジックス)
└── λ ls
    └── my-module/
        ├── package.json
        └── components/
            ├── Avatar
            |   ├── Avatar.stories.vue
            |   ├── Avatar.template.vue
            └── Button
                ├── Button.stories.vue
                ├── Button.template.vue
                ├── Button.primary.vue
                ├── Button.secondary.vue
                ├── ButtonPrimary.vue
                └── ButtonSecondary.vue
```
