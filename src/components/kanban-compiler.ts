function isStartWith(line: string, chara: string) {
  return line.trim().indexOf(chara) === 0;
}
function isHeading(line: string) {
  return isStartWith(line, "#");
}
function isList(line: string) {
  return isStartWith(line, "-") || isStartWith(line, "*");
}
function removeMarkup(line: string, chara: string) {
  return line
    .trim()
    .replace(chara, "")
    .trim();
}

interface Kanban {
  name: string;
  cards: string[];
}

export function compileKanban(input: string) {
  const lines = input.split(/[\r|\n|\r\n]/);
  const output: Kanban[] = [];
  let cards: string[] = [];
  lines.forEach(function (line) {
    if (isHeading(line)) {
      cards = [];

      output.push({
        name: removeMarkup(line, "#"),
        cards: cards,
      });
    } else if (isList(line)) {
      cards.push(removeMarkup(removeMarkup(line, "-"), "*"));
    }
  });
  return output;
}

function cardsToString(cards: string[]) {
  return cards.map(toList).join("\n");
}

function toList(card: string) {
  return "- " + card;
}

export function serializeKanban(data: Kanban[]) {
  return (
    data
      .map((item) => {
        return `# ${item.name}\n${cardsToString(item.cards)}`;
      })
      .join("\n\n") +
    "\n"
  );
}
