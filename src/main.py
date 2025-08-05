import logging
import ifaddr
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from src.service import ZeroconfBrowser
from src.constants import LOG_FORMAT, AppDir, ZeroconfBrowserCommand


logging.basicConfig(level=logging.INFO, format=LOG_FORMAT)


app = FastAPI()
app.mount("/static", StaticFiles(directory=AppDir.STATIC.value), "static")
templates = Jinja2Templates(AppDir.TEMPLATES.value)
zeroconf_browser = ZeroconfBrowser()


@app.get("/network-adapters")
def network_adapters():
    adapter_list = []
    for adapter in ifaddr.get_adapters():
        ipv4_addresses = [ip.ip for ip in adapter.ips if ip.is_IPv4]
        if ipv4_addresses:
            adapter_list.append({
                "name": adapter.nice_name,
                "addresses": ipv4_addresses
            })
    return adapter_list


@app.get("/zeroconf-browser/services", responses={
    200: {"description": "Zeroconf services retrieved successfully"}
}, status_code=200)
def zeroconf_services() -> list[ZeroconfBrowser.ZeroconfService]:
    return zeroconf_browser.get_services()


@app.post("/zeroconf-browser/control/{command}", responses={
    200: {"description": "Command executed successfully"},
    400: {"description": "Command execution failed"}
})
def control_zeroconf_browser(command: ZeroconfBrowserCommand) -> JSONResponse:
    match command:
        case ZeroconfBrowserCommand.START:
            if zeroconf_browser.start():
                return JSONResponse("Browser started", 200)
            return JSONResponse("Browser already running", 400)
        case ZeroconfBrowserCommand.STOP:
            if zeroconf_browser.stop():
                return JSONResponse("Browser stopped", 200)
            return JSONResponse("Browser not running", 400)
        case ZeroconfBrowserCommand.RESTART:
            zeroconf_browser.stop()
            zeroconf_browser.start()
            return JSONResponse("Browser restarted", 200)


@app.get("/node-manager", response_class=HTMLResponse)
def node_manager(request: Request):
    return templates.TemplateResponse(
        request=request, name="node-manager.html",
        context={"services": zeroconf_browser.get_services()}
    )


@app.get("/node-control/{address}", response_class=HTMLResponse)
def node_control(request: Request, address: str, port: int):
    return templates.TemplateResponse(
        request=request,
        name="node-control.html",
        context={"address": address, "port": port}
    )


if __name__ == "__main__":
    uvicorn.run(app="src.main:app",
                host="0.0.0.0", port=8080,
                reload=False)
