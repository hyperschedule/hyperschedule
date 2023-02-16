/**
 * This file is designed to correct the corrupted bytes coming out of portal due to double utf-8 encoding.
 *
 * For example, in the raw data, a backward quote ’ (U+2019 Right Single Quotation Mark) is encoded as
 * "\xc3\xa2\xc2\x80\xc2\x99" (found in the course description of ENGL 073 PZ-01 SP2023). This looks like complete
 * junk data at first glance, and indeed, no browser can render it correctly. However, if you decode this byte sequence
 * using UTF-8, you get "â\x80\x99". However, if you read the code point for â unicode, it's U+00E2. If you look at the
 * character in ISO-8859-1, aka latin-1 encoding, you found that it's encoded as \xe2 (the entire latin-1 alphabet is
 * the same as the first 255 characters in unicode). In this way, "â\x80\x99" can also be represented
 * as "\xe2\x80\99". Interestingly, "\xe2\x80\99" can be decoded to ’ using utf-8, which is exactly the character we are
 * looking for.
 *
 * Similarly, the same character ’ encoded as "\xc2\x92" in the source data. If we decode this with utf-8, we
 * get "\x92". Now if we decode "\x92" with windows-1252, we can get the quote back.
 */

// this module is written in C, will crash node interpreter if ran without argument
import validateUtf8 from "utf-8-validate";
import iconv from "iconv-lite";

import { createLogger } from "../logger";

const logger = createLogger("parser.hmc.encoding");

export function fixEncoding(s: string): string {
    for (const char of s)
        if (char.length > 1) {
            logger.info(
                `Multi-byte sequence (${char}) found, assuming correct encoding`,
            );
            return s;
        }
    const b = Buffer.from(s, "latin1");
    if (validateUtf8(b)) return b.toString("utf-8");
    return iconv.decode(b, "windows-1252");
}
