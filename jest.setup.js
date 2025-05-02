import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import { jest } from "@jest/globals";

if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === "undefined") {
  globalThis.TextDecoder = TextDecoder;
}

globalThis.jest = jest;

globalThis.fetch = async () =>
  Promise.resolve({
    ok: true,
    json: async () => ({ username: "guest" }),
  });
