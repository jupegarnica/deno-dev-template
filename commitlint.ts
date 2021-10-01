import { parse } from "https://deno.land/x/commit/mod.ts";

const text = Deno.readTextFileSync("./.git/COMMIT_EDITMSG");

const commit = parse(text);

if (!commit.type) {
  console.error("invalid type");
  Deno.exit(1);
}
