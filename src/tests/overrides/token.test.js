import { OD6SToken } from "../../module/overrides/token.js";

export const od6sTokenTests = (context) => {
  const { describe, it, assert } = context;

  describe("OD6SToken Tests", () => {
    it("OD6SToken should be a class", () => {
      assert.equal(typeof OD6SToken, "function");
    });

    it("OD6SToken should have a _canDrag method", () => {
      assert.equal(typeof OD6SToken.prototype._canDrag, "function");
    });

    it("OD6SToken should have a drawEffects method", () => {
      assert.equal(typeof OD6SToken.prototype.drawEffects, "function");
    });
  });
};
