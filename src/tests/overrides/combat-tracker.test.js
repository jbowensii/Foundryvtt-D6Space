import { OD6SCombatTracker } from "../../module/overrides/combat-tracker.js";

export const od6sCombatTrackerTests = (context) => {
  const { describe, it, assert } = context;

  describe("OD6SCombatTracker Tests", () => {
    it("OD6SCombatTracker should be a class", () => {
      assert.equal(typeof OD6SCombatTracker, "function");
    });

    it("OD6SCombatTracker should have an _onCombatantControl method", () => {
      assert.equal(typeof OD6SCombatTracker.prototype._onCombatantControl, "function");
    });
  });
};
