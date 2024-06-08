import * as util from "./gantt-util";

const delimiter = ",";
export function compile(input: string) {
  let data = input.split(/[\r|\n|\r\n]/).filter((item) => item.length > 0);

  if (data.length === 0) {
    return [];
  }

  return data.map((item) => {
    const ary = item.split(delimiter);
    if (ary.length !== 3) {
      throw new Error("Invalid data format");
    }

    return {
      name: ary[0],
      start: util.getNewDate(ary[1], 0).getTime(),
      end: util.getNewDate(ary[2], 1).getTime(),
    };
  });
}

function zeropad(str: number) {
  return ("00" + str).slice(-2);
}
function ymd(d: Date) {
  return `${d.getFullYear()}-${zeropad(d.getMonth() + 1)}-${
    zeropad(
      d.getDate(),
    )
  }`;
}
function ymdFromEpoc(epoc: number, offset?: number) {
  let d = new Date(epoc);
  if (offset !== undefined) {
    d.setDate(d.getDate() + offset);
  }
  return ymd(d);
}

export interface Task {
  name: string;
  start: number;
  end: number;
}

export function serialize(tasks: Task[]) {
  return (
    tasks
      .map((item) => {
        return `${item.name}${delimiter}${
          ymdFromEpoc(
            item.start,
          )
        }${delimiter}${ymdFromEpoc(item.end, -1)}`;
      })
      .join("\n") + "\n"
  );
}
