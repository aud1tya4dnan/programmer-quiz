---
name: documentation
description: Skill for creating and maintaining project documentation with screenshots and usage guides
---

# Documentation Skill

A skill for generating and maintaining comprehensive project documentation, including README files, usage guides, and visual documentation with annotated screenshots.

## When to use

- When creating or updating the project README
- When documenting new features with screenshots
- When writing usage guides or setup instructions
- When preparing release notes or changelogs

## Instructions

### 1. Screenshot Capture

When documenting UI features:
1. Start the dev server with `npm run dev`
2. Use the browser tool to navigate to the relevant pages
3. Capture screenshots of each state/feature
4. Save screenshots to `docs/images/` with descriptive names using the format `NN-feature-name.png` (e.g., `01-empty-state.png`)

### 2. README Structure

The project README (`README.md`) should follow this structure:
1. **Title & badges** — project name, tech stack badges
2. **Screenshot** — hero image showing the app in action  
3. **Features** — bullet list of key capabilities
4. **Getting Started** — prerequisites, install, and run steps
5. **Usage Guide** — step-by-step with embedded screenshots
6. **Configuration** — settings, API keys, database options
7. **Project Structure** — file tree overview
8. **Contributing** — how to contribute

### 3. Image References

Always use relative paths for images in markdown:
```markdown
![Description](docs/images/filename.png)
```

### 4. Keeping Docs Updated

When implementing new features:
1. Add screenshots of the new feature to `docs/images/`
2. Update the README's usage guide section
3. Update the features list if applicable
4. Update the project structure if new files were added

### 5. Style Guide

- Use concise, scannable language
- Prefer tables over long lists for structured data
- Use code blocks with language hints for commands
- Include both the "what" and "why" for configuration options
- Keep paragraphs short (2-3 sentences max)
