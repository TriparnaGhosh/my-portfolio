import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import Message from "../models/Message.js";
import Portfolio from "../models/Portfolio.js";
import { deleteMessage } from "../controllers/messages.js";
import { updatePortfolio } from "../controllers/portfolio.js";

const originalFindOneAndUpdate = Portfolio.findOneAndUpdate;
const originalFindByIdAndDelete = Message.findByIdAndDelete;

function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

afterEach(() => {
  Portfolio.findOneAndUpdate = originalFindOneAndUpdate;
  Message.findByIdAndDelete = originalFindByIdAndDelete;
});

test("portfolio updates only persist editable fields", async () => {
  let update;
  Portfolio.findOneAndUpdate = async (_filter, changes) => {
    update = changes;
    return { profile: { name: "Updated" } };
  };
  const res = response();

  await updatePortfolio({
    body: {
      profile: { name: "Updated" },
      _id: "immutable-id",
      __v: 99,
      media: [{ url: "stale-upload" }],
      resumeUrl: "stale-resume",
      dataVersion: 99
    }
  }, res);

  assert.deepEqual(Object.keys(update.$set).sort(), ["profile", "updatedAt"]);
  assert.ok(update.$set.updatedAt instanceof Date);
  assert.equal(res.body.profile.name, "Updated");
});

test("portfolio updates reject non-object payloads", async () => {
  let called = false;
  Portfolio.findOneAndUpdate = async () => { called = true; };
  const res = response();

  await updatePortfolio({ body: [] }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(called, false);
});

test("message deletion returns 404 when the message does not exist", async () => {
  Message.findByIdAndDelete = async () => null;
  const res = response();

  await deleteMessage({ params: { id: "missing" } }, res);

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { message: "Message not found" });
});
