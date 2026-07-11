# Changelog

## [1.12.0](https://github.com/headerly/headerly/compare/v1.11.0...v1.12.0) (2026-07-11)


### Features

* **popup:** add a version number to the selected profile background ([f53d494](https://github.com/headerly/headerly/commit/f53d4943786fc097c71af25633b6cd1ba0bb4082))
* **popup:** add searchable batch profile management ([#57](https://github.com/headerly/headerly/issues/57)) ([88ed274](https://github.com/headerly/headerly/commit/88ed2740ea2b01daa74853d17425127a9451489e))
* **popup:** make group fieldset legend sticky ([63038e4](https://github.com/headerly/headerly/commit/63038e4d66f7bcd197a80e1e54888fc052ff9f57))
* **popup:** move delete action into dropdown to prevent misclicks ([b825f02](https://github.com/headerly/headerly/commit/b825f02dbd7bfb566e778154077022fa98690593))
* **popup:** prefill new profile conditions with current tab domain ([50ca2e9](https://github.com/headerly/headerly/commit/50ca2e971c7ae19730912cd6666bc3bfdca96be9))
* **profiles:** explain why actions and conditions cannot be added ([8199671](https://github.com/headerly/headerly/commit/8199671dde19f9d0e645ff55d65311d05453909f))
* supports topDomains and excludedTopDomains conditions ([5146dd3](https://github.com/headerly/headerly/commit/5146dd3cbaf41366d9c978e082bb44c4febab76a))


### Bug Fixes

* **DNR:** an error occurred upon creating a profile of type allowAllRequest ([74a34f5](https://github.com/headerly/headerly/commit/74a34f5dbbd907a7a0f16cbb0dacb51b3cf015e4))
* dropdown was not closed when clicking the secondary menu ([1ba4e5b](https://github.com/headerly/headerly/commit/1ba4e5b45eef9429ea55220ec3d5a8e02d543580))
* **popup:** add current tab domain filter after rule type changes ([59b39be](https://github.com/headerly/headerly/commit/59b39be98819b8b10bbe192c88a7d258c75d62a3))
* **popup:** correct regex filter placeholder ([b6197a9](https://github.com/headerly/headerly/commit/b6197a9cec879260b8c509eabcc4a2b00c09fe00))
* selected profile fieldset legend sticky style is not working ([c220754](https://github.com/headerly/headerly/commit/c2207547cb8e5026a91093e51fbea8ea1d12450e))

## [1.11.0](https://github.com/headerly/headerly/compare/v1.10.0...v1.11.0) (2026-07-10)


### Features

* extract domains from condition URL inputs ([7edf5f8](https://github.com/headerly/headerly/commit/7edf5f82857c30c0b8d2dbd9498486783be471f5))
* highlight popular request domains condition ([b8de448](https://github.com/headerly/headerly/commit/b8de44899f5a1da424b66b6503486b3fb4bc6045))
* match current tab URL filters by origin ([2ab4ba7](https://github.com/headerly/headerly/commit/2ab4ba7e84c9d718225d5d7e8bb36b33bcff4cbc))
* shift-click a profile to pause or resume it ([4273a0a](https://github.com/headerly/headerly/commit/4273a0ad71b6b65c3f7c9fdb632dde09b636b732))


### Bug Fixes

* popup pages are unavailable in Vivaldi browser ([9d7b30b](https://github.com/headerly/headerly/commit/9d7b30b0274d826cfd5d59cb7fad4fc72f0d58ab))
* some text in the tooltip is not displayed in the light theme ([1f059d2](https://github.com/headerly/headerly/commit/1f059d25a48c01a93ab3bc596342605c802608cf))

## [1.10.0](https://github.com/headerly/headerly/compare/v1.9.0...v1.10.0) (2026-07-05)


### Features

* support importing and exporting profile data via links ([#49](https://github.com/headerly/headerly/issues/49)) ([f28b5c6](https://github.com/headerly/headerly/commit/f28b5c6f5634c9b5443a454377b9a351692e7468))

## [1.9.0](https://github.com/headerly/headerly/compare/v1.8.0...v1.9.0) (2026-07-05)


### Features

* add a link to the documentation site ([34361db](https://github.com/headerly/headerly/commit/34361db0f6881cc66b2e5a53ef27637ff63f7eea))
* remove auto emoji assignment setting ([e9e8225](https://github.com/headerly/headerly/commit/e9e82256bfbb509d63b34c71c146b77cdba024de))


### Bug Fixes

* close main dropdown when opening sub actions and search ([cf2e5f3](https://github.com/headerly/headerly/commit/cf2e5f3e0881c121931776282a57219cb880bdd7))
* **cookie:** prevent exported profiles from carrying sync cookie values ([a3dd7b3](https://github.com/headerly/headerly/commit/a3dd7b3d1d123e5fcfe7bd588f60f593a3007326))
* **cookie:** refresh sync cookies when importing duplicate identities ([061cbc5](https://github.com/headerly/headerly/commit/061cbc5d3da67e1f13a5851e7ad4b27fd9e07c9e))

## [1.8.0](https://github.com/headerly/headerly/compare/v1.7.0...v1.8.0) (2026-06-28)


### Features

* automatically update the Sync Cookie value when the cookie is updated ([#47](https://github.com/headerly/headerly/issues/47)) ([f8adf34](https://github.com/headerly/headerly/commit/f8adf3477612a107fe7503029cea213cd2759b46))
* **profile:** replace middle-click delete with pause/resume toggle ([88984e5](https://github.com/headerly/headerly/commit/88984e5563c387833a353456aebe94a17d63ff81))

## [1.7.0](https://github.com/headerly/headerly/compare/v1.6.0...v1.7.0) (2026-06-08)


### Features

* persist group collapsed state ([f535f46](https://github.com/headerly/headerly/commit/f535f46eee37b77bfce61150931959273fe78411))


### Bug Fixes

* settings page did not update the language when switching languages ([d13e2ab](https://github.com/headerly/headerly/commit/d13e2ab443fb2da369734e2763848ebbdb2c7998))

## [1.6.0](https://github.com/headerly/headerly/compare/v1.5.1...v1.6.0) (2026-06-07)


### Features

* **i18n:** UI supporting Simplified Chinese ([#41](https://github.com/headerly/headerly/issues/41)) ([7ed9fec](https://github.com/headerly/headerly/commit/7ed9fec08926a5f211b0294af89b47d67db0381c))
* supports collapsing/expanding groups ([980b739](https://github.com/headerly/headerly/commit/980b739b8878ac8f9e5e8e2fe71ec984e4594151))

## [1.5.1](https://github.com/headerly/headerly/compare/v1.5.0...v1.5.1) (2026-05-31)


### Bug Fixes

* header name input field for the remove operation only occupies 50% of the width ([400bb93](https://github.com/headerly/headerly/commit/400bb938b32bf5089ea962ca36bf208f89c4fa50))

## [1.5.0](https://github.com/headerly/headerly/compare/v1.4.0...v1.5.0) (2026-05-24)


### Features

* adjust the size of the json editor replace/search toggle ([9c5d165](https://github.com/headerly/headerly/commit/9c5d165d1c494980617049ec8c7446418f9ddc5c))


### Bug Fixes

* button is not disabled and can still be clicked ([d9cbd4e](https://github.com/headerly/headerly/commit/d9cbd4ede90c435947188eaa0a6eda1aadceb9b2))

## [1.4.0](https://github.com/headerly/headerly/compare/v1.3.0...v1.4.0) (2026-05-10)


### Features

* by default, sync cookies group data is not exported ([#27](https://github.com/headerly/headerly/issues/27)) ([59488b6](https://github.com/headerly/headerly/commit/59488b626f6bf41c9dd53e7a35c01b607ca046fe))
* reorganize profile menu and add changelog link ([6bd6afa](https://github.com/headerly/headerly/commit/6bd6afa2707cd165119ba5ebce39e4ffec3b963d))
* support for search/replace functions in the JSON editor ([#29](https://github.com/headerly/headerly/issues/29)) ([4063213](https://github.com/headerly/headerly/commit/40632137a5bfc78fb079de1414b0ec634d3dd453))


### Bug Fixes

* raise export settings dropdown above search panel ([b94837b](https://github.com/headerly/headerly/commit/b94837bf9e1ecb1435faf768866712304024eb8a))

## [1.3.0](https://github.com/headerly/headerly/compare/v1.2.0...v1.3.0) (2026-05-03)


### Features

* add version field to profile import/export JSON schema ([#25](https://github.com/headerly/headerly/issues/25)) ([ca32e86](https://github.com/headerly/headerly/commit/ca32e86c104ba121b31c44b25c4e136a74b0442b))

## [1.2.0](https://github.com/headerly/headerly/compare/v1.1.0...v1.2.0) (2026-05-02)


### Features

* add a tooltip description for the quick create feature ([106f22f](https://github.com/headerly/headerly/commit/106f22f78460b4e9d74be15ae9abbe86a96f613d))
* add drag-and-drop sorting to actions and conditions in modal ([#18](https://github.com/headerly/headerly/issues/18)) ([eaa2bbd](https://github.com/headerly/headerly/commit/eaa2bbd0353e601f7dfbfd6c8ccff6ced463c313))
* add simple redirect URL rule support ([#24](https://github.com/headerly/headerly/issues/24)) ([9d0e551](https://github.com/headerly/headerly/commit/9d0e551aa1e633547f89582eec79e30fc2bae295))
* supports "block", "allow", "upgrade schema", and "allow all requests" functions ([#17](https://github.com/headerly/headerly/issues/17)) ([62155ca](https://github.com/headerly/headerly/commit/62155ca7569bed0ffe23d1320bd0026d91079ce7))


### Bug Fixes

* **a11y:** add button semantics and pointer cursor to add action/condition modal ([1d927dd](https://github.com/headerly/headerly/commit/1d927dd296f4d0a15e4e77fd82750e4a2a92c34c))
* always exclude the extension itself from its own rules to prevent lockout ([48df6d1](https://github.com/headerly/headerly/commit/48df6d1d110518da551cc88e539e08c64f42da62))
* **cookie:** trim domain input when URL parsing fails ([c20ff58](https://github.com/headerly/headerly/commit/c20ff5816d10993b7212fd20d401b84388a01a4e))
* hide badge tooltip content on medium screens for better responsiveness ([40a4d7c](https://github.com/headerly/headerly/commit/40a4d7caf95c638616488161291046c4ee1aa76c))
* **import:** request cookies permission when importing profiles with cookie sync groups ([ec7b183](https://github.com/headerly/headerly/commit/ec7b18382cf960174e7ea9c8d79d098459797792))
* prevent failure prompt for rules without request or response headers ([9396f3c](https://github.com/headerly/headerly/commit/9396f3c03965c709eaf454b04a3bc728c8013b6b))
* unable to register modifyHeaders profile ([3fbc40d](https://github.com/headerly/headerly/commit/3fbc40d2298bdde85ac2da849e4b05ece46a8b25))

## [1.1.0](https://github.com/headerly/headerly/compare/v1.0.0...v1.1.0) (2026-04-15)


### Features

* adapt to mobile screens ([#16](https://github.com/headerly/headerly/issues/16)) ([eb1c7b4](https://github.com/headerly/headerly/commit/eb1c7b42389999452a8c2edabc14f66f87462ea9))
* supports expanding to the full tab ([#13](https://github.com/headerly/headerly/issues/13)) ([3f9f9b1](https://github.com/headerly/headerly/commit/3f9f9b1a2ff8382b61ebd71f560b4cd2979f6a65))


### Bug Fixes

* mobile adaptation disrupted the layout of some filters ([ab56821](https://github.com/headerly/headerly/commit/ab56821d4b8f7516489f4ccbf1802eb6359bac04))
* quickly closing the popup after modifying the profile will cause the changes to be lost ([ad5e52f](https://github.com/headerly/headerly/commit/ad5e52f4c04dffec03ad98505f9f4f9d066d9adf))
* request header name field is not trimmed ([13abba5](https://github.com/headerly/headerly/commit/13abba574aaf4369e11cc449108af8a7770415c0))
