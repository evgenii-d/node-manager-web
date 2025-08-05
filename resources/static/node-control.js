const ADDRESS = document.body.dataset.address;
const PORT = document.body.dataset.port;
const API_URL = `http://${ADDRESS}:${PORT}`

async function simpleFetch(url, init, output) {
    let request = new Request(url, init);
    let response = await fetch(request);
    let data = null;
    switch (output) {
        case "text":
            data = await response.text();
            break;
        default:
            data = await response.json();
            break;
    }
    return data;
}

async function nodeNameHandler(event) {
    let element = event.target;
    let data = element.value;
    let result = await fetch(`${API_URL}/app/node-name/${data}`, {
        method: "PUT"
    });
    if (result.status !== 204) {
        element.value = element.dataset.name;
    } else {
        element.dataset.name = element.value;
    }
}

async function newNodeHostnameHandler() {
    fetch(`${API_URL}/system-control/hostname`, { method: "POST" });
}

async function powerControlHandler(event) {
    let command = event.target.dataset.command;
    if (!command) return;
    let request = new Request(
        `${API_URL}/system-control/power/${command}`,
        { method: "POST" }
    );
    await fetch(request);
}

async function displaysControlHandler(event) {
    let container = event.currentTarget;
    let command = event.target.dataset.command;
    if (!command) return;

    let url = null;
    let data = null;
    let elementSelector = null;
    let outputElement = null;
    let inputElement = null;
    switch (command) {
        case "displays":
            data = await simpleFetch(`${API_URL}/system-control/displays/`);
            elementSelector = '[data-output="displays"]';
            outputElement = container.querySelector(elementSelector);
            outputElement.textContent = JSON.stringify(data, null, "    ");
            break;
        case "detect-start":
        case "detect-stop":
        case "detect-restart":
            command = command.replace("detect-", "");
            url = `${API_URL}/system-control/displays/detect/${command}`;
            fetch(url, { method: "POST" });
            break;
        case "displays-config":
            url = `${API_URL}/system-control/displays/config`;
            data = await simpleFetch(url);
            elementSelector = '[data-output="displays-config"]';
            outputElement = container.querySelector(elementSelector);
            outputElement.textContent = JSON.stringify(data, null, "    ");
            break;
        case "add-display-config":
            elementSelector = '[data-input="add-display-config"]';
            inputElement = container.querySelector(elementSelector);
            try {
                data = JSON.parse(inputElement.textContent);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    alert("SyntaxError: invalid JSON");
                    break;
                }
            }
            fetch(`${API_URL}/system-control/displays/config`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify(data)
            });
            break;
        case "delete-display-config":
            elementSelector = '[data-input="delete-display-config"]';
            inputElement = container.querySelector(elementSelector);
            data = inputElement.value;
            if (!data) { alert("'Display name' is empty"); break; }
            url = `${API_URL}/system-control/displays/config/${data}`;
            fetch(url, { method: "DELETE" });
            break;
        default:
            break;
    }
}

async function audioControlHandler(event) {
    let container = event.currentTarget;
    let command = event.target.dataset.command;
    if (!command) return;

    let url = null;
    let data = null;
    let elementSelector = null;
    let outputElement = null;
    let inputElement = null;
    switch (command) {
        case "audio-devices":
            data = await simpleFetch(`${API_URL}/system-control/audio/devices`);
            elementSelector = '[data-output="audio-devices"]';
            outputElement = container.querySelector(elementSelector);
            outputElement.textContent = JSON.stringify(data, null, "    ");
            break;
        case "default-audio":
            url = `${API_URL}/system-control/audio/devices/default`;
            data = await simpleFetch(url);
            elementSelector = '[data-output="default-audio"]';
            outputElement = container.querySelector(elementSelector);
            outputElement.textContent = JSON.stringify(data, null, "    ");
            break;
        case "set-default-audio":
            elementSelector = '[data-input="default-audio-id"]';
            inputElement = container.querySelector(elementSelector);
            data = inputElement.value;
            if (!data) { alert("'Device ID' is empty"); break; }
            fetch(`${API_URL}/system-control/audio/devices/default/${data}`, {
                method: "POST",
            });
            break;
        case "audio-volume":
            url = `${API_URL}/system-control/audio/volume`;
            data = await simpleFetch(url);
            elementSelector = '[data-output="audio-volume"]';
            outputElement = container.querySelector(elementSelector);
            outputElement.textContent = JSON.stringify(data, null, "    ");
            break;
        case "set-audio-volume":
            elementSelector = '[data-input="set-audio-volume"]';
            inputElement = container.querySelector(elementSelector);
            data = parseInt(inputElement.value);
            fetch(
                `${API_URL}/system-control/audio/volume/${data}`,
                { method: "POST" }
            );
            break;
        default:
            break;
    }
}

