import { OD6SCompendiumDirectory } from "../../module/overrides/compendium-directory.js";

export const od6sCompendiumDirectoryTests = (context) => {
  const { describe, it, assert } = context;

  describe("OD6SCompendiumDirectory Tests", () => {
    it("OD6SCompendiumDirectory should be a class", () => {
      assert.equal(typeof OD6SCompendiumDirectory, "function");
    });

    it("OD6SCompendiumDirectory should have a _prepareContext method", () => {
      assert.equal(typeof OD6SCompendiumDirectory.prototype._prepareContext, "function");
    });
  });
};
