import OD6S from "../../module/config/config-od6s.js";

export const od6sHandlebarsTests = (context) => {
  const { describe, it, expect } = context;

  describe("od6sHandlebars Helpers", () => {
    describe("isExplosivesAuto", () => {
      it("should return the value of the auto_explosive setting", () => {
        const originalGet = game.settings.get;
        game.settings.get = (mod, key) => key === 'auto_explosive' ? true : false;

        const helper = Handlebars.helpers['isExplosivesAuto'];
        expect(helper()).to.be.true;

        game.settings.get = originalGet;
      });
    });

    describe("concat", () => {
        it("should concatenate multiple arguments", () => {
            const helper = Handlebars.helpers['concat'];
            // Handlebars helpers receive arguments and a final options object
            const result = helper("a", "b", "c", { hash: {} });
            expect(result).to.equal("abc");
        });
    });

    describe("isdefined", () => {
        it("should return true for 0", () => {
            const helper = Handlebars.helpers['isdefined'];
            expect(helper(0)).to.be.true;
        });
        it("should return false for null", () => {
            const helper = Handlebars.helpers['isdefined'];
            expect(helper(null)).to.be.false;
        });
    });
  });
};
