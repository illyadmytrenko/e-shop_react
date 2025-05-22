"use client";

import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { store, persistor } from "./store";
import { ModalProvider } from "@/common/context/modal-context";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect, useState } from "react";
import { CustomImage } from "@/common/components/custom-image/custom-image";
import { CustomButton } from "@/common/components/custom-button/custom-button";
import { CustomInput } from "@/common/components/custom-input/custom-input";

export default function RootLayout() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const makeRequestToChatGPT = async (message: string) => {
    const response = await fetch(
      "https://e-shopreact-production-3eb1.up.railway.app/message",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      }
    );

    return response.json();
  };

  const [isModalChatOpen, setIsModalChatOpen] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<
    { text: string; sender: string }[]
  >([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const toggleModalChat = (): void => {
    setIsModalChatOpen((prev) => !prev);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const askChatGPT = async (e: any) => {
    e.preventDefault();
    setChatHistory((state) => [
      ...state,
      {
        text: currentMessage,
        sender: "You",
      },
    ]);

    const response = await makeRequestToChatGPT(currentMessage);
    setCurrentMessage("");

    setChatHistory((state) => [
      ...state,
      {
        text: response.received,
        sender: "ChatGPT",
      },
    ]);
  };

  if (!isClient && typeof document === "undefined") return <p>Loading...</p>;

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css?family=Inter:100,200,300,regular,500,600,700,800,900,100italic,200italic,300italic,italic,500italic,600italic,700italic,800italic,900italic&display=optional"
          rel="stylesheet"
        />
      </head>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ModalProvider>
            <body>
              <RouterProvider router={router} />
              {!isModalChatOpen ? (
                <CustomButton
                  className="!fixed bottom-4 left-4"
                  onClick={toggleModalChat}
                >
                  <CustomImage
                    alt="ai icon"
                    src="/chatgpt.jpg"
                    width={40}
                    height={40}
                  />
                </CustomButton>
              ) : (
                <div className="fixed bottom-4 left-4 right-4 md:left-4 md:w-80 p-4 bg-white shadow-lg rounded-lg z-20">
                  <div className="flex justify-between items-center gap-5 mb-3">
                    <h3 className="font-bold text-lg">Ask ChatGPT</h3>
                    <CustomButton onClick={toggleModalChat}>
                      <CustomImage
                        alt="close icon"
                        src="/header/modal-window/close-circle.svg"
                        width={24}
                        height={24}
                      />
                    </CustomButton>
                  </div>
                  <div className="overflow-auto h-60 mb-4">
                    {chatHistory.map((message, index) => (
                      <div key={index}>
                        <p className="font-semibold">{message.sender}</p>
                        <div className="p-2 mb-2 border rounded">
                          <p>{message.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={askChatGPT} className="flex gap-2">
                    <CustomInput
                      name="chatgpt-input"
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      className="p-2 rounded"
                      classNameDiv="flex-[1_1_60%]"
                      placeholder="Type a message"
                    />
                    <CustomButton
                      type="submit"
                      variant="blue"
                      size="sm"
                      className="flex-[1_1_40%]"
                    >
                      Send
                    </CustomButton>
                  </form>
                </div>
              )}
            </body>
          </ModalProvider>
        </PersistGate>
      </Provider>
    </html>
  );
}
