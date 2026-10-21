using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

const int maxRequestBytes = 16 * 1024 * 1024;

var bindText = Environment.GetEnvironmentVariable("IMSE_BIND");
if (string.IsNullOrWhiteSpace(bindText))
    throw new InvalidOperationException("IMSE_BIND must be set in the service environment.");
if (!System.Net.IPAddress.TryParse(bindText, out var bindAddress) ||
    bindAddress.Equals(System.Net.IPAddress.Any) ||
    bindAddress.Equals(System.Net.IPAddress.IPv6Any))
    throw new InvalidOperationException("IMSE_BIND must be a specific local IP address, not a wildcard.");

var portText = Environment.GetEnvironmentVariable("IMSE_PORT");
if (!int.TryParse(portText, out var port))
    throw new InvalidOperationException("IMSE_PORT must be set in the service environment.");
if (port is < 1 or > 65535)
    throw new InvalidOperationException("IMSE_PORT is outside the valid range.");

var configuredToken = Environment.GetEnvironmentVariable("IMSE_ACCESS_TOKEN");
if (string.IsNullOrEmpty(configuredToken))
    throw new InvalidOperationException("IMSE_ACCESS_TOKEN must be set in the service environment.");
if (Encoding.UTF8.GetByteCount(configuredToken) < 32)
    throw new InvalidOperationException("IMSE_ACCESS_TOKEN must contain at least 32 UTF-8 bytes.");

var settingsRootText = Environment.GetEnvironmentVariable("IMSE_SETTINGS_ROOT");
if (string.IsNullOrWhiteSpace(settingsRootText))
    throw new InvalidOperationException("IMSE_SETTINGS_ROOT must be set in the service environment.");
var settingsRoot = Path.GetFullPath(settingsRootText);
Directory.CreateDirectory(settingsRoot);
var mediaRootText = Environment.GetEnvironmentVariable("IMSE_MEDIA_ROOT");
if (string.IsNullOrWhiteSpace(mediaRootText))
    throw new InvalidOperationException("IMSE_MEDIA_ROOT must be set in the service environment.");
var mediaRoot = Path.GetFullPath(mediaRootText);
Directory.CreateDirectory(mediaRoot);

var mediaFiles = new Dictionary<string, string>(StringComparer.Ordinal)
{
    ["initMovieSet1"] = "1.introduce.mp4",
    ["initMovieSet2"] = "2.setSenderMobile.mp4",
    ["initMovieSet3"] = "feedback.right.mp4",
    ["initMovieSet4"] = "3.selectPrintMode.mp4",
    ["initMovieSet5"] = "4.moreThan5How.mp4",
    ["initMovieSet6"] = "5.devicePrepare.mp4",
    ["initMovieSet7"] = "6.autoPrintRule.mp4"
};

var settingsLocks = new ConcurrentDictionary<string, SemaphoreSlim>(StringComparer.OrdinalIgnoreCase);
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls(new UriBuilder(Uri.UriSchemeHttp, bindAddress.ToString(), port).Uri.AbsoluteUri);
builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = maxRequestBytes);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Warning);

var app = builder.Build();

app.MapGet("/media/{resourceId}", (string resourceId) =>
{
    if (!mediaFiles.TryGetValue(resourceId, out var fileName))
        return (IResult)Results.NotFound();

    var path = Path.Combine(mediaRoot, fileName);
    if (!File.Exists(path))
        return (IResult)Results.NotFound();

    return (IResult)Results.File(path, "video/mp4", enableRangeProcessing: true);
});

app.MapGet("/healthz", () => Results.Json(new
{
    status = "ok",
    service = "imse",
    configured = true
}));

app.MapMethods("/InteractiveMovieScriptEditor/Default.aspx", ["GET", "POST"], (Delegate)HandleRequestAsync);
app.MapMethods("/Default.aspx", ["GET", "POST"], (Delegate)HandleRequestAsync);
app.MapFallback(() => Results.NotFound());
app.Run();

