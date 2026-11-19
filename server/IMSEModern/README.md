# IMSE settings service candidate

This .NET 10 service reimplements the two file-backed APIs from the legacy
InteractiveMovieScriptEditor application:

- setting.save accepts method, settingname, and settingjson.
- setting.load accepts method and settingname.
- The request envelope is a JSON object for POST, or query fields for GET.
- Responses keep the legacy PascalCase fields (Success, SettingJson, ErrCode,
  ErrMsg, SubErrCode, SubErrMsg, and IsError).

The old application accepted anonymous requests in its effective IIS
configuration and concatenated settingname into a filesystem path. This
candidate requires a configured 32-byte-or-longer access token, accepts it as
a Bearer token or the legacy session field on POST, restricts names to a safe
single path segment, and performs atomic file replacement. GET callers must
send a Bearer header; credentials in URLs are rejected. The token is not
configured in the staging environment. Until an approved token and caller
behavior are known, requests return 503 and the API is not exposed through
Nginx.

The service supports the old application path
/InteractiveMovieScriptEditor/Default.aspx and a root-relative /Default.aspx
path. It stores settings under IMSE_SETTINGS_ROOT; it does not read the old
snapshot's Settings directory automatically.

On 2026-10-08, the three legacy snapshot files `movieResources.json`,
`scripts.json`, and `test.json` were copied into the configured staging
directory `/var/lib/enni-imse/Settings`. SHA-256 matched each source file;
the source snapshot remains unchanged. The directory is owned by `enni-imse`
with mode 0750 and files use mode 0640. Their raw URL-encoded bytes were also
copied back to this workspace and verified against the staging hashes.

The service now serves an exploratory script-map UI at `/` on loopback port
31010. It starts from the seven existing storylines and 29 snippets; users can
open any scene, follow recovered jump references, switch paths, go back, edit
scene labels and clip times, keep a browser-local draft, and export the legacy
URL-encoded setting format. Existing script jumps appear as trails on the map;
at each scene, users can follow the recorded jump or pick another scene freely.
The seven referenced MP4s were copied from the preserved IIS snapshot into
`/var/lib/enni-imse/Movies` and hash-checked. An allowlisted `/media/{id}` route
serves them with byte-range support; the browser loads a clip only after the
user opens it, starts at the scene's saved time, and pauses at its end time.
The UI still writes edits only to browser storage or an exported file. The
settings API reports `configured=false` because no access token is installed,
and no Nginx route exposes the editor.

The full candidate source tree is mirrored on the staging host; code, UI and
published seed assets are recorded in `SHA256SUMS`. The active staging unit is
`enni-imse-staging.service`, bound only to `127.0.0.1:31010`.

## Legacy UI and editor scope

The captured legacy application contains the `setting.save` and `setting.load`
API handlers plus three settings files, but its `Default.aspx` only dispatches
API requests. No editor page or caller reference was found in the captured
source tree; this does not rule out an external client that was not captured.
The URL-decoded `scripts.json` contains seven named flows and 29 snippets, with
redirect/transition references in 13 snippets. This is enough to establish
that the data models branching scripts, but not enough to reconstruct the old
editor's exact behavior.

The replacement UI follows
[`MIGRATION_INTERACTION_DESIGN.md`](../../MIGRATION_INTERACTION_DESIGN.md):
the map is directly explorable, a small number of choices are shown as cards,
and navigation is reversible instead of a fixed wizard. The current
implementation is a loopback-only review build; details and limits are in
[`IMSE_EDITOR_REBUILD.md`](../../IMSE_EDITOR_REBUILD.md). The UI does not call
the legacy `setting.save` API; edits remain in browser storage until explicitly
exported.

The video payload manifest is in `legacy-data/movies/SHA256SUMS`; the full MP4
files remain in the retained IIS snapshot and on the staging VM, rather than
being duplicated into this source tree.

## Configuration

See ops/imse.env.example and ops/imse.service.example. Bind to loopback. Keep
the access token in a root-owned environment file with mode 0600. When the
service is later connected to a gateway, disable or redact access logging for
this API path because older callers may carry session in the request.

## Legacy source notes

legacy-contract/ contains the small set of source files copied from the old
server for protocol review. It is reference material, not a buildable legacy
project. The deployed DLLs and the sibling DomainBase source are not proven to
be from the same revision; the legacy SaveSettingRequest source does not
implement the abstract GetIsSessionRequired method found in the sibling
source. The request envelope and response serialization were confirmed from
the deployed HttpContextProcessor.cs, but the exact deployed request-class
session policy still needs binary/client confirmation.
