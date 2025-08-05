{
    function insertTextContent(selectorsArray, content) {
        selectorsArray.forEach(selector => {
            let element = document.querySelector(selector);
            element.textContent = content;
        });
    }

    insertTextContent(['[data-input="add-display-config"]'],
        `{
    "name": "string",
    "resolution": {
        "width": 0,
        "height": 0
    },
    "rotation": "normal",
    "position": {
        "x": 0,
        "y": 0
    },
    "reflect": "normal",
    "primary": false
}`);

    insertTextContent(['pre[data-input="connect-network"]'],
        `{
    "password": "string",
    "interface": "string"
}`);

    insertTextContent(
        [
            '#web-browser-instances [data-input="create-instance"]',
            '#web-browser-instances pre[data-input="modify-instance-input"]'
        ],
        `{
    "name": "string",
    "autostart": true,
    "url": "string",
    "position": {
        "x": 0,
        "y": 0
  }
}`);

    insertTextContent(
        [
            '#media-player-instances [data-input="create-instance"]',
            '#media-player-instances pre[data-input="modify-instance-input"]'
        ],
        `{
  "name": "string",
  "autostart": false,
  "volume": 0,
  "videoOutput": "any",
  "audioOutput": "any",
  "audioDevice": "",
  "playback": "-L",
  "imageDuration": 10,
  "screenNumber": 0,
  "playlist": "string",
  "hotkeys": false,
  "interface": "qt"
}`);

    insertTextContent(['#playlists-control [data-input="create-playlist"]'],
        `{
  "name": "string",
  "files": [
    "string"
  ]
}`);
}