async Task<IResult> HandleRequestAsync(HttpContext context)
{
    Dictionary<string, string> values;
    try
    {
        values = await ReadRequestValuesAsync(context);
    }
    catch (JsonException)
    {
        return CreateError("400", "invalid JSON request", StatusCodes.Status400BadRequest);
    }
    catch (InvalidDataException)
    {
        return CreateError("400", "invalid request body", StatusCodes.Status400BadRequest);
    }
    catch (BadHttpRequestException exception) when (exception.StatusCode == StatusCodes.Status413PayloadTooLarge)
    {
        return CreateError("413", "request body too large", StatusCodes.Status413PayloadTooLarge);
    }

    var suppliedToken = GetSuppliedToken(context);
    if (!TokenMatches(configuredToken, suppliedToken))
        return CreateError("401", "unauthorized", StatusCodes.Status401Unauthorized);

    // The original processor looks up this exact, lower-case key before deserializing the request.
    if (!values.TryGetValue("method", out var method) || string.IsNullOrWhiteSpace(method))
        return CreateError("400", "missing api name", StatusCodes.Status400BadRequest);

    if (!TryGetValueIgnoreCase(values, "settingname", out var settingName) ||
        !IsSafeSettingName(settingName))
    {
        return method switch
        {
            "setting.save" => CreateError(null, "设置名称为空或格式无效", StatusCodes.Status200OK),
            "setting.load" => CreateError(null, "设置名称为空或格式无效", StatusCodes.Status200OK),
            _ => CreateError(null, "无效的api名称", StatusCodes.Status200OK)
        };
    }

    var gate = settingsLocks.GetOrAdd(settingName, static _ => new SemaphoreSlim(1, 1));
    await gate.WaitAsync(context.RequestAborted);
    try
    {
        switch (method)
        {
            case "setting.save":
                if (!TryGetValueIgnoreCase(values, "settingjson", out var settingJson) ||
                    settingJson.Length == 0)
                    return CreateError(null, "传入的settingjson 为空", StatusCodes.Status200OK);

                await SaveSettingAsync(settingsRoot, settingName, settingJson, context.RequestAborted);
                return CreateJson(new SaveSettingResponse { Success = true }, StatusCodes.Status200OK);

            case "setting.load":
                var content = await LoadSettingAsync(settingsRoot, settingName, context.RequestAborted);
                return CreateJson(new LoadSettingResponse { SettingJson = content }, StatusCodes.Status200OK);

            default:
                return CreateError(null, "无效的api名称", StatusCodes.Status200OK);
        }
    }
    catch (IOException exception)
    {
        app.Logger.LogWarning("IMSE setting file operation failed ({ErrorType}).", exception.GetType().Name);
        var message = method == "setting.save" ? "保存文件失败" : "读取文件失败";
        return CreateError(null, message, StatusCodes.Status200OK);
    }
    catch (UnauthorizedAccessException exception)
    {
        app.Logger.LogWarning("IMSE setting file operation was denied ({ErrorType}).", exception.GetType().Name);
        var message = method == "setting.save" ? "保存文件失败" : "读取文件失败";
        return CreateError(null, message, StatusCodes.Status200OK);
    }
    finally
    {
        gate.Release();
    }
}

static async Task<Dictionary<string, string>> ReadRequestValuesAsync(HttpContext context)
{
    var values = new Dictionary<string, string>(StringComparer.Ordinal);
    if (HttpMethods.IsGet(context.Request.Method))
    {
        foreach (var pair in context.Request.Query)
            values[pair.Key] = pair.Value.ToString();
        return values;
    }

    if (!HttpMethods.IsPost(context.Request.Method))
        throw new InvalidDataException("Unsupported method.");

    if (context.Request.HasJsonContentType())
    {
        using var document = await JsonDocument.ParseAsync(
            context.Request.Body,
            new JsonDocumentOptions { MaxDepth = 32 },
            context.RequestAborted);
        if (document.RootElement.ValueKind != JsonValueKind.Object)
            throw new InvalidDataException("Expected a JSON object.");

        foreach (var property in document.RootElement.EnumerateObject())
        {
            values[property.Name] = property.Value.ValueKind switch
            {
                JsonValueKind.String => property.Value.GetString() ?? string.Empty,
                JsonValueKind.Null => string.Empty,
                _ => property.Value.GetRawText()
            };
        }

        return values;
    }

    if (context.Request.HasFormContentType)
    {
        var form = await context.Request.ReadFormAsync(context.RequestAborted);
        foreach (var pair in form)
            values[pair.Key] = pair.Value.ToString();
        return values;
    }

    throw new InvalidDataException("Unsupported content type.");
}

