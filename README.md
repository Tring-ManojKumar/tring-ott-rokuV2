## Market-specific assets

Build a market with the matching npm script, for example `npm run build:blive` or
`npm run build:tringplay`. The build plugin includes that market's files from
`assets/<market>/` in the Roku package, including that market's `manifest` as
the package-root manifest; there is no shared root manifest. The selected
market's `url.json`, images, fonts, and icons are also included, while other
markets' source assets are not copied into the package. The market folder is
flattened: images, fonts, and icons are packaged under `assets/images`,
`assets/fonts`, and `assets/icons`. Every build writes or replaces the single
archive `out/roku-deploy.zip`.
VS Code launch configurations explicitly include `assets/**/*` so their
debug-deployment archive also contains the selected market assets.

## Logging

Use `AppLogDebug`, `AppLogInfo`, `AppLogWarn`, and `AppLogError` from
`utils/logging/Logger.bs` for application diagnostics. Debug builds emit all
four levels; production builds emit warnings and errors. For example, an API
flow can log `AppLogDebug("PlaylistApi", "GET /playlist started")` and
`AppLogInfo("PlaylistApi", "GET /playlist succeeded")`.

## Reusable SceneGraph UI components

The reusable `AppButton`, `AppLabel`, and `AppCard` components live under
`components/presentation/customComponents/`. Theme tokens are part of each
market's existing `theme` config; common spacing, corner radii, border widths,
gradients, button variants, and label variants are inherited from
`assets/base/config.ts` and can be overridden per market. The build plugin
includes those values in the generated BrightScript theme alongside each
brand's colors and fonts.

The market configs already define Blive's cyan accent (`#00AEEF`) and
Tringplay's pink accent (`#FF4F81`). Their gradient second stops (`#0758A8`
for Blive and `#8A3FFC` for Tringplay) are proposed defaults because the
previous configs did not define gradients.

`AppButton` accepts optional explicit `text`, `mediaType` and `contentType`
strings, dimensions, `primary`/`secondary`/`outlined`/`text` variants, enabled
state, corner radius, colors, border, gradient values, and font size.
`mediaType` and `contentType` are independent of market styling. A non-blank
explicit `text` always overrides the dynamic label. Otherwise, the button
resolves `audio` to `Listen Now`; other, missing, or unsupported media types
fall back to `Watch Now`. The current mapping treats `contentType` as a
wildcard because no content-specific labels were specified. Add confirmed
content-specific rules in `getButtonText` in `AppButton.bs`; consumers do not
need to change. `gradientPreset` selects a named market theme gradient;
explicit gradient colors can override it. Other fields are `backgroundColor`,
`gradientColors`, `gradientStops`, `gradientStyle`, `gradientAngle`,
`borderWidth`, `borderColor`, `textColor`, `fontSize`, and `focusEnabled`.
`focusEnabled` defaults to true; set it false when a button is displayed inside
a parent that owns focus traversal. The button publishes an `activated`
associative array (`text`, `variant`) on OK/Select release. It does not
navigate. `AppLabel` wraps a built-in Label and forwards width, height,
`horizAlign`, `vertAlign`, wrapping, `maxLines`, and truncation properties. Its variants are `heading`,
`subtitle`, `body`, `caption`, and `button`; optional overrides are
`fontFamily`, `fontSize`, and `textColor`. `AppCard` is a presentation
container with an optional supplied content node and configurable fill,
gradient preset, border, dimensions, radius, variant, and padding. `AppLoader`
provides a small reusable themed loading message.

The Home screen uses a `MarkupGrid` with a custom `HomeCard` item. Each item
composes `AppCard`, `Poster`, and `AppLabel` for its title. The grid retains
remote focus and selection handling and opens the existing image gallery when
an item is selected. API `media_type` and `content_type` values are preserved
by the playlist DTO/domain mapper and content nodes. A separate, focusable
`AppButton` below the grid tracks the currently focused card. Its HomeScreen
position is calculated from the grid's item count, dimensions, spacing, and
column count. `AppButton` does not set its own position; each parent screen
controls the inherited SceneGraph `translation`, so other consumers can use
their own layout:

```xml
<AppButton id="playButton" mediaType="audio" contentType="podcast" />
```

Or update them from BrightScript when content changes:

```brightscript
button.mediaType = item.media_type
button.contentType = item.content_type
button.text = "" ' Clear an explicit override to use the dynamic mapping.
```

Future screens only supply these values; they do not need to implement the
mapping, fetch content, or add navigation logic to `AppButton`. Set a non-blank
`text` to override the mapped label explicitly.

Example screen markup:

```xml
<AppButton id="continueButton" text="Continue" variant="primary" width="320" height="72" />
<AppLabel id="screenTitle" text="Featured" variant="heading" width="900" height="64" />
```

Observe activation in the owning screen and keep navigation there:

```brightscript
m.continueButton = m.top.findNode("continueButton")
m.continueButton.observeField("activated", "onContinueActivated")

sub onContinueActivated(event as object)
    buttonInfo = event.getData()
    print "Activated " + buttonInfo.text
end sub
```

Rounded corners, borders, and gradients use the Roku OS 16.0 `Effect` node
only after `roDeviceInfo.GetOSVersion().major` is at least 16 and the Effect
node's read-only `supported` field is true. Older or unsupported devices
show square backgrounds with simple rectangular borders; gradients and rounded
corners are omitted. This fallback keeps the same layout and colors without
using unsupported XML fields.

To use a component in a screen, add it to that screen's children, set its
interface fields, and observe its public event fields in the screen script.
Run `npm run build:tringplay`, `npm run build:blive`, `npm run test:build`, and
`npm run test:run` to validate build and test packaging.

Roku package URIs are rooted at the package directory. Market source configs
may use paths such as `pkg:/assets/blive/images/Roku.png`; build output rewrites
these to match the flattened package paths, such as `pkg:/assets/images/Roku.png`
and `pkg:/assets/fonts/Regular.otf`. The generated theme source and packaged
config use those normalized paths.

## API error handling

`Data.BaseApi` returns a structured result with `ok`, `data`, `statusCode`, `category`, `technicalMessage`, `userMessage`, `retryable`, and `attempts`. `Data.ApiResult` creates the common result shape, while `Data.NetworkStatus` checks Roku's current network link before each request attempt. BaseApi retries network start failures, timeouts, connection loss, HTTP 408/429, and HTTP 5xx once by default; pass a different `maxRetries` value to configure it. Client and parse errors are not retried.

Services and repositories should return the complete result without replacing its error details. A Task owns the operation's `IDLE`/`LOADING`/`SUCCESS`/`EMPTY`/`ERROR`/`OFFLINE` state and publishes the result through its interface. `RequestStateController` observes that result at the presentation boundary and uses the reusable `ErrorStatePanel` for user-facing errors and empty content. Its `retryRequested` event leaves the owning screen responsible for rerunning the operation with its required parameters.

The current Home playlist and Network Check screens use `RequestStateController` to observe any Task/ViewModel node that publishes `requestState`, `errorMessage`, and `errorResult`. The controller presents the shared fallback/empty panel and emits `retryRequested`; the screen handles that event by rerunning its own operation with its own parameters. For a new screen, add the controller, set its `requestTask` field to the operation's Task or ViewModel, and observe `retryRequested`. This checkout does not yet contain subscription, library, audio-detail, or video-detail API Tasks, so those flows need to adopt the same result fields when added. Connectivity restoration is detected when an operation is retried or started; the current implementation does not run a background connectivity poller or automatically reissue requests. `GetLinkStatus()` reports link connectivity, which may not prove that an upstream service is reachable.