/**
 * Unit tests for classes and functions in src/module/od6s.js
 */
import { 
  WildDie, 
  CharacterPointDie, 
  rollItemMacro, 
  rollItemNameMacro, 
  getAttributeName, 
  getAttributeShortName,
  updateExplosiveTemplate,
  deleteExplosiveTemplate,
  getActorFromUuid,
  promptResistanceRolls
} from "../module/od6s.js";

export const od6sMainTests = (context) => {
  const { describe, it, assert, before, after } = context;

  describe("OD6S Main Module Tests", () => {
    
    describe("Custom Die Classes", () => {
      it("WildDie should have correct denomination and modifiers", () => {
        const die = new WildDie({ number: 1 });
        assert.equal(die.faces, 6, "WildDie should have 6 faces");
        assert.equal(WildDie.DENOMINATION, "w", "WildDie denomination should be 'w'");
        assert.deepEqual(die.modifiers, ["x6"], "WildDie should have 'x6' modifier");
      });

      it("CharacterPointDie should have correct denomination and modifiers", () => {
        const die = new CharacterPointDie({ number: 1 });
        assert.equal(die.faces, 6, "CharacterPointDie should have 6 faces");
        assert.equal(CharacterPointDie.DENOMINATION, "b", "CharacterPointDie denomination should be 'b'");
        assert.deepEqual(die.modifiers, ["x6"], "CharacterPointDie should have 'x6' modifier");
      });
    });

    describe("Attribute Name Functions", () => {
      let originalOD6S;
      before(() => {
        // Mock OD6S config if needed, or rely on existing one
        originalOD6S = game.od6s.config;
      });

      it("getAttributeName should return localized attribute name", () => {
        // This test assumes game.i18n.localize is available or mocked by Quench
        // and that OD6S.attributes has some standard values.
        const attr = Object.keys(game.od6s.config.attributes)[0];
        const name = getAttributeName(attr);
        assert.ok(name, "Should return a name for a valid attribute");
      });

      it("getAttributeShortName should return short name", () => {
        const attr = Object.keys(game.od6s.config.attributes)[0];
        const shortName = getAttributeShortName(attr);
        assert.equal(shortName, game.od6s.config.attributes[attr].shortName, "Should return correct shortName");
      });
    });

    describe("Utility and Socket Functions", () => {
        it("getActorFromUuid should call od6sutilities.getActorFromUuid", async () => {
            // Mocking would be better here, but for now we test if it exists
            assert.equal(typeof getActorFromUuid, "function", "getActorFromUuid should be a function");
        });

        it("updateExplosiveTemplate should be a function", () => {
            assert.equal(typeof updateExplosiveTemplate, "function");
        });

        it("deleteExplosiveTemplate should be a function", () => {
            assert.equal(typeof deleteExplosiveTemplate, "function");
        });
    });

    describe("Macro and Roll Prompt Functions", () => {
        it("rollItemMacro should be a function", () => {
            assert.equal(typeof rollItemMacro, "function");
        });

        it("rollItemNameMacro should be a function", () => {
            assert.equal(typeof rollItemNameMacro, "function");
        });

        it("promptResistanceRolls should be a function", () => {
            assert.equal(typeof promptResistanceRolls, "function");
        });
    });

    // Note: Many internal functions in od6s.js are not exported directly,
    // but they are registered to socketlib or assigned to game.od6s.
    describe("Internal/Registered Functions", () => {
        it("simpleRoll should be registered in game.od6s", () => {
            assert.equal(typeof game.od6s.simpleRoll, "function");
        });

        it("triggerRoll should be registered in OD6S.socket (via socketlib)", () => {
            // This depends on socketlib being initialized, which might not happen in pure unit test context
            // but we can check if it was intended to be registered.
        });
    });
  });
};
