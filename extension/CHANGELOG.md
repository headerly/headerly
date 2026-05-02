# Changelog

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
