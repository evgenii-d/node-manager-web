"use strict";

async function fetchNodeName(address, port = null, timeout = 5000) {
  let name = null;
  port = port ? `:${port}` : "";
  try {
    name = await fetch(`http://${address}${port}/app/node-name`, {
      signal: AbortSignal.timeout(timeout),
    }).then((data) => data.json());
  } catch (error) {
    if (error.name === "TimeoutError") {
      console.info(`[${error.name}]: ${address}${port} - Request Timed Out`);
    } else {
      console.info(`[${error.name}]: ${address}${port} - ${error.message}`);
    }
  }
  return name;
}

async function nodePowerControl(address, port = null, command, timeout = 5000) {
  port = port ? `:${port}` : "";
  await fetch(`http://${address}${port}/system-control/power/${command}`, {
    method: "POST",
    signal: AbortSignal.timeout(timeout),
  });
}

async function main() {
  const nodeManagerFieldset = document.getElementById("node-manager");
  const adaptersSelector = document.getElementById("network-adapters");
  const scanButton = document.getElementById("scan-network");
  const updateNamesButton = document.getElementById("update-node-names");
  const rebootNodesButton = document.getElementById("reboot-nodes");
  const poweroffNodesButton = document.getElementById("poweroff-nodes");
  const toggleSelectionButton = document.getElementById("toggle-selection");
  const servicesList = document.getElementById("services-list");
  const adaptersArray = await fetch("/network-adapters").then((data) =>
    data.json()
  );
  let ipAddressArray = [];

  adaptersArray.forEach((adapter) => {
    let adapterGroup = document.createElement("optgroup");
    adapterGroup.label = adapter.name;
    adapter.addresses.forEach((address) => {
      let template = `<option value="${address}">${address}</option>`;
      adapterGroup.insertAdjacentHTML("beforeend", template);
    });
    adaptersSelector.append(adapterGroup);
  });

  scanButton.addEventListener("click", async (_) => {
    if (!adaptersSelector.value) {
      alert("Choose Network Adapter");
      return;
    }

    nodeManagerFieldset.disabled = true;

    let nodeNamesArray = [];
    const port = 5000;
    const ipAddress = adaptersSelector.value;
    const network_prefix = ipAddress.split(".").slice(0, 3).join(".");

    nodeNamesArray = await Promise.all(
      Array.from({ length: 256 }, (_, index) =>
        fetchNodeName(`${network_prefix}.${index}`, port)
      )
    );

    nodeNamesArray.forEach((nodeName, index) => {
      const ipAddress = `${network_prefix}.${index}`;
      const apiEndpoint = `/node-control/${ipAddress}?port=${port}`;
      if (nodeName && !ipAddressArray.includes(ipAddress)) {
        const template = `
                <li data-address="${ipAddress}" data-port="${port}">
                    <input type="checkbox">
                    <span>${nodeName}</span>
                    <a target="_blank" href="${apiEndpoint}">${ipAddress}</a>
                </li>
                `;
        ipAddressArray.push(ipAddress);
        servicesList.insertAdjacentHTML("beforeend", template);
      }
    });

    nodeManagerFieldset.disabled = false;
  });

  updateNamesButton.addEventListener("click", async (_) => {
    const checkboxes = document.querySelectorAll(
      '#services-list input[type="checkbox"]:checked'
    );

    if (checkboxes.length === 0) {
      alert("Select Nodes");
      return;
    }
    nodeManagerFieldset.disabled = true;
    let promisesArray = [];

    Array.from(checkboxes).forEach((checkbox) => {
      const parentElement = checkbox.parentNode;
      const spanElement = parentElement.querySelector("span");
      const address = parentElement.dataset.address;
      const port = parentElement.dataset.port;

      promisesArray.push({
        element: spanElement,
        name: fetchNodeName(address, port),
      });
    });

    let resultArray = await Promise.all(promisesArray);
    resultArray.forEach(async (data) => {
      data.element.textContent = await data.name;
    });

    nodeManagerFieldset.disabled = false;
  });

  rebootNodesButton.addEventListener("click", async (_) => {
    const checkboxes = document.querySelectorAll(
      '#services-list input[type="checkbox"]:checked'
    );

    if (checkboxes.length === 0) {
      alert("Select Nodes");
      return;
    }
    nodeManagerFieldset.disabled = true;
    let promisesArray = [];

    Array.from(checkboxes).forEach((checkbox) => {
      const parentElement = checkbox.parentNode;
      const address = parentElement.dataset.address;
      const port = parentElement.dataset.port;

      promisesArray.push(nodePowerControl(address, port, "reboot"));
    });

    await Promise.all(promisesArray);

    nodeManagerFieldset.disabled = false;
  });

  poweroffNodesButton.addEventListener("click", async (_) => {
    const checkboxes = document.querySelectorAll(
      '#services-list input[type="checkbox"]:checked'
    );

    if (checkboxes.length === 0) {
      alert("Select Nodes");
      return;
    }
    nodeManagerFieldset.disabled = true;
    let promisesArray = [];

    Array.from(checkboxes).forEach((checkbox) => {
      const parentElement = checkbox.parentNode;
      const address = parentElement.dataset.address;
      const port = parentElement.dataset.port;

      promisesArray.push(nodePowerControl(address, port, "shutdown"));
    });

    await Promise.all(promisesArray);

    nodeManagerFieldset.disabled = false;
  });

  toggleSelectionButton.addEventListener("click", (event) => {
    const checkboxes = document.querySelectorAll(
      '#services-list input[type="checkbox"]'
    );
    let state = event.target.dataset.state;
    event.target.dataset.state = "true" ? state === "false" : "true";
    Array.from(checkboxes).forEach((checkbox) => {
      console.log(checkbox);
      checkbox.checked = true ? state === "true" : "false";
    });
  });
}

main();
