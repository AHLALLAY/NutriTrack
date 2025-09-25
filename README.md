## NutriTrack — Guide de contribution (essentiel)

### 1) Installation rapide
```bash
git clone https://github.com/AHLALLAY/NutriTrack
cd NutriTrack
npm install
```

Scripts utiles:
- `npm run dev` — serveur de dev
- `npm run build` — build de prod
- `npm run test` — tests
- `npm run lint` — lint

### 2) Workflow Git (équipe de 3)
- Branche principale: `master` (toujours stable)
- Créez une branche depuis `master`:
```bash
git checkout master && git pull
git checkout -b username/feature
```
- Avant PR: rebase sur `master` et résolvez les conflits
```bash
git fetch origin
git rebase origin/master
git push --force-with-lease
```

### 3) Conventions de commit (Conventional Commits)
Format: `type(scope): message`
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Exemples:
```text
feat(meals): ajout création de repas
fix(api): corrige erreur 500 sur /me
```

### 4) Pull Requests et revue
- PR petite et décrite clairement (contexte, solution, impacts)
- CI verte: lint, build, tests OK
- Revue: **2 approbations** avant merge
- Merge: **Squash & Merge** avec message propre

### 5) Qualité minimale
- Pas de code mort ni secrets en clair
- Respecter ESLint/Prettier
- Ajouter/mettre à jour les tests des changements

### 6) Conflits
1. Rebase sur `master`
2. Résoudre conflits
3. Relancer lint/tests
4. Push avec `--force-with-lease`


