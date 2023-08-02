/**
 * This file defines the service provider attributes necessary for integrating with CAS. However, no change here
 * will take any effect unless a matching metadata is uploaded to the TCCS server. To generate
 * a new metadata, append `sp.exportMetadata("metadata.xml")`, run this file, and email the output to TCCS contact.
 */

import * as samlify from "samlify";
import { loadDataFile } from "hyperschedule-data";
/* The source code of this package has been manually reviewed, even though it has no readme and no star on GitHub
 *  Version: 2.0.0
 *  Date: March 10, 2023
 *  Reviewed by: Mia Celeste
 */
import { validate as xmlValidator } from "@authenio/samlify-node-xmllint";

samlify.setSchemaValidator({
    validate: xmlValidator,
});

export const idp = samlify.IdentityProvider({
    // this file is downloaded from https://webauth.claremont.edu/idp/shibboleth
    metadata: await loadDataFile("saml", "identity-provider.xml"),
});
export const sp = samlify.ServiceProvider({
    wantAssertionsSigned: true,
    entityID: "https://hyperschedule.io/",
    nameIDFormat: ["urn:oasis:names:tc:SAML:1.1:nameid-format:persistent"],
    assertionConsumerService: [
        {
            Binding: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",
            Location: "https://dragonfruit.hyperschedule.io/auth/saml",
        },
    ],
});
