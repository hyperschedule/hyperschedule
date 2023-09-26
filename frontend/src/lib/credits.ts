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
