OpenD6 Space – Click‑Through Test Plan (Quench‑Ready)

Overview
- Purpose: Provide a comprehensive, repeatable manual test plan covering all end‑user and GM functions of the OpenD6 Space system for Foundry VTT. The structure and IDs are designed so this plan can be incrementally automated using the Quench module.
- Scope: System load, configuration, localization, actors, items, rolls, dialogs, automation, compendia, chat, tokens, and sockets.
- Target FVTT: As per src/system.json, Foundry VTT v13 (min 13, verified 13.347). If running a different version, note deviations in results.
- System ID: od6s
- Required module(s): socketlib

How to Use This Plan
- Run the suites top‑to‑bottom on a clean test World unless otherwise noted.
- Each test includes: ID, Preconditions, Steps, Expected Result.
- For Quench automation later, use the Suite and Test IDs verbatim (e.g., O6S.SYS.001). One manual step ≈ one Quench test step.

Data and Test World
- Create a new World named “O6S Test World”.
- Enable only: OpenD6 Space (system), socketlib (module). Disable other modules unless the test explicitly mentions them.
- Create two users: GM1 (Gamemaster), PL1 (Player). Use separate browsers or private windows when validating permissions/ownership.
- Create a Scene named “Blank” with grid on and units in meters.

Suite O6S.SYS – System Load & Configuration
- O6S.SYS.001 System installs and loads
  Preconditions: Foundry application running; internet connectivity.
  Steps:
  1. Install system from manifest in README (or system.json in repo for local dev). Select od6s as the system for a new World.
  2. Launch the World and wait for initial load.
  Expected: World loads without console errors; OpenD6 Space splash/background appears; od6s css is applied; socketlib dependency is detected and loaded.

- O6S.SYS.002 System settings menu present
  Steps:
  1. Open Game Settings > Configure Settings > System Settings.
  2. Review presence of OpenD6 Space specific settings groups (e.g., active attributes, automation, character points, custom fields, attribute sorting).
  Expected: Dedicated OpenD6 Space settings categories render; each opens without error.

- O6S.SYS.003 Grid and units
  Steps:
  1. Open the “Blank” scene configuration.
  2. Confirm grid units are “m” and distance 1.
  Expected: Defaults match src/system.json grid settings (1 m). Changing and saving persists.

Suite O6S.LOC – Localization
- O6S.LOC.001 Language switching
  Preconditions: World created; languages available: en, fr, es, ru.
  Steps:
  1. Game Settings > Configure Settings > Language Preference. Switch to each available language in turn.
  2. Reopen common UIs (Actor sheet, Item sheet, System Settings) after each switch.
  Expected: UI strings localize appropriately; no visible missing keys; sheet labels translate where supported.

Suite O6S.CMP – Compendia
- O6S.CMP.001 All compendia load
  Steps:
  1. Open Compendium tab.
  2. Verify the following packs exist and open: weapons, armor, natural, advantages, disadvantages, skills, metaphysics-skills, special-abilities, gear, cybernetics, vehicle-weapons, vehicle-gear, starship-weapons, starship-gear, vehicles (Actor), starships (Actor), character-templates, macros.
  Expected: Each pack is present, opens without error, and lists entries. Drag‑and‑drop to sidebar creates entities as appropriate.

Suite O6S.ACT – Actors & Actor Sheets
- O6S.ACT.001 Create Character actor
  Steps:
  1. Actors sidebar > Create Actor > Type: Character (or default character type used by the system).
  2. Open sheet.
  Expected: Character sheet renders; attributes/skills sections visible; no console errors.

- O6S.ACT.002 Create Vehicle actor
  Steps:
  1. Create Actor > Type: Vehicle.
  2. Open sheet.
  Expected: Vehicle sheet renders; vehicle stats present.

- O6S.ACT.003 Create Starship actor
  Steps:
  1. Create Actor > Type: Starship.
  2. Open sheet.
  Expected: Starship sheet renders; starship stats present; crew/embed UI present if applicable.

- O6S.ACT.004 Attribute edit
  Steps:
  1. On Character sheet, edit an attribute value via inline controls.
  2. Save/blur.
  Expected: Value persists; reopens with saved data; related dice/pips update where applicable.

- O6S.ACT.005 Character creation helper (if present)
  Steps:
  1. Launch any character creation app/dialog provided by the system (e.g., module/apps/character-creation.js).
  Expected: Dialog opens; selections update actor as expected; cancel/confirm behaviors work.

