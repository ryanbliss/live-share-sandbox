export const WindowMessagingApi = `
import { v4 as uuidv4 } from "uuid";

export class MessageRequest<T> {
  public readonly resolveCallback: (arg0: T) => void;
  public readonly rejectCallback: (error: Error) => void;

  constructor(
    resolveCallback: (arg0: T) => void,
    rejectCallback: (error: Error) => void
  ) {
    this.resolveCallback = resolveCallback;
    this.rejectCallback = rejectCallback;
  }
}

export class WindowMessagingApi {
  private static initialized = false;
  private static readonly pendingRequests = new Map<
    string,
    MessageRequest<any>
  >();

  private static initialize() {
    if (!WindowMessagingApi.initialized) {
      WindowMessagingApi.initialized = true;
      console.log("WindowMessagingApi:: adding event listener");
      window.addEventListener("message", function (e) {
        console.log(e);
        const data = e.data;
        try {
          const decoded = JSON.parse(data);
          if (decoded.messageId) {
            const messageId = decoded.messageId as string;
            const pendingRequest =
              WindowMessagingApi.pendingRequests.get(messageId);
            if (pendingRequest) {
              try {
                if (decoded.errorMessage) {
                  // Handle error
                  pendingRequest.rejectCallback(
                    new Error(
                      decoded.errorMessage ?? "An unknown error occurred"
                    )
                  );
                } else {
                  // Handle success
                  console.log(
                    "WindowMessagingApi: Received successful response",
                    decoded!.response
                  );
                  pendingRequest.resolveCallback(decoded!.response);
                }
              } catch {
                (error: Error) => {
                  // Type binding error
                  pendingRequest.rejectCallback(error);
                };
              }
              WindowMessagingApi.pendingRequests.delete(messageId);
            }
          }
        } catch {
          (err: Error) => {
            console.error(err);
          };
        }
      });
    }
  }

  private static sendMessageToParent(message: string | object) {
    return new Promise<void>((resolve, reject) => {
      if (parent === window) {
        reject(
          new Error(
            "Unable to send message because this window is not in an iFrame"
          )
        );
      }
      if (!WindowMessagingApi.initialized) {
        WindowMessagingApi.initialize();
      }
      if (typeof message === "string") {
        parent.postMessage(message, "*");
      } else {
        parent.postMessage(JSON.stringify(message), "*");
      }
      resolve();
    });
  }

  public static sendRequest<X>(
    messageType: string,
    messageBody?: object
  ): Promise<X> {
    return new Promise((resolve, reject) => {
      const messageId = uuidv4();
      WindowMessagingApi.pendingRequests.set(
        messageId,
        new MessageRequest<X>(resolve, reject)
      );
      WindowMessagingApi.sendMessageToParent({
        messageId,
        messageType,
        messageBody,
      }).catch((error) => {
        reject(error);
      });
    });
  }

  public static sendMessage(
    messageType: string,
    messageBody?: string | object
  ) {
    return WindowMessagingApi.sendMessageToParent({
      messageType,
      messageBody,
    });
  }
}
`;
