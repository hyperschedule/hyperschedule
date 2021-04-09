export function mod(a: number, b: number) {
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

/**
 * Given an array of integers in sorted order, determine the beginning
 * and end of each run of consecutive integers. For example:
 *
 * getConsecutiveRanges([0,1,2,4,5,8,10,12,13,14,15,20])
 *   => [[0,2], [4,5], [8,8], [10,10], [12,15], [20,20]]
 */
export function getConsecutiveRanges(nums: number[]): [number, number][] {
  if (nums.length === 0) return [];

  const ranges: [number, number][] = [];
  let min = nums[0];
  let prev = nums[0];
  for (let i = 1; i < nums.length; ++i) {
    const num = nums[i];
    if (num !== prev + 1) {
      ranges.push([min, prev]);
      min = num;
    }
    prev = num;
  }
  ranges.push([min, prev]);
  return ranges;
}

export function catchEvent(event: Event) {
  event.stopPropagation();
}
