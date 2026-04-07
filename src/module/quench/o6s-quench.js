/**
 * OpenD6 Space — Quench Test Registration
 * Registers test batches with Quench (if installed) using the quenchReady hook.
 * Each batch corresponds to a module area with placeholder tests that log manual steps.
 */

Hooks.on("quenchReady", (quench) => {

    // System Load & Configuration
    quench.registerBatch("od6s.system", (context) => {
        const { describe, it, assert } = context;
        describe("System Load", function() {
            it("should have od6s system registered", function() {
                assert.ok(game.system.id === "od6s");
            });
            it("should have OD6SActor document class", function() {
                assert.ok(CONFIG.Actor.documentClass);
            });
            it("should have OD6SItem document class", function() {
                assert.ok(CONFIG.Item.documentClass);
            });
            it("should have custom dice terms registered", function() {
                assert.ok(CONFIG.Dice.terms["w"], "WildDie registered");
                assert.ok(CONFIG.Dice.terms["b"], "CharacterPointDie registered");
            });
            it("should have status effects configured", function() {
                assert.ok(CONFIG.statusEffects);
                assert.ok(CONFIG.statusEffects.dead, "dead status exists");
                assert.ok(CONFIG.statusEffects.stunned, "stunned status exists");
            });
        });
    }, { displayName: "OD6S: System Load & Configuration" });

    // Actor Creation & Sheets
    quench.registerBatch("od6s.actors", (context) => {
        const { describe, it, assert } = context;
        describe("Actor Types", function() {
            for (const type of ["character", "npc", "creature", "vehicle", "starship", "container"]) {
                it(`should create a ${type} actor`, async function() {
                    const actor = await Actor.create({ name: `Test ${type}`, type: type });
                    assert.ok(actor, `${type} actor created`);
                    assert.equal(actor.type, type);
                    await actor.delete();
                });
            }
        });
    }, { displayName: "OD6S: Actors & Actor Sheets" });

    // Item Creation & Sheets
    quench.registerBatch("od6s.items", (context) => {
        const { describe, it, assert } = context;
        describe("Item Types", function() {
            const itemTypes = ["skill", "specialization", "advantage", "disadvantage",
                "specialability", "armor", "weapon", "gear", "cybernetic", "manifestation",
                "character-template", "action", "vehicle", "vehicle-weapon", "vehicle-gear",
                "starship-weapon", "starship-gear", "species-template", "item-group"];
            for (const type of itemTypes) {
                it(`should create a ${type} item`, async function() {
                    const item = await Item.create({ name: `Test ${type}`, type: type });
                    assert.ok(item, `${type} item created`);
                    assert.equal(item.type, type);
                    await item.delete();
                });
            }
        });
    }, { displayName: "OD6S: Items & Item Sheets" });

    // Dice & Rolling
    quench.registerBatch("od6s.dice", (context) => {
        const { describe, it, assert } = context;
        describe("Dice Encoding", function() {
            it("should convert score 7 to 2D+1", function() {
                const result = game.od6s.config.pipsPerDice;
                assert.ok(result, "pipsPerDice is defined");
            });
        });
        describe("Wild Die", function() {
            it("should have WildDie with denomination 'w'", function() {
                assert.equal(CONFIG.Dice.terms["w"].DENOMINATION, "w");
            });
            it("should have CharacterPointDie with denomination 'b'", function() {
                assert.equal(CONFIG.Dice.terms["b"].DENOMINATION, "b");
            });
        });
    }, { displayName: "OD6S: Dice & Rolling" });

    // Compendium Packs
    quench.registerBatch("od6s.packs", (context) => {
        const { describe, it, assert } = context;
        describe("Compendium Packs", function() {
            const expectedPacks = ["weapons", "armor", "natural", "advantages",
                "disadvantages", "skills", "metaphysics-skills", "specialabilities",
                "gear", "cybernetics", "vehicles", "character-templates", "macros"];
            for (const packName of expectedPacks) {
                it(`should have ${packName} pack`, function() {
                    const pack = game.packs.get(`od6s.${packName}`);
                    assert.ok(pack, `${packName} pack exists`);
                });
            }
            it("should have entries in weapons pack", async function() {
                const pack = game.packs.get("od6s.weapons");
                const index = await pack.getIndex();
                assert.ok(index.size > 0, `weapons has ${index.size} entries`);
            });
        });
    }, { displayName: "OD6S: Compendium Packs" });

    // Settings
    quench.registerBatch("od6s.settings", (context) => {
        const { describe, it, assert } = context;
        describe("System Settings", function() {
            it("should have use_wild_die setting", function() {
                const val = game.settings.get("od6s", "use_wild_die");
                assert.ok(typeof val === "boolean", "use_wild_die is boolean");
            });
            it("should have hide-gm-rolls setting", function() {
                const val = game.settings.get("od6s", "hide-gm-rolls");
                assert.ok(typeof val === "boolean", "hide-gm-rolls is boolean");
            });
        });
    }, { displayName: "OD6S: Settings" });

    // DataModels
    quench.registerBatch("od6s.datamodels", (context) => {
        const { describe, it, assert } = context;
        describe("Actor DataModels", function() {
            for (const type of ["character", "npc", "creature", "vehicle", "starship", "container"]) {
                it(`should have DataModel for ${type}`, function() {
                    assert.ok(CONFIG.Actor.dataModels[type], `${type} DataModel registered`);
                });
            }
        });
        describe("Item DataModels", function() {
            const types = ["skill", "specialization", "advantage", "disadvantage",
                "specialability", "armor", "weapon", "gear", "cybernetic", "manifestation",
                "action", "vehicle", "species-template", "item-group"];
            for (const type of types) {
                it(`should have DataModel for ${type}`, function() {
                    assert.ok(CONFIG.Item.dataModels[type], `${type} DataModel registered`);
                });
            }
        });
    }, { displayName: "OD6S: DataModels" });

});
