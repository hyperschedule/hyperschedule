import { School } from "hyperschedule-shared/api/v4";

const HMC_TO_NON_HMC_OVERRIDES: Record<string, number> = {};

const NON_HMC_TO_HMC_OVERRIDES: Record<string, number> = {
    "MUS 033 PO-01 FA2026": 1,
    "MUS 033 PO-01 SP2026": 1,
    "MUS 033 PO-01 FA2025": 1,
    "MUS 033 PO-01 SP2025": 1,
    "MUS 033 PO-01 FA2024": 1,
    "MUS 033 PO-01 SP2024": 1,
    "MUS 033 PO-01 FA2023": 1,
    "MUS 033 PO-01 SP2023": 1,
    "MUS 033 PO-01 FA2022": 1,
    "MUS 033 PO-01 SP2022": 1,
    "MUS 033 PO-01 FA2021": 1,
    "MUS 033 PO-01 SP2021": 1,
    "MUS 033 PO-01 FA2020": 1,
    "MUS 033 PO-01 SP2020": 1,
    "MUS 033 PO-01 FA2019": 1,
    "MUS 033 PO-01 SP2019": 1,
    "MUS 033 PO-01 FA2018": 1,
    "MUS 033 PO-01 SP2018": 1,
    "MUS 033 PO-01 FA2017": 1,
    "MUS 033 PO-01 SP2017": 1,
    "MUS 033 PO-01 FA2016": 1,
    "MUS 033 PO-01 SP2016": 1,
    "MUS 033 PO-01 SP2015": 1,
    "MUS 033 PO-01 FA2015": 1,
};

export function convertToHMCCredits(
    credits: number,
    primaryAssociation: School,
    sectionIdentifierString: string,
): number {
    if (primaryAssociation === School.HMC) return credits;

    const overrideCredits = NON_HMC_TO_HMC_OVERRIDES[sectionIdentifierString];
    if (overrideCredits !== undefined) {
        return overrideCredits;
    }

    if (credits === 0.25) return 1;
    return credits * 3;
}

// https://catalog.scrippscollege.edu/content.php?catoid=33&navoid=4220#:~:text=Harvey%20Mudd%3A%20Courses%20listed%20as,Mudd%20credit%20%3D%200.0%20Scripps%20credit.
const HMC_TO_NON_HMC_CREDITS: Record<number, number> = {
    4: 1,
    3: 1,
    2: 0.5,
    1.5: 0.5,
    1: 0.25,
    0.5: 0,
};

export function convertToNonHMCCredits(
    credits: number,
    primaryAssociation: School,
    sectionIdentifierString: string,
): number {
    if (primaryAssociation !== School.HMC) return credits;

    const overrideCredits = HMC_TO_NON_HMC_OVERRIDES[sectionIdentifierString];
    if (overrideCredits !== undefined) {
        return overrideCredits;
    }

    const nonMuddCredits = HMC_TO_NON_HMC_CREDITS[credits];

    return nonMuddCredits ?? credits / 3;
}
