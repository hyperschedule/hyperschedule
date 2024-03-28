// this file is mostly declarative so probably best placed here instead of being buried in @lib

import type { Announcement } from "@lib/announcements";

// to generate id for new announcements, run `date +%s` in bash or go to https://www.epochconverter.com/ and copy the value
// this ensures all future announcements will never have the same ID, even though we don't really care about when
// an announcement is created
export const announcements: Announcement[] = [
    {
        id: 1710969267,
        message: (
            <>
                The previous version of Hyperschedule has been moved to{" "}
                <a href="https://legacy.hyperschedule.io">
                    legacy.hyperschedule.io
                </a>{" "}
                for historical purposes. It will no longer be maintained.
            </>
        ),
        // one day after add deadline for fall 2024
        expires: new Date(2024, 8, 10, 0, 0, 0),
    },
    {
        id: 1711657525,
        message: (
            <>
                Hyperschedule is now licensed under the{" "}
                <a href="https://spdx.org/licenses/BSD-3-Clause-No-Military-License.html">
                    BSD 3-Clause No Military
                </a>{" "}
                License . By continuing using this program, you acknowledge that
                you are not involved in the design, construction, operation,
                maintenance, or training of any military facility.
            </>
        ),
        expires: null,
    },
];

if (window.location.host === "nightly.hyperschedule.io")
    announcements.push({
        id: 1710902690,
        message:
            "You are currently on nightly build, which is likely unstable and contains untested features",
        expires: null,
    });
