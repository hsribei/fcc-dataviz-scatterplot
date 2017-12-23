import "./style.css";

function fetchAndExecutewithJson(
    url: string,
    jsonConsumer: (json: object) => void
) {
    fetch(url).then(response => {
        response.json().then(jsonConsumer);
    });
}

function appendJsonPre(json: object): void {
    const pre = document.createElement("pre");
    pre.innerHTML = JSON.stringify(json, null, 2);
    document.getElementById("d3").appendChild(pre);
}

document.addEventListener("DOMContentLoaded", event => {
    const url =
        "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
    fetchAndExecutewithJson(url, appendJsonPre);
});
