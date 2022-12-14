export type ScopeContent = Array<Scope | string[]>;
export type Scope = { id: string; properties: ScopeContent };

const indent = (str: string, indent: number) => {
  const code = new Array(indent).fill(" ").join("");
  return str
    .split(/\n/g)
    .map((l) => code + l)
    .join("\n");
};

export default class ConfFile {
  static parse(str: string): ScopeContent {
    const createScope = (id: string, properties: ScopeContent = []): Scope => {
      return { id, properties };
    };

    const file = createScope("root", []);
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
          const newScoep = createScope(words.join(" "));
          scope.properties.push(newScoep);
          scope = newScoep;
          route.push(scope);

          words = [];
          word = "";
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
          scope.properties.push(words);
        }

        words = [];
        word = "";
        continue;
      }

      word += char;
    }

    return file.properties;
  }

  static serialize(file: ScopeContent) {
    const tostring = (scope: Scope) => {
      let res = "";

      for (const ent of scope.properties) {
        if (Array.isArray(ent)) {
          res += `\n${ent[0]}  ${ent.slice(1).join(" ")};`;
        } else {
          const line: string = ent.id;
          res += `\n\n${line} {`;
          res += indent(tostring(ent), 4);
          res += `\n}`;
        }
      }

      return res;
    };

    return tostring({ id: "root", properties: file });
  }
}
