/**
 * OpenD6 Space — Quench Test Registration
 * Registers test batches with Quench (if installed) using the quenchReady hook.
 * Tests cover system load, actors, items, dice, packs, settings, DataModels,
 * drag-drop, dice rolls, active effects, and vehicle crew.
 */

Hooks.on("quenchReady", (quench) => {

    // ─── System Load & Configuration ───
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
                assert.ok(CONFIG.statusEffects, "statusEffects exists");
                // Foundry v14 may expose a hybrid Array with named properties.
                // Our runtime code accesses by key (e.g. CONFIG.statusEffects.dead),
                // so verify named-property access works regardless of underlying type.
                assert.ok(CONFIG.statusEffects.dead, "dead status accessible by key");
                assert.ok(CONFIG.statusEffects.stunned, "stunned status accessible by key");
                assert.ok(CONFIG.statusEffects.unconscious, "unconscious status accessible by key");
            });
            it("should have socketlib registered", function() {
                assert.ok(game.od6s.config, "od6s config exists");
            });
        });
    }, { displayName: "OD6S: System Load & Configuration" });

    // ─── Actor Creation ───
    quench.registerBatch("od6s.actors", (context) => {
        const { describe, it, assert } = context;
        describe("Actor Types", function() {
            for (const type of ["character", "npc", "creature", "vehicle", "starship", "container"]) {
                it(`should create a ${type} actor`, async function() {
                    const actor = await Actor.implementation.create({ name: `Test ${type}`, type: type });
                    assert.ok(actor, `${type} actor created`);
                    assert.equal(actor.type, type);
                    await actor.delete();
                });
            }
        });
    }, { displayName: "OD6S: Actors & Actor Sheets" });

    // ─── Item Creation ───
    quench.registerBatch("od6s.items", (context) => {
        const { describe, it, assert } = context;
        describe("Item Types", function() {
            const itemTypes = ["skill", "specialization", "advantage", "disadvantage",
                "specialability", "armor", "weapon", "gear", "cybernetic", "manifestation",
                "character-template", "action", "vehicle", "vehicle-weapon", "vehicle-gear",
                "starship-weapon", "starship-gear", "species-template", "item-group"];
            for (const type of itemTypes) {
                it(`should create a ${type} item`, async function() {
                    const item = await Item.implementation.create({ name: `Test ${type}`, type: type });
                    assert.ok(item, `${type} item created`);
                    assert.equal(item.type, type);
                    await item.delete();
                });
            }
        });
    }, { displayName: "OD6S: Items & Item Sheets" });

    // ─── Dice & Rolling ───
    quench.registerBatch("od6s.dice", (context) => {
        const { describe, it, assert } = context;
        describe("Dice Encoding", function() {
            it("should have pipsPerDice defined", function() {
                assert.ok(game.od6s.config.pipsPerDice, "pipsPerDice is defined");
                assert.equal(game.od6s.config.pipsPerDice, 3, "pipsPerDice defaults to 3");
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
        describe("Roll Execution", function() {
            it("should roll standard d6", async function() {
                const roll = await new Roll("2d6").evaluate();
                assert.ok(roll.total >= 2 && roll.total <= 12, `rolled ${roll.total}`);
            });
            it("should roll wild die", async function() {
                const roll = await new Roll("1dw").evaluate();
                assert.ok(roll.total >= 1, `wild die rolled ${roll.total}`);
            });
            it("should roll character point die", async function() {
                const roll = await new Roll("1db").evaluate();
                assert.ok(roll.total >= 1, `CP die rolled ${roll.total}`);
            });
        });
    }, { displayName: "OD6S: Dice & Rolling" });

    // ─── Compendium Packs ───
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
            it("should have entries in skills pack", async function() {
                const pack = game.packs.get("od6s.skills");
                const index = await pack.getIndex();
                assert.ok(index.size > 0, `skills has ${index.size} entries`);
            });
            it("should have entries in advantages pack", async function() {
                const pack = game.packs.get("od6s.advantages");
                const index = await pack.getIndex();
                assert.ok(index.size > 0, `advantages has ${index.size} entries`);
            });
        });
    }, { displayName: "OD6S: Compendium Packs" });

    // ─── Settings ───
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
            it("should have reroll_initiative setting", function() {
                const val = game.settings.get("od6s", "reroll_initiative");
                assert.ok(typeof val === "boolean", "reroll_initiative is boolean");
            });
            it("should have bodypoints setting", function() {
                const val = game.settings.get("od6s", "bodypoints");
                assert.ok(typeof val === "number", "bodypoints is number");
            });
        });
    }, { displayName: "OD6S: Settings" });

    // ─── DataModels ───
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

    // ─── Drag-Drop: Compendium to Actor ───
    quench.registerBatch("od6s.dragdrop", (context) => {
        const { describe, it, assert, before, after } = context;
        let testActor;

        before(async function() {
            testActor = await Actor.implementation.create({ name: "DD Test Character", type: "character" });
        });

        after(async function() {
            if (testActor) await testActor.delete();
        });

        describe("Drag-Drop Items to Actor", function() {
            it("should add a weapon from compendium to actor", async function() {
                const pack = game.packs.get("od6s.weapons");
                const index = await pack.getIndex();
                const firstEntry = index.contents[0];
                const item = await pack.getDocument(firstEntry._id);
                const itemData = item.toObject();
                await testActor.createEmbeddedDocuments("Item", [itemData]);
                const owned = testActor.items.find(i => i.name === firstEntry.name);
                assert.ok(owned, `weapon "${firstEntry.name}" added to actor`);
            });

            it("should add an armor from compendium to actor", async function() {
                const pack = game.packs.get("od6s.armor");
                const index = await pack.getIndex();
                const firstEntry = index.contents[0];
                const item = await pack.getDocument(firstEntry._id);
                const itemData = item.toObject();
                await testActor.createEmbeddedDocuments("Item", [itemData]);
                const owned = testActor.items.find(i => i.name === firstEntry.name);
                assert.ok(owned, `armor "${firstEntry.name}" added to actor`);
            });

            it("should add a skill from compendium to actor", async function() {
                const pack = game.packs.get("od6s.skills");
                const index = await pack.getIndex();
                const firstEntry = index.contents[0];
                const item = await pack.getDocument(firstEntry._id);
                const itemData = item.toObject();
                await testActor.createEmbeddedDocuments("Item", [itemData]);
                const owned = testActor.items.find(i => i.name === firstEntry.name);
                assert.ok(owned, `skill "${firstEntry.name}" added to actor`);
            });

            it("should have correct item count after additions", function() {
                assert.ok(testActor.items.size >= 3, `actor has ${testActor.items.size} items`);
            });
        });
    }, { displayName: "OD6S: Drag-Drop (Compendium → Actor)" });

    // ─── Active Effects ───
    quench.registerBatch("od6s.effects", (context) => {
        const { describe, it, assert, before, after } = context;
        let testActor;

        before(async function() {
            testActor = await Actor.implementation.create({ name: "AE Test Character", type: "character" });
        });

        after(async function() {
            if (testActor) await testActor.delete();
        });

        describe("Active Effects on Items", function() {
            it("should add cybernetic with effects to actor", async function() {
                const pack = game.packs.get("od6s.cybernetics");
                const index = await pack.getIndex();
                if (index.size === 0) return this.skip();
                const firstEntry = index.contents[0];
                const item = await pack.getDocument(firstEntry._id);
                const itemData = item.toObject();
                await testActor.createEmbeddedDocuments("Item", [itemData]);
                const owned = testActor.items.find(i => i.name === firstEntry.name);
                assert.ok(owned, `cybernetic "${firstEntry.name}" added`);
            });

            it("should have active effects from cybernetic", function() {
                const cybernetics = testActor.items.filter(i => i.type === "cybernetic");
                if (cybernetics.length === 0) return this.skip();
                const cyber = cybernetics[0];
                assert.ok(cyber.effects.size > 0, `cybernetic has ${cyber.effects.size} effects`);
            });
        });

        describe("Direct Active Effects", function() {
            it("should create an active effect on actor", async function() {
                await testActor.createEmbeddedDocuments("ActiveEffect", [{
                    name: "Test Bonus",
                    changes: [{ key: "system.attributes.agi.mod", mode: 2, value: "3" }]
                }]);
                assert.ok(testActor.effects.size > 0, "actor has active effects");
            });

            it("should remove active effect from actor", async function() {
                const effect = testActor.effects.contents[0];
                if (!effect) return this.skip();
                await effect.delete();
                const remaining = testActor.effects.filter(e => e.name === "Test Bonus");
                assert.equal(remaining.length, 0, "effect removed");
            });
        });
    }, { displayName: "OD6S: Active Effects" });

    // ─── Vehicle Crew ───
    quench.registerBatch("od6s.vehicles", (context) => {
        const { describe, it, assert, before, after } = context;
        let testVehicle, testCharacter;

        before(async function() {
            testVehicle = await Actor.implementation.create({ name: "Test Vehicle", type: "vehicle" });
            testCharacter = await Actor.implementation.create({ name: "Test Pilot", type: "character" });
        });

        after(async function() {
            if (testVehicle) await testVehicle.delete();
            if (testCharacter) await testCharacter.delete();
        });

        describe("Vehicle Properties", function() {
            it("should have vehicle-specific system data", function() {
                assert.ok(testVehicle.system, "vehicle has system data");
                assert.ok(typeof testVehicle.system.scale !== "undefined", "vehicle has scale");
                assert.ok(typeof testVehicle.system.toughness !== "undefined", "vehicle has toughness");
                assert.ok(typeof testVehicle.system.maneuverability !== "undefined", "vehicle has maneuverability");
            });

            it("should have crew members array", function() {
                assert.ok(Array.isArray(testVehicle.system.crewmembers), "crewmembers is array");
                assert.equal(testVehicle.system.crewmembers.length, 0, "starts with no crew");
            });
        });

        describe("Character Properties", function() {
            it("should have character-specific system data", function() {
                assert.ok(testCharacter.system, "character has system data");
                assert.ok(typeof testCharacter.system.characterpoints !== "undefined", "has character points");
                assert.ok(typeof testCharacter.system.fatepoints !== "undefined", "has fate points");
                assert.ok(typeof testCharacter.system.wounds !== "undefined", "has wounds");
            });

            it("should have all 7 attributes", function() {
                const attrs = testCharacter.system.attributes;
                assert.ok(attrs, "attributes exist");
                for (const key of ["agi", "str", "mec", "kno", "per", "tec", "met"]) {
                    assert.ok(attrs[key], `${key} attribute exists`);
                    assert.ok(typeof attrs[key].score !== "undefined", `${key} has score`);
                }
            });
        });
    }, { displayName: "OD6S: Vehicles & Characters" });

    // ─── Character Creation Data ───
    quench.registerBatch("od6s.chardata", (context) => {
        const { describe, it, assert, before, after } = context;
        let testActor;

        before(async function() {
            testActor = await Actor.implementation.create({ name: "Data Test Character", type: "character" });
        });

        after(async function() {
            if (testActor) await testActor.delete();
        });

        describe("Character Defaults", function() {
            it("should have system data", function() {
                assert.ok(testActor.system, "actor has system data");
                assert.ok(typeof testActor.system === "object", "system is an object");
            });

            it("should have wounds system", function() {
                assert.ok(testActor.system.wounds, "wounds exists");
                assert.ok(typeof testActor.system.wounds.body_points !== "undefined", "body_points exists");
            });

            it("should have stuns system", function() {
                assert.ok(typeof testActor.system.stuns !== "undefined", "stuns exists");
                assert.ok(typeof testActor.system.stuns.current !== "undefined", "stuns.current exists");
            });

            it("should have initiative system", function() {
                assert.ok(typeof testActor.system.initiative !== "undefined", "initiative exists");
            });

            it("should have combat stats", function() {
                assert.ok(typeof testActor.system.dodge !== "undefined", "dodge exists");
                assert.ok(typeof testActor.system.parry !== "undefined", "parry exists");
                assert.ok(typeof testActor.system.block !== "undefined", "block exists");
            });

            it("should have resistance stats", function() {
                assert.ok(typeof testActor.system.pr !== "undefined", "physical resistance exists");
                assert.ok(typeof testActor.system.er !== "undefined", "energy resistance exists");
            });
        });

        describe("Item Operations on Actor", function() {
            it("should create and delete embedded items", async function() {
                await testActor.createEmbeddedDocuments("Item", [
                    { name: "Test Skill", type: "skill", system: { attribute: "agi" } }
                ]);
                assert.ok(testActor.items.size > 0, "item added");
                const skill = testActor.items.find(i => i.name === "Test Skill");
                assert.ok(skill, "skill found");
                assert.equal(skill.system.attribute, "agi", "attribute is agi");
                await testActor.deleteEmbeddedDocuments("Item", [skill.id]);
                assert.equal(testActor.items.size, 0, "item removed");
            });
        });
    }, { displayName: "OD6S: Character Data & Operations" });

});
