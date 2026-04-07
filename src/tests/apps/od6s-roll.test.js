import { 
  OD6SRoll, 
  OD6SInitRoll, 
  RollDialog, 
  InitRollDialog,
  buildRollString,
  snapshotBonusInputs,
  adjustCharacterPoints,
  getHighestDefenseScore,
  sanitizeBonusInputs
} from "../../module/apps/OD6SRoll.js";
import OD6S from "../../module/config/config-od6s.js";

export const od6sRollUnitTests = (context) => {
  const { describe, it, assert, before, after } = context;

  describe("OD6SRoll.js Unit Tests", () => {
    
    // Store originals for properties we patch on existing globals
    let savedGameProps = {};
    let savedUiProps = {};
    let savedCanvasProps = {};

    before(() => {
      // Patch game properties individually instead of replacing the game object
      // This preserves Foundry's background processes that reference game internals
      const gamePatches = {
        ready: true,
        i18n: { localize: (key) => key },
        settings: {
          get: (module, key) => {
            if (key === 'use_wild_die') return true;
            return false;
          }
        }
      };
      for (const [key, val] of Object.entries(gamePatches)) {
        savedGameProps[key] = globalThis.game?.[key];
        try { globalThis.game[key] = val; } catch (_) {}
      }

      // Patch ui properties individually
      const uiPatches = {
        notifications: { warn: () => {}, error: () => {} }
      };
      for (const [key, val] of Object.entries(uiPatches)) {
        savedUiProps[key] = globalThis.ui?.[key];
        try { globalThis.ui[key] = val; } catch (_) {}
      }

      // Patch canvas properties individually
      const canvasPatches = {
        ready: true,
        tokens: { controlled: [] }
      };
      for (const [key, val] of Object.entries(canvasPatches)) {
        savedCanvasProps[key] = globalThis.canvas?.[key];
        try { globalThis.canvas[key] = val; } catch (_) {}
      }
    });

    after(() => {
      for (const [key, val] of Object.entries(savedGameProps)) {
        try { globalThis.game[key] = val; } catch (_) {}
      }
      for (const [key, val] of Object.entries(savedUiProps)) {
        try { globalThis.ui[key] = val; } catch (_) {}
      }
      for (const [key, val] of Object.entries(savedCanvasProps)) {
        try { globalThis.canvas[key] = val; } catch (_) {}
      }
    });

    describe("buildRollString", () => {
      it("should build basic roll string without wild die", () => {
        const rollData = { dice: 3, pips: 0, wilddie: false };
        const base = game.i18n.localize("OD6S.BASE_DIE_FLAVOR");
        assert.equal(buildRollString(rollData), `3d6${base}`);
      });

      it("should build roll string with wild die", () => {
        const rollData = { dice: 3, pips: 0, wilddie: true };
        const base = game.i18n.localize("OD6S.BASE_DIE_FLAVOR");
        const wild = game.i18n.localize("OD6S.WILD_DIE_FLAVOR");
        assert.equal(buildRollString(rollData), `2d6${base}+1dw${wild}`);
      });

      it("should handle only wild die", () => {
        const rollData = { dice: 1, pips: 0, wilddie: true };
        const wild = game.i18n.localize("OD6S.WILD_DIE_FLAVOR");
        assert.equal(buildRollString(rollData), `1dw${wild}`);
      });

      it("should handle pips", () => {
        const rollData = { dice: 3, pips: 2, wilddie: false };
        const base = game.i18n.localize("OD6S.BASE_DIE_FLAVOR");
        assert.equal(buildRollString(rollData), `3d6${base}+2`);
      });

      it("should handle character points", () => {
        const rollData = { dice: 3, pips: 0, wilddie: false, characterpoints: 1 };
        const base = game.i18n.localize("OD6S.BASE_DIE_FLAVOR");
        const cp = game.i18n.localize("OD6S.CHARACTER_POINT_DIE_FLAVOR");
        assert.equal(buildRollString(rollData), `3d6${base}+1db${cp}`);
      });

      it("should handle bonus dice and pips", () => {
        const rollData = { dice: 3, pips: 0, wilddie: false, bonusdice: 1, bonuspips: 2 };
        const base = game.i18n.localize("OD6S.BASE_DIE_FLAVOR");
        const bonus = game.i18n.localize("OD6S.BONUS_DIE_FLAVOR");
        assert.equal(buildRollString(rollData), `3d6${base}+1d6${bonus}+2`);
      });
    });

    describe("adjustCharacterPoints", () => {
      it("should increment character points within limits", () => {
        const rollData = { 
          characterpoints: 0, 
          actor: { system: { characterpoints: { value: 5 } } } 
        };
        const result = adjustCharacterPoints(rollData, 1, 3);
        assert.equal(result, true);
        assert.equal(rollData.characterpoints, 1);
        assert.equal(rollData.cpcost, 1);
      });

      it("should NOT increment beyond cpLimit", () => {
        const rollData = { 
          characterpoints: 3, 
          actor: { system: { characterpoints: { value: 5 } } } 
        };
        const result = adjustCharacterPoints(rollData, 1, 3);
        assert.equal(result, false);
        assert.equal(rollData.characterpoints, 3);
      });

      it("should NOT increment beyond actor's available CP", () => {
        const rollData = { 
          characterpoints: 2, 
          actor: { system: { characterpoints: { value: 2 } } } 
        };
        const result = adjustCharacterPoints(rollData, 1, 5);
        assert.equal(result, false);
        assert.equal(rollData.characterpoints, 2);
      });

      it("should decrement character points", () => {
        const rollData = { 
          characterpoints: 1, 
          actor: { system: { characterpoints: { value: 5 } } } 
        };
        const result = adjustCharacterPoints(rollData, -1, 5);
        assert.equal(result, true);
        assert.equal(rollData.characterpoints, 0);
      });

      it("should NOT decrement below zero", () => {
        const rollData = { 
          characterpoints: 0, 
          actor: { system: { characterpoints: { value: 5 } } } 
        };
        const result = adjustCharacterPoints(rollData, -1, 5);
        assert.equal(result, false);
        assert.equal(rollData.characterpoints, 0);
      });
    });

    describe("getHighestDefenseScore", () => {
      it("should return the maximum of dodge, parry, block", () => {
        const targetData = {
          dodge: { score: 10 },
          parry: { score: 15 },
          block: { score: 5 }
        };
        assert.equal(getHighestDefenseScore(targetData), 15);
      });
    });

    describe("sanitizeBonusInputs", () => {
      it("should ensure bonus dice and pips are non-negative numbers", () => {
        const rollData = { bonusdice: -1, bonuspips: "abc" };
        sanitizeBonusInputs(rollData);
        assert.equal(rollData.bonusdice, 0);
        assert.equal(rollData.bonuspips, 0);
        
        rollData.bonusdice = 2;
        rollData.bonuspips = 3;
        sanitizeBonusInputs(rollData);
        assert.equal(rollData.bonusdice, 2);
        assert.equal(rollData.bonuspips, 3);
      });
    });

    describe("InitRollDialog", () => {
      it("should have expected DEFAULT_OPTIONS", () => {
        assert.ok(InitRollDialog.DEFAULT_OPTIONS);
        assert.equal(InitRollDialog.DEFAULT_OPTIONS.tag, 'form');
      });

      it("can be instantiated", () => {
        const rollData = { test: true };
        const dialog = new InitRollDialog({ rollData });
        assert.ok(dialog);
        assert.equal(dialog.rollData, rollData);
      });

      it("render should be mocked", () => {
        const rollData = { 
          test: true, 
          actor: { system: { characterpoints: { value: 10 } } },
          characterpoints: 1
        };
        const dialog = new InitRollDialog({ rollData });
        let renderCalled = false;
        dialog.render = () => { renderCalled = true; };
        
        // Mock call with dialog instance as 'this'
        InitRollDialog._cpup.call(dialog, { preventDefault: () => {} }, null);
        assert.ok(renderCalled, "dialog.render should have been called");
        assert.equal(rollData.characterpoints, 2);
      });
    });

    describe("OD6SRoll", () => {
      it("applyDifficultyEffects returns an array", () => {
        const rollData = {
          subtype: 'skill',
          modifiers: {
            cover: '',
            coverlight: '',
            coversmoke: '',
            calledshot: '',
            modifier: 0,
            scalemod: 0,
            miscmod: 0
          }
        };
        const result = OD6SRoll.applyDifficultyEffects(rollData);
        assert.ok(Array.isArray(result));
      });
    });
  });
};
