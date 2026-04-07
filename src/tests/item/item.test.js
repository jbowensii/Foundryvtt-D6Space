/**
 * Unit tests for OD6SItem in src/module/item/item.js
 */
import { OD6SItem } from "../../module/item/item.js";

export const od6sItemTests = (context) => {
  const { describe, it, assert } = context;

  describe("OD6SItem Tests", () => {
    it("prepareDerivedData for skills", () => {
      const item = {
        type: 'skill',
        system: {
          base: 10,
          mod: 2
        },
        prepareDerivedData: OD6SItem.prototype.prepareDerivedData
      };

      item.prepareDerivedData();
      assert.equal(item.system.score, 12, "Skill score should be base + mod");
    });

    it("prepareDerivedData for starship-weapon", () => {
      const item = {
        type: 'starship-weapon',
        system: {
          attribute: { value: 'mechanical' },
          skill: { value: 'starship gunnery' },
          specialization: { value: 'laser cannons' }
        },
        prepareDerivedData: OD6SItem.prototype.prepareDerivedData
      };

      item.prepareDerivedData();
      assert.ok(item.system.stats, "starship-weapon should have stats");
      assert.equal(item.system.stats.attribute, 'mechanical');
      assert.equal(item.system.stats.skill, 'starship gunnery');
      assert.equal(item.system.stats.specialization, 'laser cannons');
      assert.equal(item.system.subtype, 'vehiclerangedweaponattack');
    });

    it("applyMods for skill", () => {
      const item = {
        type: 'skill',
        system: {
          base: 5,
          mod: 3,
          score: 0
        },
        applyMods: OD6SItem.prototype.applyMods
      };

      item.applyMods();
      assert.equal(item.system.score, 8, "applyMods should update skill score");
    });

    it("getScore for skill (non-advanced, with actor)", () => {
       const item = {
         type: 'skill',
         system: {
           attribute: 'Strength',
           score: 5,
           isAdvancedSkill: false
         },
         actor: {
           system: {
             attributes: {
               strength: { score: 10 }
             }
           }
         },
         getScore: OD6SItem.prototype.getScore
       };

       const score = item.getScore();
       assert.equal(score, 15, "Non-advanced skill score should include attribute score");
    });

    it("getScore for advanced skill", () => {
      const item = {
        type: 'skill',
        system: {
          attribute: 'Knowledge',
          score: 5,
          isAdvancedSkill: true
        },
        actor: {
          system: {
            attributes: {
              knowledge: { score: 10 }
            }
          }
        },
        getScore: OD6SItem.prototype.getScore
      };

      const score = item.getScore();
      assert.equal(score, 5, "Advanced skill score should NOT include attribute score");
    });
  });
};
