// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class WS {
  static #websocketInstances: Map<string, WebSocket> = new Map<
    string,
    WebSocket
  >();

  static getInstance(url: string) {
    // Check if URL already has query parameters
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}session=${localStorage.getItem("session") || ""}`;
    let socket = WS.#websocketInstances.get(url);
    if (!socket) {
      socket = new WebSocket(url);
      WS.#websocketInstances.set(url, socket);
    }
    return socket;
  }

  static removeInstance(url: string) {
    // Check if URL already has query parameters
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}session=${localStorage.getItem("session") || ""}`;

    // Close connection if exist
    const socket = WS.#websocketInstances.get(url);
    if (socket) {
      socket.close();
    }
    WS.#websocketInstances.delete(url);
  }
}
