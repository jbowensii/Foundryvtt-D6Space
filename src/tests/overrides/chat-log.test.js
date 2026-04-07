import { OD6SChatLog } from "../../module/overrides/chat-log.js";

export const od6sChatLogTests = (context) => {
  const { describe, it, assert } = context;

  describe("OD6SChatLog Tests", () => {
    it("OD6SChatLog should be a class", () => {
      assert.equal(typeof OD6SChatLog, "function");
    });

    it("OD6SChatLog should have a notify method", () => {
      assert.equal(typeof OD6SChatLog.prototype.notify, "function");
    });
  });
};
