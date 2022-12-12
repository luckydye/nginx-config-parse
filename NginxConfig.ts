export type ScopeContent = Array<Scope | string[]>;
export type Scope = { id: string; content: ScopeContent };

export default class NginxConfig {
  static parse(str: string) {
    const createScope = (id: string, content: ScopeContent = []): Scope => {
      return { id, content };
    };

    const file = createScope("root", [["root"]]);
    const route = [file];

    let scope: Scope = route[0];

    let words: string[] = [];
    let word = "";

    let ignore = false;

    for (const char of str) {
      if (char === "#") {
        ignore = true;
        continue;
      }
      if (char.match(/\n|\r/g)) {
        ignore = false;
      }

      if (ignore) continue;

      if (char === "{") {
        // push scope
        const command = words[0];
        if (command) {
          const newScoep = createScope(command);
          scope.content.push(newScoep);
          scope = newScoep;
          route.push(scope);
        } else {
          console.warn("scope without command");
        }
        continue;
      }

      if (char === "}") {
        // pop scope
        route.pop();
        scope = route[route.length - 1];
        continue;
      }

      if (char === " ") {
        // whitespace
        if (word) {
          words.push(word);
          word = "";
        }
        continue;
      }

      if (char.match(/\n|\r/g) || char === ";") {
        // newlinw
        if (word) {
          words.push(word);
          word = "";
        }

        if (words.length > 0) {
          // commit line
          scope.content.push(words);
          // scope[command] = words.length > 2 ? words.slice(1) : words[1];
        }

        words = [];
        word = "";
        continue;
      }

      word += char;
    }

    return file;
  }

  static serialize(file: Scope) {
    const indent = (str: string, indent: number) => {
      const code = new Array(indent).fill(" ").join("");
      return str
        .split(/\n/g)
        .map((l) => code + l)
        .join("\n");
    };

    const tostring = (scope: Scope) => {
      let res = "";

      for (const ent of scope.content.slice(1)) {
        if (Array.isArray(ent)) {
          res += `\n${ent[0]}  ${ent.slice(1).join(" ")};`;
        } else {
          const line: string[] = ent.content[0] as string[];
          res += `\n\n${line.join(" ")} {`;
          res += indent(tostring(ent), 4);
          res += `\n}`;
        }
      }

      return res;
    };

    return tostring(file);
  }
}