Suite O6S.ITM – Items & Item Sheets
- O6S.ITM.001 Create core item types
  Steps:
  1. Items sidebar > Create for each type: Weapon, Armor, Gear, Skill, Advantage, Disadvantage, Natural Combat Item, Cybernetic, Special Ability, Vehicle Gear, Vehicle Weapon, Starship Gear, Starship Weapon, Character Template.
  2. Open each sheet.
  Expected: Each item sheet renders with tabs (including Attributes tab where applicable) and no errors.

- O6S.ITM.002 Weapon stun fields
  Steps:
  1. Open a Weapon item sheet.
  2. Navigate to Attributes tab; set Stun Dice and Pips to non‑zero values; save.
  Expected: Values persist; future roll dialogs expose Stun option per README behavior.

- O6S.ITM.003 Drag items onto Actor
  Steps:
  1. Drag a Weapon, Armor, and Gear item from Items sidebar onto Character.
  2. Open Character inventory lists.
  Expected: Items appear in correct sections; quantities and equipped flags editable.

Suite O6S.ROL – Rolling & Chat
- O6S.ROL.001 Skill roll from sheet
  Steps:
  1. On Character, click a Skill roll control.
  2. If a roll dialog appears, accept defaults and roll.
  Expected: Chat message appears showing dice/d6/wild die as per system; total computed; no errors.

- O6S.ROL.002 Attribute roll from sheet
  Steps:
  1. Roll a core attribute.
  Expected: Chat card renders with expected values.

- O6S.ROL.003 Weapon attack roll
  Preconditions: Character has a Weapon item with attack defined.
  Steps:
  1. Use the Weapon attack control from the Actor inventory.
  Expected: Attack roll produced in chat; damage button or follow‑up available per system behavior.

- O6S.ROL.004 Damage roll including Stun option
  Preconditions: Weapon item with Stun fields set (O6S.ITM.002).
  Steps:
  1. Trigger the damage roll for that weapon.
  2. In the roll dialog, ensure Stun checkbox appears; toggle it ON and roll.
  Expected: Chat reflects “Stun” calculation path; damage uses stun dice/pips accordingly.

- O6S.ROL.005 Rerolls/exploding die/wild die
  Steps:
  1. Perform multiple rolls to trigger wild die/explosions if supported.
  Expected: Exploding mechanics behave per OpenD6 rules; chat shows component dice and totals.

- O6S.ROL.006 Chat sound (if configured)
  Steps:
  1. Perform a roll that would emit sound.
  Expected: Audio plays without error (see overrides/chat-log.js references).

Suite O6S.AUTO – Automation & Special Dialogs
- O6S.AUTO.001 Explosives template placement
  Steps:
  1. Open the explosives template tool/dialog (apps/explosives-template.js or explosive-dialog.js entry point via UI button or macro if provided).
  2. Place an explosive template on the Scene.
  Expected: Template appears; any derived dialogs compute area/effects as expected; cancel removes template.

- O6S.AUTO.002 Add embedded crew (vehicles/starships)
  Preconditions: Vehicle or Starship actor exists.
  Steps:
  1. Use the “add embedded crew” function if present (actor/add-embedded-crew.js flow via sheet action).
  Expected: Crew item/actor links embedded/created; sheet updates.

- O6S.AUTO.003 Config: active attributes
  Steps:
  1. Open System Settings > Active Attributes configuration (apps/config-active-attributes.js).
  2. Toggle an attribute on/off; save.
  3. Reopen a Character sheet.
  Expected: Attribute visibility matches configuration.

- O6S.AUTO.004 Config: attribute sorting
  Steps:
  1. Open attribute sorting config (apps/config-attributes-sorting.js).
  2. Change order; save.
  Expected: Sheet reflects new order.

- O6S.AUTO.005 Config: automation
  Steps:
  1. Open automation config (apps/config-automation.js) and toggle an option.
  2. Perform a roll influenced by that option.
  Expected: Roll/chat reflects automation setting.

- O6S.AUTO.006 Config: character points
  Steps:
  1. Open character points config (apps/config-characterpoints.js) and adjust values/availability.
  2. Inspect Character sheet for updates.
  Expected: Character points UI/state updates as configured.

- O6S.AUTO.007 Config: custom fields
  Steps:
  1. Open custom fields config (apps/config-custom-fields.js) and add a new field.
  2. Open a Character or Item sheet to view custom field.
  Expected: Custom field renders; value persists on edit.

Suite O6S.TOK – Tokens & Scene Interactions
- O6S.TOK.001 Token creation and overlay
  Steps:
  1. Drag Character to the Scene to create a Token.
  2. Apply conditions/effects that would set an overlay (see overrides/token.js references for overlays/effects).
  Expected: Token renders; overlay effect/tint updates as expected.