static string? GetSuppliedToken(HttpContext context)
{
    var authorization = context.Request.Headers.Authorization.ToString();
    const string bearerPrefix = "Bearer ";
    if (authorization.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
        return authorization[bearerPrefix.Length..].Trim();

    return null;
}

static bool TokenMatches(string configuredToken, string? suppliedToken)
{
    if (string.IsNullOrEmpty(suppliedToken))
        return false;

    var configuredBytes = Encoding.UTF8.GetBytes(configuredToken);
    var suppliedBytes = Encoding.UTF8.GetBytes(suppliedToken);
    return configuredBytes.Length == suppliedBytes.Length &&
           CryptographicOperations.FixedTimeEquals(configuredBytes, suppliedBytes);
}

static bool TryGetValueIgnoreCase(
    IReadOnlyDictionary<string, string> values,
    string key,
    out string value)
{
    foreach (var pair in values)
    {
        if (string.Equals(pair.Key, key, StringComparison.OrdinalIgnoreCase))
        {
            value = pair.Value;
            return true;
        }
    }

    value = string.Empty;
    return false;
}

static bool IsSafeSettingName(string settingName)
{
    if (settingName.Length is < 1 or > 128 ||
        settingName is "." or ".." ||
        settingName[0] == '.' ||
        settingName[^1] is '.' or ' ' ||
        settingName.Any(character =>
            !(char.IsLetterOrDigit(character) || character is '.' or '_' or '-')))
        return false;

    var deviceName = settingName.Split('.')[0];
    return !deviceName.Equals("CON", StringComparison.OrdinalIgnoreCase) &&
           !deviceName.Equals("PRN", StringComparison.OrdinalIgnoreCase) &&
           !deviceName.Equals("AUX", StringComparison.OrdinalIgnoreCase) &&
           !deviceName.Equals("NUL", StringComparison.OrdinalIgnoreCase) &&
           !System.Text.RegularExpressions.Regex.IsMatch(
               deviceName,
               @"^(COM|LPT)[1-9]$",
               System.Text.RegularExpressions.RegexOptions.IgnoreCase |
               System.Text.RegularExpressions.RegexOptions.CultureInvariant);
}

static string ResolveSettingPath(string settingsRoot, string settingName)
{
    var fileName = $"{settingName}.json";
    var existingPath = Directory.EnumerateFiles(settingsRoot, "*.json", SearchOption.TopDirectoryOnly)
        .FirstOrDefault(path => string.Equals(Path.GetFileName(path), fileName, StringComparison.OrdinalIgnoreCase));
    var pathToUse = existingPath ?? Path.Combine(settingsRoot, fileName);
    var rootPrefix = settingsRoot.EndsWith(Path.DirectorySeparatorChar)
        ? settingsRoot
        : settingsRoot + Path.DirectorySeparatorChar;
    var fullPath = Path.GetFullPath(pathToUse);
    if (!fullPath.StartsWith(rootPrefix, StringComparison.Ordinal))
        throw new IOException("Setting path is outside its root.");

    if (File.Exists(fullPath) &&
        (File.GetAttributes(fullPath) & FileAttributes.ReparsePoint) != 0)
        throw new IOException("Setting path cannot be a symbolic link.");

    return fullPath;
}

static async Task SaveSettingAsync(
    string settingsRoot,
    string settingName,
    string settingJson,
    CancellationToken cancellationToken)
{
    var targetPath = ResolveSettingPath(settingsRoot, settingName);
    var temporaryPath = Path.Combine(settingsRoot, $".imse-{Guid.NewGuid():N}.tmp");
    var bytes = Encoding.UTF8.GetBytes(settingJson);
    try
    {
        await using (var stream = new FileStream(
            temporaryPath,
            new FileStreamOptions
            {
                Mode = FileMode.CreateNew,
                Access = FileAccess.Write,
                Share = FileShare.None,
                Options = FileOptions.Asynchronous | FileOptions.WriteThrough
            }))
        {
            await stream.WriteAsync(bytes, cancellationToken);
            await stream.FlushAsync(cancellationToken);
        }

        File.Move(temporaryPath, targetPath, overwrite: true);
    }
    finally
    {
        if (File.Exists(temporaryPath))
            File.Delete(temporaryPath);
    }
}

static async Task<string?> LoadSettingAsync(
    string settingsRoot,
    string settingName,
    CancellationToken cancellationToken)
{
    var path = ResolveSettingPath(settingsRoot, settingName);
    return File.Exists(path)
        ? await File.ReadAllTextAsync(path, cancellationToken)
        : null;
}

static IResult CreateError(string? code, string message, int statusCode) =>
    CreateJson(new ApiErrorResponse { ErrCode = code, ErrMsg = message }, statusCode);

static IResult CreateJson<T>(T value, int statusCode)
{
    var json = JsonSerializer.Serialize(value, Serialization.Options);
    return Results.Text(json, "application/json; charset=utf-8", Encoding.UTF8, statusCode);
}

sealed class Serialization
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = null,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingDefault,
        WriteIndented = false
    };
}

sealed class ApiErrorResponse
{
    public string? ErrCode { get; init; }
    public string? ErrMsg { get; init; }
    public string? SubErrCode { get; init; }
    public string? SubErrMsg { get; init; }
    public bool IsError => !string.IsNullOrEmpty(ErrCode) ||
                           !string.IsNullOrEmpty(ErrMsg) ||
                           !string.IsNullOrEmpty(SubErrCode) ||
                           !string.IsNullOrEmpty(SubErrMsg);
}

sealed class SaveSettingResponse
{
    public bool Success { get; init; }
    public string? ErrCode { get; init; }
    public string? ErrMsg { get; init; }
    public string? SubErrCode { get; init; }
    public string? SubErrMsg { get; init; }
    public bool IsError => !string.IsNullOrEmpty(ErrCode) ||
                           !string.IsNullOrEmpty(ErrMsg) ||
                           !string.IsNullOrEmpty(SubErrCode) ||
                           !string.IsNullOrEmpty(SubErrMsg);
}

sealed class LoadSettingResponse
{
    public string? SettingJson { get; init; }
    public string? ErrCode { get; init; }
    public string? ErrMsg { get; init; }
    public string? SubErrCode { get; init; }
    public string? SubErrMsg { get; init; }
    public bool IsError => !string.IsNullOrEmpty(ErrCode) ||
                           !string.IsNullOrEmpty(ErrMsg) ||
                           !string.IsNullOrEmpty(SubErrCode) ||
                           !string.IsNullOrEmpty(SubErrMsg);
}
