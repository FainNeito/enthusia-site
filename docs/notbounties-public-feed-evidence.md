# NotBounties public feed review

Requirement: the website feed must omit names hidden by NotBounties and must fail closed when the provider has no public-list API. Existing restrictions on cash contributions, item rewards and currency verification remain in force.

Review evidence: the earlier adapter used `DataManager.getAllBounties`, which includes names configured as hidden. The provider's `BountyManager.getPublicBounties` filters those names. A locally archived NotBounties 1.22.37 JAR (SHA-256 `eb1442ac783629d4840f70591ef8985335001be2c403d996d883fb87f83aff15`) exposes that method and the other reflected getters. The archive's size matches the server plugin inventory, but the running binary's hash and loaded state have not been verified.

An archived SMP configuration from 2026-10-08 selected Vault rather than overriding it, and disabled item bounties. This is historical evidence, not proof of the current settings or that the active Vault provider's unit is raw gold. Verify the live NotBounties currency configuration and Vault provider before enabling `RAW_GOLD`.

The focused bridge regressions passed on the Paper 26.2 profile: six tests cover public method selection, failure when it is missing, projection restrictions, and the authenticated listener. Runtime integration, currency, Cloudflare worker permissions and production activation remain separate checks. Project-local SPEAR and EARS tools were not found in this checkout; this record captures the requirement and verification boundary.
