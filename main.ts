import NginxConfig, { Scope } from "./NginxConfig.ts";

const decoder = new TextDecoder();
const configFile = Deno.readFileSync("./site.conf");
const config = decoder.decode(configFile);

const parsed = NginxConfig.parse(config);

function set(path: string, value: string) {
  const route = path.split(".");

  let scope: Scope | string[] | undefined = parsed;

  for (const p of route) {
    const key = p.split("[")[0];
    const arg = p.split("[")[1]?.replace("]", "");

    if (arg && !Array.isArray(scope)) {
      scope = (scope?.content.filter((ent) => !Array.isArray(ent) && ent.id === key) as Scope[]).find(
        (sc: Scope, i) => {
          const index = parseInt(arg);

          if (Number.isNaN(index)) {
            // @ts-ignore
            return sc.content[0][1] === arg;
          } else {
            return index === i;
          }
        }
      );
    } else {
      const prop = scope?.content.find((ent) => Array.isArray(ent) && ent[0] === "proxy_pass") as string[];
      prop[1] = value;
    }
  }
}

set("server[1].location[/].proxy_pass", "Test123");

console.log(NginxConfig.serialize(parsed));
