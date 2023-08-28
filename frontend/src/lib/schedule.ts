import * as APIv4 from "hyperschedule-shared/api/v4";

export type Card = {
    section: APIv4.SectionIdentifier;
    sectionObj: APIv4.Section; // i see a refactor coming
    day: APIv4.Weekday;
    startTime: number;
    endTime: number;
    priority: number;
    locations: string[];
};

export type Bounds = {
    startTime: number;
    endTime: number;
    sunday: boolean;
    saturday: boolean;
};

export type Group = {
    startTime: number;
    endTime: number;
    cards: [Card, ...Card[]];
};

export const defaultBounds: Readonly<Bounds> = Object.freeze({
    startTime: 8 * 3600, // 8am
    endTime: 18 * 3600, // 6pm
    sunday: false,
    saturday: false,
});

export const dayOrder = [
    APIv4.Weekday.sunday,
    APIv4.Weekday.monday,
    APIv4.Weekday.tuesday,
    APIv4.Weekday.wednesday,
    APIv4.Weekday.thursday,
    APIv4.Weekday.friday,
    APIv4.Weekday.saturday,
] as const;

export function cardKey(card: Readonly<Card>) {
    return `${APIv4.stringifySectionCodeLong(card.section)}:${card.day}/${
        card.startTime
    }-${card.endTime}`;
}

export function getCards(section: Readonly<APIv4.Section>, priority: number) {
    const cards: Card[] = [];
    for (const schedule of section.schedules) {
        if (schedule.startTime === schedule.endTime) continue;

        for (const day of schedule.days)
            cards.push({
                day,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                section: section.identifier,
                sectionObj: section,
                locations: schedule.locations,
                priority,
            });
    }
    return cards;
}

export function groupCardsByDay(cards: readonly Readonly<Card>[]) {
    const byDay: Record<APIv4.Weekday, Readonly<Card>[]> = {
        [APIv4.Weekday.monday]: [],
        [APIv4.Weekday.tuesday]: [],
        [APIv4.Weekday.wednesday]: [],
        [APIv4.Weekday.thursday]: [],
        [APIv4.Weekday.friday]: [],
        [APIv4.Weekday.saturday]: [],
        [APIv4.Weekday.sunday]: [],
    };
    for (const card of cards) byDay[card.day].push(card);
    return byDay;
}

export function stackCards(cards: Readonly<Card>[]) {
    const order: number[] = [0];
    cards.sort(compareEndTime);

    for (let i = 1; i < cards.length; ++i) {
        const current = cards[i]!;
        let maxDepth = -1;

        for (let j = i - 1; j >= 0; --j) {
            const prev = cards[j]!;
            if (current.startTime >= prev.endTime) break;
            maxDepth = Math.max(maxDepth, order[j]!);
        }

        order[i] = maxDepth + 1;
    }

    return order;
}

export function stackCardsReverse(cards: Readonly<Card>[]) {
    const order: number[] = [];
    order[cards.length - 1] = 0;

    cards.sort(compareStartTime);

    for (let i = cards.length - 1; i >= 0; --i) {
        const current = cards[i]!;
        let maxDepth = -1;

        for (let j = i + 1; j < cards.length; ++j) {
            const prev = cards[j]!;
            if (current.endTime <= prev.startTime) break;
            maxDepth = Math.max(maxDepth, order[j]!);
        }

        order[i] = maxDepth + 1;
    }

    return order;
}

export function compareEndTime(a: Readonly<Card>, b: Readonly<Card>) {
    return a.endTime - b.endTime || a.startTime - b.startTime;
}

export function compareStartTime(a: Readonly<Card>, b: Readonly<Card>) {
    return a.startTime - b.startTime || a.endTime - b.endTime;
}

export function comparePriority(a: Readonly<Card>, b: Readonly<Card>) {
    return a.priority - b.priority;
}

export function mergeCards(cards: Readonly<Card>[]) {
    cards.sort(compareStartTime);

    const first = cards[0];

    if (!first) return [];

    //const groups: Readonly<Card>[][] = [[cards[0]!]];

    const groups: Group[] = [
        { startTime: first.startTime, endTime: first.endTime, cards: [first] },
    ];

    for (let i = 1; i < cards.length; ++i) {
        const lastGroup = groups[groups.length - 1]!;
        const current = cards[i]!;

        if (current.startTime < lastGroup.endTime) {
            lastGroup.endTime = Math.max(lastGroup.endTime, current.endTime);
            lastGroup.cards.push(current);
        } else
            groups.push({
                startTime: current.startTime,
                endTime: current.endTime,
                cards: [current],
            });
    }

    return groups;
}

export function sectionsConflict(
    a: Readonly<APIv4.Section>,
    b: Readonly<APIv4.Section>,
) {
    const byDayA = groupCardsByDay(getCards(a, 0));
    const byDayB = groupCardsByDay(getCards(b, 0));

    for (const day of Object.values(APIv4.Weekday)) {
        // quadratic, improve someday
        for (const cardA of byDayA[day])
            for (const cardB of byDayB[day]) {
                if (
                    cardA.startTime < cardB.endTime &&
                    cardB.startTime < cardA.endTime
                )
                    return true;
            }
    }

    return false;
}

export function greedyCollect<A>(
    items: readonly Readonly<A>[],
    conflict: (a: Readonly<A>, b: Readonly<A>) => boolean,
) {
    // this is quadratic; some day we might care about finding a better algorithm
    const select = new Set<A>();
    for (const current of items) {
        let currentConflict = false;
        for (const prev of select) currentConflict ||= conflict(prev, current);

        if (!currentConflict) select.add(current);
    }
    return select;
}

export function timeHull(cards: readonly Readonly<Card>[]) {
    let min = 24 * 3600;
    let max = 0;
    for (const card of cards) {
        min = Math.min(min, card.startTime);
        max = Math.max(max, card.endTime);
    }
    return { startTime: min, endTime: max };
}

export function hasWeekend(cards: readonly Readonly<Card>[]) {
    const weekend = { sunday: false, saturday: false };
    for (const card of cards) {
        weekend.sunday ||= card.day === APIv4.Weekday.sunday;
        weekend.saturday ||= card.day === APIv4.Weekday.saturday;
    }
    return weekend;
}

export function updateBounds(bounds: Bounds, section: Readonly<APIv4.Section>) {
    for (const schedule of section.schedules) {
        if (schedule.startTime === schedule.endTime) continue;
        bounds.startTime = Math.min(schedule.startTime, bounds.startTime);
        bounds.endTime = Math.max(schedule.endTime, bounds.endTime);

        for (const day of schedule.days) {
            bounds.sunday ||= day === APIv4.Weekday.sunday;
            bounds.saturday ||= day === APIv4.Weekday.saturday;
        }
    }
}

export function combineBounds(a: Readonly<Bounds>, b: Readonly<Bounds>) {
    return {
        startTime: Math.min(a.startTime, b.startTime),
        endTime: Math.max(a.endTime, b.endTime),
        sunday: a.sunday || b.sunday,
        saturday: a.saturday || b.saturday,
    } satisfies Bounds;
}

/**
 * combine the locations to one if all locations are in the same building
 */
export function combineLocations(locations: string[]): string[] {
    if (locations.length <= 1) return locations;
    const prefix = locations.map((s) => s.split(" ").slice(0, -1).join(" "));
    for (let i = 0; i < prefix.length - 1; i++) {
        if (prefix[i] !== prefix[i + 1]) return locations;
    }
    const room = locations.map((s) => s.split(" ").slice(-1)[0]!);
    return [`${prefix[0]} ${room.join(", ")}`];
}
