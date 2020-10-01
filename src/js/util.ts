export function modulo(a: number, b: number) {
  return a - b * Math.floor(a / b);
}

export function capitalize(s: string) {
  return s[0].toUpperCase() + s.substr(1).toLowerCase();
}

export function formatList(list: string[], none = "(none)") {
  switch (list.length) {
    case 0:
      return none;
    case 1:
      return list[0];
    case 2:
      return `${list[0]} and ${list[1]}`;
    default:
      return (
        list.slice(0, list.length - 1).join(", ") +
        ", and " +
        list[list.length - 1]
      );
  }
}

export function digitToStringOrdinal(n: number) {
  switch (n) {
    case 0:
      return "first";
    case 1:
      return "second";
    case 2:
      return "third";
    case 3:
      return "fourth";
    case 4:
      return "fifth";
    case 5:
      return "sixth";
    case 6:
      return "seventh";
    case 7:
      return "eighth";
    case 8:
      return "ninth";
    case 9:
      return "tenth";
    default:
      return "unknown";
  }
}

export function digitToStringFractional(n: number) {
  switch (n) {
    case 2:
      return "half";
    case 3:
      return "third";
    case 4:
      return "quarter";
    case 5:
      return "fifth";
    case 6:
      return "sixth";
    case 7:
      return "seventh";
    case 8:
      return "eighth";
    case 9:
      return "ninth";
    case 10:
      return "tenth";
    default:
      return "unknown";
  }
}
