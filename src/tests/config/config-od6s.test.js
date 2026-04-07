/**
 * Unit tests for src/module/config/config-od6s.js
 */
import OD6S from "../../module/config/config-od6s.js";

export const od6sConfigTests = (context) => {
  const { describe, it, assert } = context;

  describe("OD6S Configuration Object Tests", () => {
    
    it("OD6S should be a valid object", () => {
      assert.equal(typeof OD6S, "object", "OD6S configuration should be an object");
    });

    describe("Core Values", () => {
      it("OD6S should have core numeric and boolean values", () => {
        assert.equal(typeof OD6S.baseHitDifficulty, "number");
        assert.equal(typeof OD6S.stunDice, "boolean");
        assert.equal(typeof OD6S.pipsPerDice, "number");
        assert.equal(OD6S.pipsPerDice, 3, "pipsPerDice should default to 3");
      });

      it("OD6S should have default localization keys", () => {
        assert.equal(OD6S.bodyPointsName, "OD6S.BODY_POINTS");
        assert.equal(OD6S.currencyName, "OD6S.CHAR_CREDITS");
      });
    });

    describe("Complex Data Structures", () => {
      it("OD6S should have valid weapon damage levels", () => {
        assert.ok(OD6S.weaponDamage[0], "weaponDamage level 0 should exist");
        assert.equal(OD6S.weaponDamage[0].label, "OD6S.NO_DAMAGE");
        assert.equal(OD6S.weaponDamage[1].penalty, 3);
      });

      it("OD6S should have valid deadliness configuration", () => {
        assert.ok(OD6S.deadliness[1], "Deadliness level 1 should exist");
        assert.ok(OD6S.deadliness[1][0], "Deadliness level 1, wound 0 (Healthy) should exist");
        assert.equal(OD6S.deadliness[1][0].core, "OD6S.WOUNDS_HEALTHY");
      });

      it("OD6S should have valid vehicle damage and speeds", () => {
        assert.ok(OD6S.vehicle_damage["OD6S.DAMAGE_LIGHT"], "Vehicle damage 'light' should exist");
        assert.ok(OD6S.vehicle_speeds["cruise"], "Vehicle speed 'cruise' should exist");
      });

      it("OD6S should have defined weapon and item types", () => {
        assert.ok(OD6S.weaponTypes.includes("OD6S.RANGED"), "weaponTypes should include RANGED");
        assert.ok(OD6S.equippable.includes("weapon"), "equippable should include weapon");
      });
    });

    describe("Actions and Difficulties", () => {
      it("OD6S should have character actions defined", () => {
        assert.ok(OD6S.actions.ranged_attack, "ranged_attack action should exist");
        assert.equal(OD6S.actions.ranged_attack.base, "agi", "ranged_attack base attribute should be 'agi'");
      });

      it("OD6S should have difficulty levels defined", () => {
        assert.ok(OD6S.difficulty["OD6S.DIFFICULTY_MODERATE"], "Moderate difficulty should exist");
        assert.equal(OD6S.difficulty["OD6S.DIFFICULTY_MODERATE"].min, 11, "Moderate difficulty min should be 11");
        assert.equal(OD6S.difficulty["OD6S.DIFFICULTY_MODERATE"].max, 15, "Moderate difficulty max should be 15");
      });
    });

    describe("Attributes", () => {
      it("OD6S should have the standard 6 attributes plus extras", () => {
        const standardAttrs = ["agi", "str", "mec", "kno", "per", "tec"];
        standardAttrs.forEach(attr => {
          assert.ok(OD6S.attributes[attr], `Attribute ${attr} should exist`);
        });
        assert.ok(OD6S.attributes.met, "Metaphysics attribute should exist");
      });
    });

    describe("Initial Values", () => {
      it("OD6S should have core initial values", () => {
        assert.equal(OD6S.initialAttributes, 54);
        assert.equal(OD6S.initialSkills, 21);
        assert.equal(OD6S.initialMove, 10);
      });
    });

  });
};
