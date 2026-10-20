# IMSEModern settings API

ASP.NET Core 10 migration of the legacy `/InteractiveMovieScriptEditor/Default.aspx` settings endpoint. The React editor remains in the repository root and is served separately; this service exposes only the settings API, health endpoint, and allowlisted media route.

The service binds to a configured loopback address only. Set `IMSE_BIND`, `IMSE_PORT`, `IMSE_SETTINGS_ROOT`, `IMSE_MEDIA_ROOT`, and a random `IMSE_ACCESS_TOKEN` of at least 32 UTF-8 bytes through the protected service environment. The settings and media directories must live outside the repository. No legacy settings, movie files, credentials, or server snapshots belong in this project. The API accepts credentials only in the `Authorization: Bearer ...` header; it does not accept a `session` field as a credential.

`IMSE_ACCESS_TOKEN` is not shipped to the browser. A same-origin gateway must inject it as a Bearer token when proxying the API route. The browser uses `public/imse-config.js` to select the same-origin endpoint; deployments may replace that file with the correct path, without putting credentials in it.

Build with:

```sh
dotnet publish server/IMSEModern/IMSEModern.csproj -c Release -o ./publish
```

The source is a migration candidate. No IIS route, production data, gateway, or traffic was changed by adding it to this repository.
