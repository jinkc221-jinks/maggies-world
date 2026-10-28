import fs from "node:fs";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { createMaggie } from "../src/character/createMaggie.js";

globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onloadend?.();
    });
  }
};

const { root, clips } = createMaggie();
const exporter = new GLTFExporter();
const data = await exporter.parseAsync(root, { binary: true, animations: clips });
fs.mkdirSync("public/models", { recursive: true });
fs.writeFileSync("public/models/maggie.glb", Buffer.from(data));
console.log(`maggie.glb ${Buffer.from(data).byteLength} bytes, clips: ${clips.map((clip) => clip.name).join(", ")}`);
