import * as APIv4 from "hyperschedule-shared/api/v4";

export function computeMuddCredits(section: APIv4.Section): number {
    if (
        section.course.primaryAssociation === APIv4.School.HMC ||
        section.credits >= 3
    )
        return section.credits;
    if (section.credits === 0.25) return 1;
    return section.credits * 3;
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

export function computeNonMuddCredits(section: APIv4.Section): number {
    if (section.course.primaryAssociation !== APIv4.School.HMC)
        return section.credits;

    const nonMuddCredits = HMC_TO_NON_HMC_CREDITS[section.credits];

    return nonMuddCredits ?? section.credits / 3;
}