async function wifiControlHandler(event) {
    let container = event.currentTarget;
    let command = event.target.dataset.command;
    if (!command) return;

    let url = null;
    let data = null;
    let elementSelector = null;
    let outputElement = null;
    let inputElement = null;
    switch (command) {
        case "wifi-interfaces":
            url = `${API_URL}/system-control/wifi/interfaces`;
            data = await simpleFetch(url);
            elementSelector = '[data-output="wifi-interfaces"]';
            outputElement = container.querySelector(elementSelector);
            outputElement.textContent = JSON.stringify(data, null, "    ");
            break;
        case "wifi-connections":
            url = `${API_URL}/system-control/wifi/connections`;
            data = await simpleFetch(url);
            elementSelector = '[data-output="wifi-connections"]';
            outputElement = container.querySelector(elementSelector);
            outputElement.textContent = JSON.stringify(data, null, "    ");
            break;
        case "delete-connection":
            elementSelector = '[data-input="delete-connection"]';
            inputElement = container.querySelector(elementSelector);
            data = inputElement.value;
            if (!data) { alert("'SSID' is empty"); break; }
            url = `${API_URL}/system-control/wifi/connections/${data}`;
            fetch(url, { method: "DELETE" });
            break;
        case "connect-network":
            let networkName = container.querySelector(
                'input[data-input="connect-network"]'
            ).value;
            if (!networkName) { alert("'SSID' is empty"); break; };
            elementSelector = 'pre[data-input="connect-network"]';
            inputElement = container.querySelector(elementSelector);
            try {
                data = JSON.parse(inputElement.textContent);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    alert("SyntaxError: invalid JSON");
                    break;
                }
            }
            fetch(`${API_URL}/system-control/wifi/connect/${networkName}`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify(data)
            });
            break;
        case "disconnect-network":
            elementSelector = '[data-input="disconnect-network"]';
            inputElement = container.querySelector(elementSelector);
            data = inputElement.value;
            if (!data) { alert("'SSID' is empty"); break; };
            url = `${API_URL}/system-control/wifi/disconnect/${data}`;
            fetch(url, { method: "POST" });
            break;
        case "scan-networks":
            let interfaceName = container.querySelector(
                '[data-input="scan-networks"]'
            ).value;
            if (!interfaceName) { alert("'Interface Name' is empty"); break; };
            url = `${API_URL}/system-control/wifi/${interfaceName}/networks`;
            data = await simpleFetch(url);
            elementSelector = '[data-output="scan-networks"]';
            outputElement = container.querySelector(elementSelector);
            outputElement.textContent = JSON.stringify(data, null, "    ");
            break;
        default:
            break;
    }
}

async function mouseCursorControlHandler(event) {
    let container = event.currentTarget;
    let command = event.target.dataset.command;
    if (!command) return;

    let url = null;
    let data = null;
    let elementSelector = null;
    let outputElement = null;
    let inputElement = null;

    switch (command) {
        case "cursor-enable":
        case "cursor-disable":
            command = command.replace("cursor-", "");
            url = `${API_URL}/system-control/mouse-cursor/control/${command}`;
            fetch(url, { method: "POST" });
            break;
        case "get-cursor-size":
            url = `${API_URL}/system-control/mouse-cursor/size`;
            data = await simpleFetch(url);
            outputElement = container.querySelector('[data-output="get-cursor-size"]');
            outputElement.textContent = data;
            break;
        case "set-cursor-size":
            inputElement = container.querySelector('[data-input="set-cursor-size"]');
            data = inputElement.value;
            url = `${API_URL}/system-control/mouse-cursor/size/${data}`;
            fetch(url, { method: "POST" });
            break;
        default:
            break;
    }
}

