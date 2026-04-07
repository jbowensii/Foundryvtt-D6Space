import { OD6SCombat } from "../../module/overrides/combat.js";

export const od6sCombatTests = (context) => {
  const { describe, it, assert } = context;

  describe("OD6SCombat Tests", () => {
    it("OD6SCombat should be a class", () => {
      assert.equal(typeof OD6SCombat, "function");
    });

    it("OD6SCombat should have a nextRound method", () => {
      assert.equal(typeof OD6SCombat.prototype.nextRound, "function");
    });
  });
};
