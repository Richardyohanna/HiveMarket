import * as Linking from "expo-linking";

export const listenForPaymentReturn = (callback: (url: string) => void) => {
  const sub = Linking.addEventListener("url", (event) => {
    callback(event.url);
  });

  return () => sub.remove();
};