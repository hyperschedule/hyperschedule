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

export function computeNonMuddCredits(section: APIv4.Section): number {
    // Convert from to non-mudd credits
    // https://catalog.scrippscollege.edu/content.php?catoid=33&navoid=4220#:~:text=Harvey%20Mudd%3A%20Courses%20listed%20as,Mudd%20credit%20%3D%200.0%20Scripps%20credit.

    if (section.course.primaryAssociation !== APIv4.School.HMC)
        return section.credits;

    // 3 and 4 credit courses are 1 credit, this just makes it so the one bio research course thats 6 credits is 2 credits (which I don't know if is correct, but it seems reasonable)
    if (section.credits >= 3) return Math.floor(section.credits / 3);
    if (section.credits <= 0.5) return 0;

    return section.credits / 4;
}
