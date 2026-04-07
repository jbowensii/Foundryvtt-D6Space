Project Guidelines

Thank you for contributing to OpenD6 Space. This document outlines conventions and workflows to keep the codebase consistent and easy to maintain.

Styling (SCSS/CSS) — IMPORTANT
- Do not edit compiled CSS files in src\\css directly.
- All styling changes must be made in the scss directory.
- The build process compiles SCSS to CSS and writes output to src\\css.
- Primary entry point: scss\\od6s.scss (which imports other partials under scss\\components, scss\\global, and scss\\utils).

Recommended commands
- One-off compile: npm run build:css
- Watch and auto-compile on change: npm run watch (also watches other build inputs)

Notes
- Any direct edits to files under src\\css will be overwritten the next time SCSS is compiled.
- If you need a new component, add a new partial under scss\\components and import it from scss\\od6s.scss.

JavaScript/TypeScript
- Keep logic modular and organized under src\\module.
- Prefer small, single-purpose functions and clear names.
- Keep localization keys for user-facing text; avoid hard-coded strings in UI.

Localization
- Add new strings to the appropriate file under src\\lang\\translations.
- Use Foundry VTT localization helpers where user-visible text is required.

Assets
- Place images and other assets under src\\assets or the appropriate system path, following the existing structure.

Commit messages
- Use clear, descriptive messages. Example prefixes: feat:, fix:, docs:, style:, refactor:, build:.

Pull requests
- Include a short description of the change and any related issue references.
- If the change affects UI styling, confirm that changes were made in scss/ and that npm run build:css or npm run watch was used to generate CSS.
- Add screenshots or short clips for significant UI changes.

Versioning & releases
- Follow semantic versioning when tagging releases.
- Update CHANGELOG.md with notable changes.

Development tips
- Run npm run watch during development to rebuild SCSS and other watched inputs automatically.
- Check the README and build script comments for additional developer workflows.