function staticUploadHandler(event) {
    let container = event.currentTarget;
    let command = event.target.dataset.command;
    let formData = new FormData();
    let files = container.querySelector("input[type=file]").files;

    if (!command) return;
    if (files.length === 0) { alert('Select file'); return };
    formData.append("file", files[0])
    fetch(`${API_URL}/web-browser/static`, {
        method: "POST", body: formData
    });
}

async function webBrowserInstancesHandler(event) {
    let container = event.currentTarget;
    let command = event.target.dataset.command;
    if (!command) return;

    let url = null;
    let data = null;
    let elementSelector = null;
    let outputElement = null;
    let inputElement = null;
    switch (command) {
        case "get-instances":
            data = await simpleFetch(`${API_URL}/web-browser/instances`);
            elementSelector = '[data-output="get-instances"]';
            outputElement = container.querySelector(elementSelector);
            outputElement.textContent = JSON.stringify(data, null, "    ");
            break;
        case "create-instance":
            elementSelector = '[data-input="create-instance"]';
            inputElement = container.querySelector(elementSelector);
            try {
                data = JSON.parse(inputElement.textContent);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    alert("SyntaxError: invalid JSON");
                    break;
                }
            }
            simpleFetch(`${API_URL}/web-browser/instances`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify(data)
            });
            break;
        case "active-instances":
            data = await simpleFetch(`${API_URL}/web-browser/instances/active`);
            elementSelector = '[data-output="active-instances"]';
            outputElement = container.querySelector(elementSelector);
            outputElement.textContent = JSON.stringify(data, null, "    ");
            break;
        case "modify-instance":
            elementSelector = 'input[data-input="modify-instance-input"]';
            inputElement = container.querySelector(elementSelector);
            if (!inputElement.value) { alert("'UUID' is empty"); break; }
            url = `${API_URL}/web-browser/instances/${inputElement.value}`;

            elementSelector = 'pre[data-input="modify-instance-input"]';
            inputElement = container.querySelector(elementSelector);
            try {
                data = JSON.parse(inputElement.textContent);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    alert("SyntaxError: invalid JSON");
                    break;
                }
            }
            fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify(data)
            });
            break;
        case "delete-instance":
            elementSelector = '[data-input="delete-instance-input"]';
            inputElement = container.querySelector(elementSelector);
            data = inputElement.value;
            if (!data) { alert("'UUID' is empty"); break; }
            url = `${API_URL}/web-browser/instances/${data}`;
            fetch(url, { method: "DELETE" });
            break;
        case "command-instances-start":
        case "command-instances-stop":
        case "command-instances-restart":
            command = command.replace("command-instances-", "");
            url = `${API_URL}/web-browser/instances/manager/${command}`;
            fetch(url, { method: "POST" });
            break;
        default:
            break;
    }
}

async function webBrowserInstanceHandler(event) {
    let container = event.currentTarget;
    let command = event.target.dataset.command;
    if (!command) return;

    let url = null;
    let data = null;
    let elementSelector = null;
    let inputElement = null;

    switch (command) {
        case "command-instance-start":
        case "command-instance-stop":
        case "command-instance-restart":
            elementSelector = '[data-input="command-instance-input"]';
            inputElement = container.querySelector(elementSelector);
            data = inputElement.value;
            if (!data) { alert("'UUID' is empty"); break; }
            command = command.replace("command-instance-", "");
            url = `${API_URL}/web-browser/${data}/service/${command}`;
            fetch(url, { method: "POST" });
            break;
        default:
            break;
    }
}

