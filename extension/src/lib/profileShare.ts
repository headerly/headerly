const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export async function encodeProfileSharePayload(json: string) {
  const compressed = await gzip(textEncoder.encode(json));
  return compressed.toBase64({ alphabet: "base64url", omitPadding: true });
}

export async function decodeProfileSharePayload(payload: string) {
  const compressed = Uint8Array.fromBase64(payload, { alphabet: "base64url" });
  const decompressed = await gunzip(compressed);
  return textDecoder.decode(decompressed);
}

async function gzip(input: Uint8Array) {
  const stream = new Blob([toArrayBuffer(input)]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzip(input: Uint8Array) {
  const stream = new Blob([toArrayBuffer(input)]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function toArrayBuffer(input: Uint8Array) {
  const buffer = new ArrayBuffer(input.byteLength);
  new Uint8Array(buffer).set(input);
  return buffer;
}
