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
    result = compressedData;
  }

  return result;
};

const updateOnAccordion = (document: any, allNativePayloads: any[],type:any) => {
  const trElements = document.querySelectorAll(
    `tr[data-test-subj="tableDocViewRow-${type}"]`
  );
  trElements.forEach((trElement: any, index: any) => {
    const divElement = trElement.querySelector("div");
    const exisitingDecompressedNode = !!divElement?.querySelector("p");
    if (divElement && !exisitingDecompressedNode) {
      const spanElement =
        divElement.querySelector("span")?.firstChild?.nodeValue;
      const decompressed = decompress(spanElement);
      allNativePayloads.push(decompressed);
      const decompressedNode = document.createElement("p");
      decompressedNode.textContent = decompressed;
      decompressedNode.style.backgroundColor = "#e6f0f8";
      decompressedNode.setAttribute('class', 'zlib-decompressed-text');
      divElement.insertBefore(decompressedNode, divElement.firstChild);
    }
  });
};
const updateOnTable = (document: Document, allNativePayloads: any[], type: any) => {
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
          if (tdElements[index + 1]) {
            const wrapper = tdElements[index + 1].querySelector("div");
            const exisitingDecompressedNode = !!wrapper?.querySelector("p");
            if (wrapper && !exisitingDecompressedNode) {
              const value =
                wrapper.querySelector("span")?.firstChild?.nodeValue;
              const decompressed = decompress(value);
              allNativePayloads.push(decompressed);
              const decompressedNode = document.createElement("p");
              decompressedNode.textContent = decompressed;
              decompressedNode.style.backgroundColor = "#e6f0f8";
              decompressedNode.setAttribute('class', 'zlib-decompressed-text');
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

  useEffect(() => {
    const handleScroll = () => {
      if (localStorage.getItem("decompress") === "true") {
        const allNativePayloads: any = [];
        updateOnAccordion(document, allNativePayloads,'nativePayload');
        updateOnTable(document, allNativePayloads,'nativePayload');
        updateOnAccordion(document, allNativePayloads,'responsePayload');
        updateOnTable(document, allNativePayloads,'responsePayload');
        setNativePayloads(allNativePayloads);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleMessage = (message:any, sender: any, sendResponse: any) => {
      if (message.action === 'setLocalStorage') {
        const { key, value } = message.data;
        localStorage.setItem(key, value);
        console.log(`Set local storage for key: ${key} with value: ${value}`);
      }else if(message.action==='clear'){
        localStorage.setItem('decompress','false');
        const paragraphsToRemove = document.querySelectorAll('p.zlib-decompressed-text');
        paragraphsToRemove.forEach(paragraph => {
          paragraph.remove();
        });
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);
  return (
    <div className="wrapper">
      <header className="App-header">testing</header>
    </div>
  );
}

export default App;