async function mediaPlayerInstancesHandler(event) {
    let container = event.currentTarget;
    let command = event.target.dataset.command;
    if (!command) return;

    let url = null;
    let data = null;
    let elementSelector = null;
    let outputElement = null;
    let inputElement = null;

    switch (command) {
        case "get-instances":
            data = await simpleFetch(`${API_URL}/media-player/instances`);
            elementSelector = '[data-output="get-instances"]';
            outputElement = container.querySelector(elementSelector);
            outputElement.textContent = JSON.stringify(data, null, "    ");
            break;
        case "create-instance":
            elementSelector = '[data-input="create-instance"]';
            inputElement = container.querySelector(elementSelector);
            try {
                data = JSON.parse(inputElement.textContent);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    alert("SyntaxError: invalid JSON");
                    break;
                }
            }
            simpleFetch(`${API_URL}/media-player/instances`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify(data)
            });
            break;
        case "active-instances":
            data = await simpleFetch(`${API_URL}/media-player/instances/active`);
            elementSelector = '[data-output="active-instances"]';
            outputElement = container.querySelector(elementSelector);
            outputElement.textContent = JSON.stringify(data, null, "    ");
            break;
        case "modify-instance":
            elementSelector = 'input[data-input="modify-instance-input"]';
            inputElement = container.querySelector(elementSelector);
            if (!inputElement.value) { alert("'UUID' is empty"); break; }
            url = `${API_URL}/media-player/instances/${inputElement.value}`;

            elementSelector = 'pre[data-input="modify-instance-input"]';
            inputElement = container.querySelector(elementSelector);
            try {
                data = JSON.parse(inputElement.textContent);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    alert("SyntaxError: invalid JSON");
                    break;
                }
            }
            fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify(data)
            });
            break;
        case "delete-instance":
            elementSelector = '[data-input="delete-instance-input"]';
            inputElement = container.querySelector(elementSelector);
            data = inputElement.value;
            if (!data) { alert("'UUID' is empty"); break; }
            url = `${API_URL}/media-player/instances/${data}`;
            fetch(url, { method: "DELETE" });
            break;
        case "command-instances-start":
        case "command-instances-stop":
        case "command-instances-restart":
            command = command.replace("command-instances-", "");
            url = `${API_URL}/media-player/instances/manager/${command}`;
            fetch(url, { method: "POST" });
            break;
        default:
            break;
    }
}

