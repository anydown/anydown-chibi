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

export interface Card {
  name: string;
  id: number;
}

export interface Kanban {
  name: string;
  id: number;
  cards: Card[];
}

export function compileKanban(input: string) {
  const lines = input.split(/[\r|\n|\r\n]/);
  const output: Kanban[] = [];
  let cards: Card[] = [];
  let count = 0;
  lines.forEach(function (line, index) {
    if (isHeading(line)) {
      cards = [];

      output.push({
        id: index,
        name: removeMarkup(line, "#"),
        cards: cards,
      });
    } else if (isList(line)) {
      cards.push({
        name: removeMarkup(removeMarkup(line, "-"), "*"),
        id: count++,
      });
    }
  });
  return output;
}

function cardsToString(cards: Card[]) {
  return cards.map(toList).join("\n");
}

function toList(card: Card) {
  return "- " + card.name;
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
