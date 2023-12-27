import React, { useEffect, useState } from "react";
import pako from "pako";
import "./App.css";

const decompress = (compressedData: any) => {
  let result: any = "";
  try {
    const binaryData = atob(compressedData);
    const uint8Array = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }

    result = pako.inflate(uint8Array, { to: "string" });
  } catch (err: any) {
    console.error("zlib decompress error:", err);
    // result = compressedData;
  }

  return result;
};

const updateOnAccordion = (
  document: any,
  allNativePayloads: any[],
  type: any,
  setIsCopied: any
) => {
  const trElements = document.querySelectorAll(
    `tr[data-test-subj="tableDocViewRow-${type}"]`
  );
  trElements.forEach((trElement: any, index: any) => {
    const divElement = trElement.querySelector("div");
    const exisitingDecompressedNode = !!divElement?.querySelector("p");
    if (divElement && !exisitingDecompressedNode) {
      const spanElement =
        divElement.querySelector("span")?.firstChild?.nodeValue;
      let text = spanElement;
      if (typeof spanElement !== "string") {
        text = divElement.querySelector("span").querySelector("mark")
          ?.firstChild?.nodeValue;
      }
      const decompressed = decompress(text);
      if (decompressed) {
        allNativePayloads.push(decompressed);
        const decompressedNode = document.createElement("p");
        decompressedNode.textContent = decompressed;
        decompressedNode.style.backgroundColor = "#e6f0f8";
        decompressedNode.style.cursor = "pointer";
        decompressedNode.setAttribute("class", "zlib-decompressed-text");
        decompressedNode.onclick = function () {
          navigator.clipboard.writeText(decompressed);
          setIsCopied(true);
          const copiedDiv = document.createElement("div");
          copiedDiv.classList.add("copy-text-wrapper");
          const copyText = document.createElement("p");
          copyText.classList.add("copy-text");
          copyText.textContent = "Copied!";
          copiedDiv.appendChild(copyText);
          document.querySelector("body")?.appendChild(copiedDiv);
          setTimeout(() => {
            document.body.querySelector("div.copy-text-wrapper")?.remove();
          }, 3000);
        };
        divElement.insertBefore(decompressedNode, divElement.firstChild);
      }
    }
  });
};
const updateOnTable = (
  document: Document,
  allNativePayloads: any[],
  type: any,
  setIsCopied: any
) => {
  const thElements = document.querySelectorAll(
    'th[data-test-subj="docTableHeaderField"]'
  );
  thElements.forEach((thElement, index) => {
    const spanElement = thElement.querySelector(
      `span[data-test-subj="docTableHeader-${type}"]`
    );
    if (spanElement) {
      const tBodys = document.querySelectorAll("tbody");

      tBodys.forEach((tBody, bodyIndex) => {
        const localTRElements = tBody.querySelectorAll("tr");
        localTRElements.forEach((trElement, trIndex) => {
          const tdElements = trElement.querySelectorAll("td");
          const isAccordionData = trElement.classList.contains(
            "kbnDocTableDetails__row"
          );
          if (tdElements[index + 1] && !isAccordionData) {
            const wrapper = tdElements[index + 1].querySelector("div");
            const exisitingDecompressedNode = !!wrapper?.querySelector("p");
            if (wrapper && !exisitingDecompressedNode) {
              const value =
                wrapper.querySelector("span")?.firstChild?.nodeValue;
              let text = value;
              if (typeof value !== "string") {
                text = wrapper.querySelector("span")?.querySelector("mark")
                  ?.firstChild?.nodeValue;
              }
              const decompressed = decompress(text);
              allNativePayloads.push(decompressed);
              const decompressedNode = document.createElement("p");
              decompressedNode.textContent = decompressed;
              decompressedNode.style.backgroundColor = "#e6f0f8";
              decompressedNode.style.cursor = "pointer";
              decompressedNode.setAttribute("class", "zlib-decompressed-text");
              decompressedNode.onclick = function () {
                navigator.clipboard.writeText(decompressed);
                setIsCopied(true);
                const copiedDiv = document.createElement("div");
                copiedDiv.classList.add("copy-text-wrapper");
                const copyText = document.createElement("p");
                copyText.textContent = "Copied!";
                copyText.classList.add("copy-text");
                copiedDiv.appendChild(copyText);
                document.querySelector("body")?.appendChild(copiedDiv);
                setTimeout(() => {
                  document.body
                    .querySelector("div.copy-text-wrapper")
                    ?.remove();
                }, 3000);
              };
              wrapper.insertBefore(decompressedNode, wrapper.firstChild);
            }
          }
        });
      });
    }
  });
};
function App() {
  const [nativePayloads, setNativePayloads] = useState([]);
  const [isCopied, setIsCopied] = useState(false);

  const handleUpdate = () => {
    if (localStorage.getItem("decompress") === "true") {
      const allNativePayloads: any = [];
      updateOnAccordion(
        document,
        allNativePayloads,
        "nativePayload",
        setIsCopied
      );
      updateOnTable(document, allNativePayloads, "nativePayload", setIsCopied);
      updateOnAccordion(
        document,
        allNativePayloads,
        "responsePayload",
        setIsCopied
      );
      updateOnTable(
        document,
        allNativePayloads,
        "responsePayload",
        setIsCopied
      );
      setNativePayloads(allNativePayloads);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleUpdate);

    return () => {
      window.removeEventListener("scroll", handleUpdate);
    };
  }, []);
  useEffect(() => {
    console.log(isCopied);
  }, [isCopied]);
  useEffect(() => {
    const handleMessage = (message: any, sender: any, sendResponse: any) => {
      if (message.action === "setLocalStorage") {
        const { key, value } = message.data;
        localStorage.setItem(key, value);
        if (value === "true") handleUpdate();
      } else if (message.action === "clear") {
        localStorage.setItem("decompress", "false");
        const paragraphsToRemove = document.querySelectorAll(
          "p.zlib-decompressed-text"
        );
        paragraphsToRemove.forEach((paragraph) => {
          paragraph.remove();
        });
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);
  return <div></div>;
}

export default App;