- O6S.TOK.002 Targeting and roll with target
  Steps:
  1. Place two tokens (attacker and target). Target the defender.
  2. Perform a weapon attack roll from attacker.
  Expected: If the system uses target data, chat reflects target; any automation referencing target applies.

Suite O6S.PER – Permissions & Ownership
- O6S.PER.001 Player vs GM sheet access
  Steps:
  1. As GM, set PL1 as owner of Character; remove ownership of another actor.
  2. As PL1, open owned and unowned actor sheets.
  Expected: Owned opens editable; unowned read‑only or blocked per permissions.

- O6S.PER.002 Item visibility and edit restrictions
  Steps:
  1. As PL1, attempt to edit items not owned.
  Expected: Edits restricted appropriately.

Suite O6S.MAC – Macros
- O6S.MAC.001 Macros compendium import
  Steps:
  1. Open the “Macros” compendium; drag a macro into Macro Directory.
  2. Execute the macro (if it’s a system sample).
  Expected: Macro runs without error; expected chat output or UI action occurs.

Suite O6S.SOC – Socket & Multiplayer
- O6S.SOC.001 Socketlib availability
  Steps:
  1. Ensure socketlib is enabled.
  2. Open console and verify that socket endpoints/register calls from the system do not error on load.
  Expected: No socketlib errors on startup; any socket‑based features (e.g., GM‑side rolls) operate.

- O6S.SOC.002 Player triggers GM‑only effects (if applicable)
  Steps:
  1. As PL1, trigger an action that should be executed via socket on GM side.
  2. Observe GM client behavior.
  Expected: Action succeeds via socket without permission errors.

Suite O6S.PKS – Packs & Data Integrity
- O6S.PKS.001 Drag from pack to world
  Steps:
  1. Drag a Skill, Weapon, and Armor from their packs into the World directories.
  Expected: Entities created with correct system data schema; sheets open; no migration prompts/errors.

- O6S.PKS.002 Actor packs (vehicles/starships)
  Steps:
  1. Drag a Vehicle and a Starship from their packs into Actors.
  Expected: Actors create; specialized fields populate; no errors when opening.

Suite O6S.MIG – Data Schema & Migrations
- O6S.MIG.001 Version metadata
  Steps:
  1. Compare system.json version with displayed system version in Setup and in World.
  Expected: Versions match; no unexpected migration notices on first load.

Suite O6S.UIX – General UI/UX
- O6S.UIX.001 Sheet tab navigation
  Steps:
  1. On Item and Actor sheets, switch through tabs including Attributes, Inventory, etc.
  Expected: Tab content switches without console errors or rendering glitches.

- O6S.UIX.002 Drag‑and‑drop between lists
  Steps:
  1. Reorder items in Actor inventory if supported; drag to delete/drop zones if provided.
  Expected: Orders update; removals confirm when expected.

Regression Checklist (Quick Pass)
- Load world with no console errors.
- Open Character, Vehicle, Starship sheets successfully.
- Create and edit a Weapon; verify Stun fields and damage roll dialog checkbox.
- Perform a Skill roll and a Weapon attack+damage roll; verify chat output.
- Open and adjust at least one system setting; observe sheet impact.
- Open multiple compendia packs and drag content into the world.
- Place a token and confirm basic interaction and overlays.
- Switch language to FR and back to EN without broken labels.

Notes for Quench Automation
- Use the Suite/Test IDs verbatim when implementing with Quench.
- Prefer locating elements by data‑action/data‑tab attributes on sheets and dialogs when available.
- Where dialogs exist (e.g., roll dialogs, explosives, configs), mock user input by setting form fields then submitting.
- Map expected chat messages by checking for specific CSS classes or localized keys rather than raw English strings when possible.
- Socket‑based behaviors may require multi‑client test harness in Quench; gate these tests behind an environment flag when running headless.

Appendix – Files Referenced for Coverage
- src/system.json: id, packs, languages, grid, socket, compatibility.
- src/module/od6s.js: system init, sheets, hooks, rolls, registrations.
- src/module/item/item-sheet.js: item sheet logic (attributes, stun fields).
- src/module/apps/*: configuration UIs and special dialogs (active attributes, attribute sorting, automation, character points, custom fields, explosives tools, chat helpers, character creation).
- src/module/overrides/* (if present): token and chat overrides.

If any test step fails, capture console logs, offending entity data (via export), and a screenshot of the UI. File an issue with the failing Test ID and reproduction steps.
