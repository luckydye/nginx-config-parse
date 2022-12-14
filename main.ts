import ConfFile from "./ConfFile.ts";

const decoder = new TextDecoder();
const configFile = Deno.readFileSync("./site.conf");
const config = decoder.decode(configFile);

const parsed = ConfFile.parse(config);

if (!Array.isArray(parsed[2])) {
  if (Array.isArray(parsed[2].properties[0])) {
    parsed[2].properties[0] = ["listen", "80"];
  }
}

console.log(ConfFile.parse(ConfFile.serialize(parsed)));
