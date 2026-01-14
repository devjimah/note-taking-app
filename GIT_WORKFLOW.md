# Git Workflow Documentation

## Branching Strategy

This project follows a **three-branch approach** for managing code changes:

### Main Branches

1. **`main`** - Production-ready code
   - Contains stable, tested code
   - Only receives merges from `dev` after thorough testing
   - Protected branch - requires pull request approval

2. **`dev`** (Development) - Integration branch
   - All feature branches are merged here first
   - Testing and integration happens on this branch
   - Merges to `main` after validation

3. **Feature Branches** - Individual feature development
   - Created from `dev` branch
   - Named with prefix: `feature/feature-name`
   - Merged back to `dev` via Pull Request

### Branch Flow
```
main ← dev ← feature/feature-name
```

## Commit Conventions

### Commit Message Format
```
<type>: <short description>

[optional body]
```

### Types Used
- **Add** - New feature or file
- **Update** - Modifications to existing code
- **Fix** - Bug fixes
- **Remove** - Removing code/files
- **Refactor** - Code restructuring without functionality change

### Examples
```bash
git commit -m "Add export/import module with JSON validation"
git commit -m "Update UI to include share button"
git commit -m "Fix category badge styling"
```

### Commit Guidelines
- Use present tense ("Add feature" not "Added feature")
- Keep first line under 50 characters
- Reference issue numbers when applicable
- Make atomic commits (one logical change per commit)

## Feature Branches Created

| Branch Name | Description | Status |
|-------------|-------------|--------|
| `feature/export-import-notes` | Export/Import notes as JSON | Complete |
| `feature/note-categories` | Categories/Folders for notes | Complete |
| `feature/rich-text-formatting` | Bold, italic, lists formatting | Complete |
| `feature/note-sharing` | Shareable links for notes | Complete |

## Git Commands Used

### Branch Management
```bash
# List all branches
git branch -a

# Create and switch to new branch
git checkout -b feature/feature-name

# Switch between branches
git checkout branch-name

# Delete local branch
git branch -d feature/feature-name
```

### Staging and Committing
```bash
# Stage specific files
git add filename.js

# Stage all changes
git add .

# Commit with message
git commit -m "Your commit message"

# Amend last commit
git commit --amend
```

### Remote Operations
```bash
# Push branch to remote
git push -u origin feature/feature-name

# Pull latest changes
git pull origin dev

# Fetch all remote branches
git fetch --all
```

### Viewing History
```bash
# View commit log
git log --oneline

# View branch graph
git log --oneline --graph --all

# View changes in a file
git diff filename.js

# View file change history
git blame filename.js
```

## Merge Conflicts Encountered

### Example Conflict Resolution

During the development of the `feature/note-categories` branch, a merge conflict occurred when updating the CSS styles.

**Conflict Location:** `css/styles.css`

**Conflict Markers:**
```css
<<<<<<< HEAD
.note-item__tags {
  display: flex;
  gap: var(--spacing-50);
}
=======
.note-item__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-100);
}
>>>>>>> feature/note-categories
```

**Resolution Steps:**
1. Identified the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
2. Compared both versions of the code
3. Chose to keep the feature branch changes (flex-wrap and larger gap)
4. Removed conflict markers
5. Tested the merged code
6. Committed the resolved conflict

**Resolved Code:**
```css
.note-item__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-100);
}
```

## Pull Request Checklist

For each feature:

- [ ] Created feature branch from `dev`
- [ ] Made minimum 3 commits with clear messages
- [ ] Pushed feature branch to remote
- [ ] Created pull request to `dev` branch
- [ ] Assigned PR to TA
- [ ] Addressed TA feedback (if any)
- [ ] TA approved and merged PR
- [ ] Pulled updated `dev` branch
- [ ] Deleted feature branch locally and remotely

## Feature Implementation Summary

### Feature 1: Export/Import Notes
**Files Modified:**
- `js/exportImport.js` (new)
- `js/settings.js`
- `settings.html`
- `css/styles.css`
- `js/main.js`

**Commits:**
1. Add export/import module with JSON validation and duplicate prevention
2. Add export/import UI in settings with data management section
3. Add keyboard shortcut Ctrl+E for quick note export

### Feature 2: Note Categories
**Files Modified:**
- `js/noteManager.js`
- `js/storage.js`
- `js/ui.js`
- `js/main.js`
- `index.html`
- `css/styles.css`

**Commits:**
1. Add categories module with CRUD operations
2. Add category badge styling for notes display
3. Add categories section styling with hover effects

### Feature 3: Rich Text Formatting
**Files Modified:**
- `js/richTextEditor.js` (new)
- `js/main.js`
- `js/ui.js`
- `index.html`
- `css/styles.css`

**Commits:**
1. Add rich text editor module with formatting functions
2. Add formatting toolbar UI and rich text editor styles
3. Integrate rich text editor with main app

### Feature 4: Note Sharing
**Files Modified:**
- `js/sharing.js` (new)
- `shared.html` (new)
- `js/main.js`
- `index.html`

**Commits:**
1. Add note sharing module with link generation and clipboard copy
2. Add read-only shared note view page
3. Add share button and integrate sharing functionality

## Screenshots

### Git Log (Commit History)
```
* 371a5a3 Add share button and integrate sharing functionality in main app
* a97b9ef Add read-only shared note view page
* b439d96 Add note sharing module with link generation and clipboard copy
...
```

### Branch Structure
```
* main
|
* dev
|\
| * feature/export-import-notes
| * feature/note-categories
| * feature/rich-text-formatting
| * feature/note-sharing
```

## Best Practices Followed

1. **Atomic Commits** - Each commit represents one logical change
2. **Descriptive Messages** - Clear, concise commit messages
3. **Feature Isolation** - Each feature developed in its own branch
4. **Code Review** - All changes go through PR review
5. **No Direct Commits to Main** - All changes flow through dev
