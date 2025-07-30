// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class WS {
  static #websocketInstances: Map<string, WebSocket> = new Map<
    string,
    WebSocket
  >();

  static getInstance(url: string) {
    url = `${url}?session=${localStorage.getItem("session") || ""}`;
    let socket = WS.#websocketInstances.get(url);
    if (!socket) {
      socket = new WebSocket(url);
      WS.#websocketInstances.set(url, socket);
    }
    return socket;
  }

  static removeInstance(url: string) {
    url = `${url}?session=${localStorage.getItem("session") || ""}`;
    WS.#websocketInstances.delete(url);
  }
}
