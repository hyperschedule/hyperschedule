/**
 * Sometimes we receive future data from the school. To make it fair for everyone,
 * we use this value to govern what the current term is, and pretend everything
 * beyond this to never have existed. This value is updated by hand by the current
 * maintainer when an email is sent from the registrar to all HMC students
 * (Mudd portal is the last portal to release all course data), titled something like
 * "Spring 2023 course schedule is live on the portal". Can we automate this? Probably,
 * but the harm of getting it wrong significantly outweighs the few minutes it saves
 * and whatever delay it causes. Without data being live on portal, there's no way
 * for a student to double-check the data from hyperschedule if necessary and, in
 * case of the data being inaccurate (which is almost always the case, to some extent),
 * hyperscheule users may plan something that can't possibly be registered and giving
 * false hope.
 */
import { stringifyTermIdentifier, Term } from "hyperschedule-shared/api/v4";

export const CURRENT_TERM = stringifyTermIdentifier({
    year: 2023,
    term: Term.spring,
});
