import { parse } from "https://deno.land/x/commit/mod.ts";

const text = Deno.args[0];
console.log(Deno.args);

const commit = parse(text);
/* {
  type: "fix",
  scope: "std/io",
  subject: "utf-8 encoding",
  merge: null,
  header: "fix(std/io): utf-8 encoding",
  body: null,
  footer: null,
  notes: [],
  references: [],
  mentions: [],
  revert: null
} */

if (!commit.type) {
  console.error("invalid type");
  Deno.exit(1);
}
