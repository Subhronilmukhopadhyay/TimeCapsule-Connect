# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-08-17

> **Upgrading requires a database migration.** The password login and
> registration endpoints now read the `google_id` column, so they will fail
> against an unmigrated database. Run this from `server/` **before** deploying —
> the migration only adds columns, so the previous release keeps working against
> a migrated database:
>
> ```bash
> npm run migrate
> ```
>
> Google sign-in additionally needs `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
> `GOOGLE_REDIRECT_URI`, `SERVER_URL` and `CLIENT_URL` in `server/.env` — see
> [`server/.env.example`](server/.env.example). Without them the rest of the app
> is unaffected; the Google button just reports that it is not configured.

### Added

- **Google sign-in**, with automatic account merging. Signing in with Google
  using an email that already has a password account links the two instead of
  creating a duplicate, so existing capsules stay accessible from either method.
  Merging is case-insensitive on email and only accepts Google-verified
  addresses, so an unverified address cannot claim an existing account.
- Google sign-up button on the registration page.
- Editor: drag-and-drop and paste-to-insert for media, image/video/audio/file
  captions, per-block text alignment, code blocks, horizontal rules, and a live
  word and character count in a status bar.
- Editor: markdown shortcuts — `# ` for headings, `- ` and `1. ` for lists,
  `> ` for quotes — plus hotkeys for headings, lists, alignment and links.
- Landing page: FAQ and closing call-to-action sections, a mobile navigation
  menu, and a multi-column footer.
- Test suites for the editor (`npm test` in `Client/`) and for the Google
  account-merge logic (`npm test` in `server/`).
- `npm run migrate` in `server/`, which applies `db/migrations/*.sql` through the
  `pg` driver — no local `psql` install required.
- `server/.env.example` documenting every environment variable.

### Changed

- Media resizing rebuilt: dragging now previews locally and commits once on
  release, so a resize is a single undo step instead of one per mouse movement.
  Width is stored as a percentage of the writing column rather than pixels, so a
  capsule opened years later on a different screen keeps its composed layout.
  Height follows the natural aspect ratio, so media can no longer be squashed.
- Media size, alignment and captions are now honoured in the preview modal and
  on the read-only capsule view, not just while editing.
- Landing page rebuilt with all artwork drawn in CSS and inline SVG.
- Session cookies are issued through a single shared helper across register,
  login, logout and Google sign-in.
- `Client/src/services/editor-utils.jsx` renamed to `.js` (it contained no JSX).
  Imports are extensionless and unaffected.

### Fixed

- **Map: replaced the deprecated `google.maps.places.Autocomplete`** (deprecated
  1 March 2025) with `PlaceAutocompleteElement`, removing the deprecation
  warning.
- Map: the Google Maps API key was being passed as the map's `mapId`, which
  prevented `AdvancedMarkerElement` from rendering. Now uses `VITE_MAP_ID`.
- Map: local map styles were being sent alongside a `mapId`, where they are
  ignored with a console warning.
- Locking a capsule that had never been saved always failed — the lock modal
  called a `createCapsule` function that does not exist on the editor context.
- Locking a capsule redirected to `/my-capsules`, which does not exist; the
  route is `/dashboard/my-capsules`.
- **Editor: media blocks were not declared void**, so Slate treated images and
  video as editable text. This is what made the caret snag on media, deleting
  behave unpredictably, and typing next to media corrupt the document.
- Editor: a media block at the very start or end of a capsule left no way to
  type above or below it.
- Editor: block formatting was applied to text nodes rather than blocks, so
  headings, quotes and alignment silently failed to apply.
- Editor: list shortcuts were normalized away before the list could be wrapped,
  so `- ` and `1. ` produced a plain paragraph.
- Editor: block formatting applied across a selection containing media
  corrupted the media node.
- Editor: the toolbar's Insert Link, Insert Image and Insert Video buttons had
  no click handlers and did nothing.
- Landing page: every image referenced a `/images/` path that does not exist in
  the repository, so the hero rendered white text on a blank background and all
  feature icons were broken.
- Registration and login now match email case-insensitively, preventing
  `Ada@example.com` and `ada@example.com` from becoming two accounts.
- Login no longer returns the password hash in its response body.
- Logout now clears the session cookie with attributes matching how it was set.
- Registration set a session cookie with `SameSite=None` without `Secure` in
  development, which browsers reject.
- Attempting a password login on a Google-only account no longer errors
  opaquely; it explains to use Google sign-in.
- Removed a duplicate `loadViewCapsule` in `pages/viewCapsule.jsx` that
  referenced `api` without importing it and would have thrown if called.

### Compatibility

- Media in capsules saved before this release stored width as raw CSS. Those
  values are still read correctly, so existing capsules render as they were
  composed. No data migration is needed for capsule content.
- The server requires **Node 18–22**. On Node 24 and later, `jsonwebtoken`
  fails to load because its transitive `buffer-equal-constant-time` dependency
  uses `SlowBuffer`, which Node removed. This is pre-existing and unrelated to
  the changes in this release; it is now recorded in `engines`.

## [1.1.0] - 2025-08-19

Google Drive upload fixes and production hardening. See the git history between
`v1.0.0` and `v1.1.0` for detail.

## [1.0.0] - 2025-07-19

First stable release.

## [0.2.0-beta] - 2025-06-10

Beta release.

## [0.1.0-alpha] - 2025-05-02

Initial alpha.

[1.2.0]: https://github.com/Subhronilmukhopadhyay/TimeCapsule-Connect/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Subhronilmukhopadhyay/TimeCapsule-Connect/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Subhronilmukhopadhyay/TimeCapsule-Connect/compare/v0.2.0-beta...v1.0.0
[0.2.0-beta]: https://github.com/Subhronilmukhopadhyay/TimeCapsule-Connect/compare/v0.1.0-alpha...v0.2.0-beta
[0.1.0-alpha]: https://github.com/Subhronilmukhopadhyay/TimeCapsule-Connect/releases/tag/v0.1.0-alpha
