# electron-http-transport

A web component to work with `@advanced-rest-client/electron-request` node package in web components environment.

## Usage

To be used in renderer process as a web component.

```html
<body>
  <arc-request-logic></arc-request-logic>
  <electron-http-transport></electron-http-transport>
</body>
```

```javascript

const e = new CustomEvent('api-request', {
  bubbles: true,
  composed: true,
  cancelable: true,
  detail: {
    id: 'some id',
    url: 'https://api.mulesoft.com/',
    method: 'test'
  }
});
this.dispatchEvent(e);

window.addEventListener('api-response', (e) => {
  console.log(e.detail);
});
```

The `arc-request-logic` processes the request before sending it to the transport library.
It processes variables and before request actions. It also dispatches `before-request`
custom event so listeners can modify the request or cancel it.

When the request finally gets to the `electron-http-transport` component it is
passed to `@advanced-rest-client/electron-request` with read request options like
default timeout or hosts list. Finally the component communicate to `arc-request-logic`
component that the response is ready.

## Events

Each event contains the `id` property on the detail object which is original request id.

-   `request-load-start` - request is being loaded
-   `request-first-byte-received` - started receiving response
-   `request-load-end` - all data is now read

**before-redirect**

Dispatched before redirect occurs. It contains `id` and `url` properties on the detail
object. The `url` is redirect location.
If the event is cancelled then the redirection will be cancelled regardless of
`followRedirects` setting.

**headers-received**

Dispatched right after all headers has been read. contains `id` and `value` properties on the detail
object. The `value` is headers string.

If the event is cancelled then the request is aborted.

**response-ready**

Part of the arc request flow. Dispatched before the response is send to the response
view. Any listener can modify response data during this event.


**report-response**

Part of the arc request flow. An event read by `arc-request-logic` component which
runs response actions and reports the response to the view.

**host-rules-list**

Asks the application for the list of hosts rules.
If the event is not cancelled then the value is ignored.
The application must set `result` property on the detail object containing promise
resolved to the list of rules.

**settings-read**

Asks the application for current settings. It contains `settings` property with
only item set to `requestDefaultTimeout` so the application can limit settings
value in the response.
