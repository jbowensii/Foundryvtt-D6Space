import OD6S from "../../module/config/config-od6s.js";
import { od6sutilities } from "../../module/system/utilities.js";

export const od6sUtilitiesTests = (context) => {
  const { describe, it, expect } = context;

  describe("od6sutilities", () => {
    describe("accessDeepProp", () => {
      it("should return the object if path is empty", () => {
        const obj = { a: 1 };
        expect(od6sutilities.accessDeepProp(obj, "")).to.equal(obj);
      });

      it("should return nested property value", () => {
        const obj = { a: { b: { c: 42 } } };
        expect(od6sutilities.accessDeepProp(obj, "a.b.c")).to.equal(42);
      });
    });

    describe("getDiceFromScore", () => {
      it("should convert score to dice and pips (pipsPerDice = 3)", () => {
        // Mock OD6S.pipsPerDice = 3
        const originalPips = OD6S.pipsPerDice;
        OD6S.pipsPerDice = 3;
        try {
          const result = od6sutilities.getDiceFromScore(7);
          expect(result.dice).to.equal(2);
          expect(result.pips).to.equal(1);
        } finally {
          OD6S.pipsPerDice = originalPips;
        }
      });
    });

    describe("getScoreFromDice", () => {
      it("should convert dice and pips to score", () => {
        const originalPips = OD6S.pipsPerDice;
        OD6S.pipsPerDice = 3;
        try {
          const score = od6sutilities.getScoreFromDice(2, 1);
          expect(score).to.equal(7);
        } finally {
          OD6S.pipsPerDice = originalPips;
        }
      });
    });

    describe("getTextFromDice", () => {
      it("should return formatted string", () => {
        const dice = { dice: 3, pips: 2 };
        expect(od6sutilities.getTextFromDice(dice)).to.equal("3D+2");
      });
    });

    describe("getWoundPenalty", () => {
        it("should return 0 for vehicles and starships", () => {
            const vehicle = { type: 'vehicle' };
            const starship = { type: 'starship' };
            expect(od6sutilities.getWoundPenalty(vehicle)).to.equal(0);
            expect(od6sutilities.getWoundPenalty(starship)).to.equal(0);
        });

        it("should return penalty from deadliness config for characters (woundConfig 1)", () => {
            const originalWoundConfig = OD6S.woundConfig;
            const originalDeadliness = OD6S.deadliness;
            OD6S.woundConfig = 1;
            OD6S.deadliness = {
                3: {
                    'healthy': { penalty: 0 },
                    'wounded': { penalty: -1 }
                }
            };
            try {
                const actor = {
                    type: 'character',
                    system: { wounds: { value: 'wounded' } }
                };
                expect(od6sutilities.getWoundPenalty(actor)).to.equal(-1);
            } finally {
                OD6S.woundConfig = originalWoundConfig;
                OD6S.deadliness = originalDeadliness;
            }
        });
    });

    describe("boolCheck", () => {
      it("should return true for string 'true'", () => {
        expect(od6sutilities.boolCheck("true")).to.equal(true);
      });

      it("should return false for string 'false'", () => {
        expect(od6sutilities.boolCheck("false")).to.equal(false);
      });

      it("should return false for any other string", () => {
        expect(od6sutilities.boolCheck("yes")).to.equal(false);
        expect(od6sutilities.boolCheck("")).to.equal(false);
      });

      it("should pass through boolean values unchanged", () => {
        expect(od6sutilities.boolCheck(true)).to.equal(true);
        expect(od6sutilities.boolCheck(false)).to.equal(false);
      });
    });

    describe("getInjury", () => {
      it("should return correct wound level for character damage", () => {
        const originalDamage = OD6S.damage;
        OD6S.damage = {
          "OD6S.WOUNDS_STUNNED": 1,
          "OD6S.WOUNDS_WOUNDED": 4,
          "OD6S.WOUNDS_INCAPACITATED": 9,
          "OD6S.WOUNDS_MORTALLY_WOUNDED": 13,
          "OD6S.WOUNDS_DEAD": 16
        };
        try {
          expect(od6sutilities.getInjury(0, "character")).to.equal("");
          expect(od6sutilities.getInjury(1, "character")).to.equal("OD6S.WOUNDS_STUNNED");
          expect(od6sutilities.getInjury(5, "character")).to.equal("OD6S.WOUNDS_WOUNDED");
          expect(od6sutilities.getInjury(10, "character")).to.equal("OD6S.WOUNDS_INCAPACITATED");
          expect(od6sutilities.getInjury(16, "character")).to.equal("OD6S.WOUNDS_DEAD");
        } finally {
          OD6S.damage = originalDamage;
        }
      });

      it("should return correct damage level for vehicles", () => {
        const originalVD = OD6S.vehicle_damage;
        OD6S.vehicle_damage = {
          "OD6S.NO_DAMAGE": { damage: 0 },
          "OD6S.DAMAGE_LIGHT": { damage: 4 },
          "OD6S.DAMAGE_DESTROYED": { damage: 16 }
        };
        try {
          expect(od6sutilities.getInjury(0, "vehicle")).to.equal("OD6S.NO_DAMAGE");
          expect(od6sutilities.getInjury(5, "vehicle")).to.equal("OD6S.DAMAGE_LIGHT");
          expect(od6sutilities.getInjury(20, "vehicle")).to.equal("OD6S.DAMAGE_DESTROYED");
        } finally {
          OD6S.vehicle_damage = originalVD;
        }
      });

      it("should use vehicle_damage for starships", () => {
        const originalVD = OD6S.vehicle_damage;
        OD6S.vehicle_damage = {
          "OD6S.NO_DAMAGE": { damage: 0 }
        };
        try {
          expect(od6sutilities.getInjury(0, "starship")).to.equal("OD6S.NO_DAMAGE");
        } finally {
          OD6S.vehicle_damage = originalVD;
        }
      });
    });

    describe("getMeleeDamage", () => {
      it("should add strength damage when weapon has str flag", () => {
        const actor = { system: { strengthdamage: { score: 5 } } };
        const weapon = { system: { damage: { str: true, score: 3 } } };
        expect(od6sutilities.getMeleeDamage(actor, weapon)).to.equal(8);
      });

      it("should return only weapon damage when str flag is false", () => {
        const actor = { system: { strengthdamage: { score: 5 } } };
        const weapon = { system: { damage: { str: false, score: 3 } } };
        expect(od6sutilities.getMeleeDamage(actor, weapon)).to.equal(3);
      });

      it("should handle zero scores", () => {
        const actor = { system: { strengthdamage: { score: 0 } } };
        const weapon = { system: { damage: { str: true, score: 0 } } };
        expect(od6sutilities.getMeleeDamage(actor, weapon)).to.equal(0);
      });
    });

    describe("getActiveAttributes", () => {
      it("should return only active attribute keys", () => {
        const originalAttrs = OD6S.attributes;
        OD6S.attributes = {
          "agi": { active: true },
          "str": { active: true },
          "hidden": { active: false }
        };
        try {
          const result = od6sutilities.getActiveAttributes();
          expect(result).to.include("agi");
          expect(result).to.include("str");
          expect(result).to.not.include("hidden");
          expect(result.length).to.equal(2);
        } finally {
          OD6S.attributes = originalAttrs;
        }
      });

      it("should return empty array when no attributes are active", () => {
        const originalAttrs = OD6S.attributes;
        OD6S.attributes = {
          "agi": { active: false }
        };
        try {
          const result = od6sutilities.getActiveAttributes();
          expect(result.length).to.equal(0);
        } finally {
          OD6S.attributes = originalAttrs;
        }
      });
    });

    describe("getActiveAttributesSelect", () => {
      it("should return object mapping keys to names for active attributes", () => {
        const originalAttrs = OD6S.attributes;
        OD6S.attributes = {
          "agi": { active: true, name: "Agility" },
          "str": { active: true, name: "Strength" },
          "hidden": { active: false, name: "Hidden" }
        };
        try {
          const result = od6sutilities.getActiveAttributesSelect();
          expect(result).to.have.property("agi", "Agility");
          expect(result).to.have.property("str", "Strength");
          expect(result).to.not.have.property("hidden");
        } finally {
          OD6S.attributes = originalAttrs;
        }
      });
    });

    describe("getDifficultyLevelSelect", () => {
      it("should return only difficulty levels with min > 0", () => {
        const originalDiff = OD6S.difficulty;
        OD6S.difficulty = {
          "OD6S.DIFFICULTY_UNKNOWN": { min: 0, max: 0 },
          "OD6S.DIFFICULTY_EASY": { min: 6, max: 10 },
          "OD6S.DIFFICULTY_MODERATE": { min: 11, max: 15 }
        };
        try {
          const result = od6sutilities.getDifficultyLevelSelect();
          expect(result).to.not.have.property("OD6S.DIFFICULTY_UNKNOWN");
          expect(result).to.have.property("OD6S.DIFFICULTY_EASY");
          expect(result).to.have.property("OD6S.DIFFICULTY_MODERATE");
        } finally {
          OD6S.difficulty = originalDiff;
        }
      });
    });

    describe("getTextFromDice edge cases", () => {
      it("should handle zero dice and zero pips", () => {
        expect(od6sutilities.getTextFromDice({ dice: 0, pips: 0 })).to.equal("0D+0");
      });

      it("should handle large values", () => {
        expect(od6sutilities.getTextFromDice({ dice: 10, pips: 2 })).to.equal("10D+2");
      });
    });

    describe("getDiceFromScore edge cases", () => {
      it("should handle score of 0", () => {
        const originalPips = OD6S.pipsPerDice;
        OD6S.pipsPerDice = 3;
        try {
          const result = od6sutilities.getDiceFromScore(0);
          expect(result.dice).to.equal(0);
          expect(result.pips).to.equal(0);
        } finally {
          OD6S.pipsPerDice = originalPips;
        }
      });

      it("should handle exact die boundaries", () => {
        const originalPips = OD6S.pipsPerDice;
        OD6S.pipsPerDice = 3;
        try {
          const result = od6sutilities.getDiceFromScore(9);
          expect(result.dice).to.equal(3);
          expect(result.pips).to.equal(0);
        } finally {
          OD6S.pipsPerDice = originalPips;
        }
      });
    });

    describe("getScoreFromDice edge cases", () => {
      it("should handle zero dice and zero pips", () => {
        const originalPips = OD6S.pipsPerDice;
        OD6S.pipsPerDice = 3;
        try {
          expect(od6sutilities.getScoreFromDice(0, 0)).to.equal(0);
        } finally {
          OD6S.pipsPerDice = originalPips;
        }
      });

      it("should handle string inputs (coercion)", () => {
        const originalPips = OD6S.pipsPerDice;
        OD6S.pipsPerDice = 3;
        try {
          expect(od6sutilities.getScoreFromDice("2", "1")).to.equal(7);
        } finally {
          OD6S.pipsPerDice = originalPips;
        }
      });
    });

    describe("applyDerivedEffect", () => {
      it("should add derived value to original value at change.key", () => {
        const obj = { system: { move: 10, attributes: { agi: { score: 5 } } } };
        const change = { key: "system.move", value: "@system.attributes.agi.score" };
        od6sutilities.applyDerivedEffect(obj, change);
        expect(obj.system.move).to.equal(15);
      });

      it("should negate when value starts with '-'", () => {
        const obj = { system: { move: 10, attributes: { agi: { score: 5 } } } };
        const change = { key: "system.move", value: "-@system.attributes.agi.score" };
        od6sutilities.applyDerivedEffect(obj, change);
        expect(obj.system.move).to.equal(-15);
      });

      it("should not modify obj when derived property is undefined", () => {
        const obj = { system: { move: 10 } };
        const change = { key: "system.move", value: "@system.nonexistent" };
        od6sutilities.applyDerivedEffect(obj, change);
        expect(obj.system.move).to.equal(10);
      });

      it("should not modify obj when original value at key is undefined", () => {
        const obj = { system: { attributes: { agi: { score: 5 } } } };
        const change = { key: "system.nonexistent", value: "@system.attributes.agi.score" };
        od6sutilities.applyDerivedEffect(obj, change);
        expect(obj.system).to.not.have.property("nonexistent");
      });
    });

    describe("wait", () => {
      it("should resolve after the specified time", async () => {
        const start = Date.now();
        await od6sutilities.wait(50);
        const elapsed = Date.now() - start;
        expect(elapsed).to.be.at.least(40);
      });
    });

    describe("getWoundLevel", () => {
      it("should return core wound level for characters (woundConfig 1)", () => {
        const originalWoundConfig = OD6S.woundConfig;
        const originalDeadliness = OD6S.deadliness;
        OD6S.woundConfig = 1;
        OD6S.deadliness = {
          3: {
            0: { core: "OD6S.WOUNDS_HEALTHY" },
            1: { core: "OD6S.WOUNDS_STUNNED" }
          }
        };
        try {
          expect(od6sutilities.getWoundLevel(0, { type: 'character' })).to.equal("OD6S.WOUNDS_HEALTHY");
          expect(od6sutilities.getWoundLevel(1, { type: 'character' })).to.equal("OD6S.WOUNDS_STUNNED");
          expect(od6sutilities.getWoundLevel(0, { type: 'npc' })).to.equal("OD6S.WOUNDS_HEALTHY");
          expect(od6sutilities.getWoundLevel(0, { type: 'creature' })).to.equal("OD6S.WOUNDS_HEALTHY");
        } finally {
          OD6S.woundConfig = originalWoundConfig;
          OD6S.deadliness = originalDeadliness;
        }
      });
    });
  });
};
