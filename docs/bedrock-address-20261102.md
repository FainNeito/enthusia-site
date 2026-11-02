# Bedrock connection address

Requirement: show `bedrock.enthusia.net` in the site's Bedrock and console connection instructions. Keep the supplied Java address and existing port `19132`. The homepage copy button must copy the address for the selected edition; console copy must use the Bedrock address. The wiki demo and separately published wiki renderer are handled in a separate change because their external parser validation is unavailable.

Verification: the connection tests exercise both copy modes and the displayed join instructions. The full site test suite, static reference validation, and site build pass. The site has no project-local EARS/state helpers. A browser rendering check and a real Bedrock connection are separate from these checks.
