# Répertoire

Le nom d'un répertoire DOIT être nommé en `snake_case`.

Un répertoire N'EST PAS un paquet de module, mais un répertoire peut être un
enfant d'un paquet de module.

## Exemple

```bash
┌───(PhiSyX@フィジックス)
└── λ ls
    └── libs/npm/my-module/ # package npm "my-module"
        ├── package.json # { "name": "@phisyx/my-module" }
        └── src/ 
            ├── channel_room/
            └── room/
```