async function mediaPlayerInstanceHandler(event) {
    let container = event.currentTarget;
    let command = event.target.dataset.command;
    if (!command) return;

    let url = null;
    let data = null;
    let elementSelector = null;
    let inputElement = null;
    let uuid = container.querySelector(
        '[data-input="media-player-instance-input"]'
    ).value;
    if (!uuid) { alert("'UUID' is empty"); return; }

    switch (command) {
        case "command-instance-start":
        case "command-instance-stop":
        case "command-instance-restart":
            command = command.replace("command-instance-", "");
            url = `${API_URL}/media-player/${uuid}/service/${command}`;
            fetch(url, { method: "POST" });
            break;
        case "playback-control-play":
        case "playback-control-stop":
        case "playback-control-next":
        case "playback-control-prev":
        case "playback-control-pause":
            command = command.replace("playback-control-", "");
            url = `${API_URL}/media-player/${uuid}/control/${command}`;
            fetch(url, { method: "POST" });
            break;
        case "playlist-control-goto":
            elementSelector = '[data-input="playlist-control-input"]';
            inputElement = container.querySelector(elementSelector);
            data = inputElement.value;
            if (!data) { alert("'Index' is empty"); break; }
            fetch(`${API_URL}/media-player/${uuid}/playlist/goto/${data}`, {
                method: "POST"
            });
            break;
        case "playlist-control-change":
            elementSelector = '[data-input="playlist-control-change"]';
            inputElement = container.querySelector(elementSelector);
            data = inputElement.value;
            if (!data) { alert("'Playlist name' is empty"); break; }
            fetch(`${API_URL}/media-player/${uuid}/playlist/change/${data}`, {
                method: "POST"
            });
            break;
        case "playlist-control-clear":
            url = `${API_URL}/media-player/${uuid}/playlist/clear`;
            fetch(url, { method: "POST" });
            break;
        case "playlist-control-status":
            url = `${API_URL}/media-player/${uuid}/playlist/status`;
            data = await simpleFetch(url);
            container.querySelector(
                '[data-output="playlist-control-status"]'
            ).textContent = JSON.stringify(data, null, "    ");
            break;
        case "audio-volume":
            url = `${API_URL}/media-player/${uuid}/audio/volume`;
            data = await simpleFetch(url);
            container.querySelector(
                '[data-output="audio-volume"]'
            ).textContent = JSON.stringify(data, null, "    ");
            break;
        case "set-audio-volume":
            elementSelector = '[data-input="set-audio-volume"]';
            inputElement = container.querySelector(elementSelector);
            data = inputElement.value;
            if (!data) { alert("'Volume' is empty"); break; }
            url = `${API_URL}/media-player/${uuid}/audio/volume/${data}`;
            fetch(url, { method: "POST" });
            break;
        case "audio-devices":
            url = `${API_URL}/media-player/${uuid}/audio/devices`;
            data = await simpleFetch(url);
            container.querySelector(
                '[data-output="audio-devices"]'
            ).textContent = JSON.stringify(data, null, "    ");
            break;
        case "set-audio-device":
            elementSelector = '[data-input="set-audio-device"]';
            inputElement = container.querySelector(elementSelector);
            data = inputElement.value;
            if (!data) { alert("'Audio Device' is empty"); break; };
            url = `${API_URL}/media-player/${uuid}/audio/devices/default/${data}`;
            fetch(url, { method: "POST" });
            break;
        default:
            break;
    }
}

async function mediaFilesControlHandler(event) {
    let container = event.currentTarget;
    let command = event.target.dataset.command;
    if (!command) return;

    let url = null;
    let data = null;
    let elementSelector = null;
    let outputElement = null;
    let inputElement = null;

    switch (command) {
        case "media-files-control":
            data = await simpleFetch(`${API_URL}/media-files`);
            container.querySelector(
                '[data-output="media-files-control"]'
            ).textContent = JSON.stringify(data, null, "    ");
            break;
        case "media-files-upload":
            let formData = new FormData();
            let files = container.querySelector(
                'input[data-input="media-files-upload"]'
            ).files;

            if (!command) return;
            if (files.length === 0) { alert("Select files"); return; };
            Array.from(files).forEach(file => {
                formData.append("files", file);
            });
            data = await simpleFetch(`${API_URL}/media-files`, {
                method: "POST", body: formData
            });
            container.querySelector(
                '[data-output="media-files-upload"]'
            ).textContent = JSON.stringify(data, null, "    ");
            break;
        case "media-files-delete":
            elementSelector = '[data-input="media-files-delete"]';
            inputElement = container.querySelector(elementSelector);
            data = inputElement.value;
            if (!data) { alert("'Filename' is empty"); return; };
            fetch(`${API_URL}/media-files/${data}`, { method: "DELETE" });
            return;
        case "media-files-download":
            elementSelector = '[data-input="media-files-download"]';
            inputElement = container.querySelector(elementSelector);
            data = inputElement.value;
            if (!data) { alert("'Filename' is empty"); return; };
            let file = await fetch(`${API_URL}/media-files/download/${data}`);
            if (!file.ok) {
                alert(`Failed to download '${data}'`);
                break;
            };

            let a = document.createElement("a");
            let blob = await file.blob();
            url = URL.createObjectURL(blob);
            a.href = url;
            a.download = data;
            a.click();
            URL.revokeObjectURL(url);
            break;
        default:
            break;
    }
}

