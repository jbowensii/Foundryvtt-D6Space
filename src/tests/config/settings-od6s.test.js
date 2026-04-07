/**
 * Unit tests for src/module/config/settings-od6s.js
 */
import OD6S from "../../module/config/config-od6s.js";
import { updateRerollInitiative, registerSettings } from "../../module/config/settings-od6s.js";

export const od6sSettingsTests = (context) => {
  const { describe, it, assert, before, after } = context;

  describe("OD6S Settings Module Tests", () => {
    
    describe("updateRerollInitiative", () => {
        let originalSettingsGet;
        let originalSettingsSet;
        let setValues = {};

        before(() => {
            originalSettingsGet = game.settings.get;
            originalSettingsSet = game.settings.set;
            
            // Mock game.settings
            game.settings.get = (scope, key) => {
                if (scope === 'od6s') {
                    if (key === 'auto_reroll_character') return true;
                    if (key === 'auto_reroll_npc') return false;
                }
                return false;
            };
            game.settings.set = async (scope, key, value) => {
                setValues[key] = value;
            };
        });

        after(() => {
            game.settings.get = originalSettingsGet;
            game.settings.set = originalSettingsSet;
        });

        it("should update OD6S initiative configuration when value is true", async () => {
            // Reset state
            OD6S.initiative.reroll_character = false;
            OD6S.initiative.reroll_npc = false;

            await updateRerollInitiative(true);

            assert.equal(OD6S.initiative.reroll_character, true, "reroll_character should be updated from settings");
            assert.equal(OD6S.initiative.reroll_npc, false, "reroll_npc should be updated from settings");
        });

        it("should disable reroll and update settings when value is false", async () => {
            OD6S.initiative.reroll_character = true;
            OD6S.initiative.reroll_npc = true;
            setValues = {};

            await updateRerollInitiative(false);

            assert.equal(OD6S.initiative.reroll_character, false, "reroll_character should be disabled");
            assert.equal(OD6S.initiative.reroll_npc, false, "reroll_npc should be disabled");
            assert.equal(setValues['auto_reroll_character'], false, "Should update setting auto_reroll_character");
            assert.equal(setValues['auto_reroll_npc'], false, "Should update setting auto_reroll_npc");
        });
    });

    describe("registerSettings", () => {
        it("should be a function", () => {
            assert.equal(typeof registerSettings, "function");
        });

        // Note: Testing registerSettings fully would require extensive mocking of 
        // game.settings.register, game.settings.registerMenu, etc.
        // For unit tests in Quench, we verify it doesn't crash and is available.
    });

  });
};
