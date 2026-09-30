# 🍿️ DualSubs: 🔣 Universal DeepLX

A minimal maintenance fork of `DualSubs/Universal` based on upstream `v1.7.5`.
It restores the `DeepLX()` translator vendor that exists in the project's own
historical v1.2 translator but is absent from the v1.7.5 `Translate` class.

The fork does not change subtitle interception, YouTube logic, the translator
framework, chunking, retry behavior, cache, composer, language selection, or
BoxJS schema.

## Install

Install both complete Stash subscriptions from the same release:

```text
DualSubs.YouTube.stoverride
DualSubs.Universal.stoverride
```

They are full copies of the upstream YouTube v1.5.11 and Universal v1.7.5
configurations. The only differences are their script-provider URLs, which
point to this release. No auxiliary Override, Debug provider, or Probe is
required.

In BoxJS retain the official settings:

```text
Vendor: DeepLX
Endpoint: https://deepxl.win713.co/translate
Auth: your API key
```

## DeepLX Protocol

The restored vendor follows the official historical DualSubs implementation:

```http
POST <DeepLX.Endpoint>
Accept: */*
Content-Type: application/json
Authorization: Bearer <DeepLX.Auth>
```

```json
{
  "text": "subtitle one||subtitle two",
  "source_lang": "EN",
  "target_lang": "ZH"
}
```

It accepts the classic response:

```json
{
  "code": 200,
  "data": "translation one||translation two"
}
```

## Build

```sh
npm install
npm run build:release
npm run test:deeplx
```

`build:release` verifies the SHA-256 of the official v1.7.5 Translate release
bundle before injecting the DeepLX method, then creates complete release assets
in `release-assets/`.

Upstream v1.7.5's `src/protobuf` submodule points to a repository that is no
longer publicly available. Consequently upstream's full `rspack build` cannot
currently be reproduced from public source. This fork does not stub or replace
that dependency; the documented release build starts from the official released
bundle and applies one checked patch. See [docs/BUILD.md](docs/BUILD.md).

## Provenance

- Universal baseline: `DualSubs/Universal` `v1.7.5`
  (`331292a743fcd2e03681373f747b51ab080e4ad0`)
- YouTube baseline: `DualSubs/YouTube` `v1.5.11`
  (`eef33df77dfab97dcbcb6e346a36c55a8d97e3f0`)
- DeepLX protocol source: upstream
  `archive/js/v1.2/DualSubs.Subtitles.Translate.response.beta.js`