async function playlistsControlHandler(event) {
    let container = event.currentTarget;
    let command = event.target.dataset.command;
    if (!command) return;

    let url = null;
    let data = null;
    let elementSelector = null;
    let outputElement = null;
    let inputElement = null;

    switch (command) {
        case "available-playlists":
            data = await simpleFetch(`${API_URL}/playlists`);
            container.querySelector(
                '[data-output="available-playlists"]'
            ).textContent = JSON.stringify(data, null, "    ");
            break;
        case "create-playlist":
            elementSelector = 'pre[data-input="create-playlist"]';
            inputElement = container.querySelector(elementSelector);
            try {
                data = JSON.parse(inputElement.textContent);
            } catch (error) {
                if (error instanceof SyntaxError) {
                    alert("SyntaxError: invalid JSON");
                    break;
                }
            }
            fetch(`${API_URL}/playlists`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify(data)
            });
            break;
        case "delete-playlist":
            elementSelector = '[data-input="delete-playlist"]';
            inputElement = container.querySelector(elementSelector);
            data = inputElement.value;
            if (!data) { alert("'Playlist name' is empty"); return; };
            fetch(`${API_URL}/playlists/${data}`, { method: "DELETE" });
            break;
        case "available-playlist-files":
            elementSelector = '[data-input="available-playlist-files"]';
            inputElement = container.querySelector(elementSelector);
            if (!inputElement.value) {
                alert("'Playlist name' is empty"); return;
            };
            url = `${API_URL}/playlists/content/${inputElement.value}`;
            data = await simpleFetch(url);
            container.querySelector(
                '[data-output="available-playlist-files"]'
            ).textContent = JSON.stringify(data, null, "    ");
            break;
        default:
            break;
    }
}

async function main() {
    let nodeNameInput = document.getElementById("node-name");
    let nodeHostnameElement = document.getElementById("node-hostname");
    let newNodeHostnameDiv = document.getElementById("new-node-hostname");
    let powerControlElement = document.getElementById("power-control");
    let displaysControlElement = document.getElementById("displays-control");
    let audioControlElement = document.getElementById("audio-control");
    let wifiControlElement = document.getElementById("wifi-control");
    let mouseCursorControlElement = document.getElementById("mouse-cursor-control");
    let staticUploadElement = document.getElementById("static-upload");
    let webBrowserInstancesElement = document.getElementById("web-browser-instances");
    let webBrowserInstanceElement = document.getElementById("web-browser-instance");
    let mediaPlayerInstancesElement = document.getElementById("media-player-instances");
    let mediaPlayerInstanceElement = document.getElementById("media-player-instance");
    let mediaFilesControlElement = document.getElementById("media-files-control");
    let playlistsControlElement = document.getElementById("playlists-control");

    let nodeName = await fetch(`${API_URL}/app/node-name`)
        .then(response => response.json());
    let nodeHostname = await fetch(`${API_URL}/system-control/hostname`)
        .then(response => response.json());
    if (nodeName) {
        nodeNameInput.value = nodeName;
        nodeNameInput.dataset.name = nodeName;
    }
    if (nodeHostname) {
        nodeHostnameElement.textContent = nodeHostname;
    }

    nodeNameInput.addEventListener("change", nodeNameHandler);
    newNodeHostnameDiv.addEventListener("click", newNodeHostnameHandler);
    powerControlElement.addEventListener("click", powerControlHandler);
    displaysControlElement.addEventListener("click", displaysControlHandler);
    audioControlElement.addEventListener("click", audioControlHandler);
    wifiControlElement.addEventListener("click", wifiControlHandler);
    mouseCursorControlElement.addEventListener("click", mouseCursorControlHandler);
    staticUploadElement.addEventListener("click", staticUploadHandler);
    webBrowserInstancesElement.addEventListener("click", webBrowserInstancesHandler);
    webBrowserInstanceElement.addEventListener("click", webBrowserInstanceHandler);
    mediaPlayerInstancesElement.addEventListener("click", mediaPlayerInstancesHandler);
    mediaPlayerInstanceElement.addEventListener("click", mediaPlayerInstanceHandler);
    mediaFilesControlElement.addEventListener("click", mediaFilesControlHandler);
    playlistsControlElement.addEventListener("click", playlistsControlHandler);
}
main();