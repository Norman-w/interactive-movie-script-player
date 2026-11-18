# IMSEModern settings API

ASP.NET Core 10 migration of the legacy `/InteractiveMovieScriptEditor/Default.aspx` settings endpoint. The React editor remains in the repository root and is served separately; this service exposes only the settings API, health endpoint, and allowlisted media route.

The old `IMSEServer.csproj` directly referenced `DomainBase`, `ServerBase`, and `NormanFastJSON`. This API replaces the old WebForms dispatcher and request/response wrappers for the two implemented settings operations, using the .NET platform JSON APIs; it does not copy those legacy projects or DLLs. In the old `ApiProcessor`, the `session` argument was not used by either settings operation. The new API instead requires a separate service token and accepts it only in the `Authorization: Bearer ...` header; it does not accept a `session` field as a credential.

The service requires a specific local bind IP and port and rejects wildcard addresses. Use loopback when Nginx is on the same host, or the service host's VPN address when Nginx is remote. Set `IMSE_BIND`, `IMSE_PORT`, `IMSE_SETTINGS_ROOT`, `IMSE_MEDIA_ROOT`, and a random `IMSE_ACCESS_TOKEN` of at least 32 UTF-8 bytes through the protected service environment. Generate the token outside the repository; the checked-in environment example intentionally leaves it blank so the service fails closed until configured. The settings and media directories must live outside the repository. No legacy settings, movie files, credentials, or server snapshots belong in this project.

The systemd unit uses `%h` for the `enni-imse` service account's home and `%E` for the host's system configuration root. Provision that account with its home set to the configured `ENNI_APP_ROOT`, and install the application under `apps/imse/current` below that root. By default, the protected environment file is `enni/imse.env` below the system configuration root; if `ENNI_CONFIG_ROOT` differs from that location, override `EnvironmentFile` in a systemd drop-in. The checked-in settings/media roots are intentionally empty: set them to the chosen persistent data directories in the external environment file before starting the service.

`IMSE_ACCESS_TOKEN` is not shipped to the browser. A same-origin gateway must authorize the editor user before injecting it as a Bearer token when proxying the API route; do not expose the write route as an unauthenticated public endpoint. The browser uses `public/imse-config.js` to select same-origin endpoints and map only seven known tutorial video filenames to the allowlisted media route. Mapping does not depend on the previous server hostname, and unknown filenames remain unchanged.

Build with:

```sh
dotnet publish server/IMSEModern/IMSEModern.csproj -c Release -o ./publish
```

The source is a migration candidate. No IIS route, production data, gateway, or traffic was changed by adding it to this repository.
