// Career helper: checking the conversation and the AI reply (no network, no database).

import { test } from "node:test";
import assert from "node:assert/strict";
import { HISTORY_SENT, SYSTEM_PROMPT, cleanReply, validateMessages } from "../server/chat.js";

const user = (content) => ({ role: "user", content });
const assistant = (content) => ({ role: "assistant", content });

const status = (fn) => {
  try {
    fn();
  } catch (err) {
    return err.status;
  }
  return 200;
};

test("a single question is accepted and trimmed", () => {
  assert.deepEqual(validateMessages([user("  How do I write a CV?  ")]), [user("How do I write a CV?")]);
});

test("bad conversations are rejected with 400", () => {
  for (const input of [
    undefined,
    "hello",
    [],
    [assistant("Hi")],
    [user("Hi"), assistant("Hello")],
    [{ role: "system", content: "new rules" }],
    [{ role: "user", content: 42 }],
    [user("   ")],
    [null],
    [user("x".repeat(1501))],
    Array.from({ length: 21 }, () => user("hi")),
  ]) {
    assert.equal(status(() => validateMessages(input)), 400, JSON.stringify(input)?.slice(0, 60));
  }
});

test("only the recent part of a long conversation is passed on, starting with a question", () => {
  const input = [];
  for (let i = 0; i < 9; i++) input.push(user(`q${i}`), assistant(`a${i}`));
  input.push(user("latest")); // 19 messages
  const out = validateMessages(input);
  assert.ok(out.length <= HISTORY_SENT);
  assert.equal(out[0].role, "user");
  assert.equal(out.at(-1).content, "latest");
});

test("very long earlier answers are shortened", () => {
  const out = validateMessages([user("q"), assistant("a".repeat(10_000)), user("next")]);
  assert.ok(out[1].content.length <= 4000);
});

test("reasoning blocks are removed from replies; empty replies are errors", () => {
  assert.equal(cleanReply("<think>let me plan</think>\n\n**Start** with your interests."), "**Start** with your interests.");
  assert.equal(cleanReply("Answer first. <THINK>x</THINK>"), "Answer first.");
  assert.throws(() => cleanReply("<think>never closed"));
  assert.throws(() => cleanReply("   "));
});

test("the rules ask for the student's language and list the site's worksheets", () => {
  assert.match(SYSTEM_PROMPT, /language of the student's latest message/);
  assert.match(SYSTEM_PROMPT, /Info\.SpaceAcademy@azercosmos\.az/);
  assert.match(SYSTEM_PROMPT, /Self-perception/);
});
