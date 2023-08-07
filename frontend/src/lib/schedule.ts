import * as APIv4 from "hyperschedule-shared/api/v4";

export type Card = {
    section: APIv4.SectionIdentifier;
    day: APIv4.Weekday;
    startTime: number;
    endTime: number;
};

export function cardKey(card: Readonly<Card>) {
    return `${APIv4.stringifySectionCodeLong(card.section)}:${card.day}/${
        card.startTime
    }-${card.endTime}`;
}

export function getCards(section: APIv4.Section) {
    const cards: Card[] = [];
    for (const schedule of section.schedules) {
        if (schedule.startTime === schedule.endTime) continue;

        for (const day of schedule.days)
            cards.push({
                day,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                section: section.identifier,
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
    cards.sort((a, b) => a.endTime - b.endTime || a.startTime - b.startTime);

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

    cards.sort((a, b) => a.startTime - b.startTime || a.endTime - b.endTime);

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

export function hasWeekend(cards: readonly Readonly<Card>[]) {
    const weekend = { sunday: false, saturday: false };
    for (const card of cards) {
        weekend.sunday ||= card.day === APIv4.Weekday.sunday;
        weekend.saturday ||= card.day === APIv4.Weekday.saturday;
    }
    return weekend;
}
