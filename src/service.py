import logging
from dataclasses import dataclass
from zeroconf import ServiceBrowser, ServiceStateChange, Zeroconf

logger = logging.getLogger(__name__)


class ZeroconfBrowser():
    """Browse for Zeroconf services on the local network."""
    # @dataclass
    # class ServiceData():
    #     """Data associated with a Zeroconf service."""

    @dataclass
    class ZeroconfService():
        """Discovered Zeroconf service."""
        name: str
        type: str
        port: int | None
        addresses: list[str]
        properties: dict

    def __init__(self, types: list[str] | None = None) -> None:
        self._zeroconf = Zeroconf()
        self._types = types if types else ["_http._tcp.local."]
        self._browser: ServiceBrowser
        self._found_services: list[ZeroconfBrowser.ZeroconfService] = []

    def _state_handler(self, zeroconf: Zeroconf, service_type: str,
                       name: str, state_change: ServiceStateChange) -> None:
        """Handles state changes for discovered services.

        Args:
            zeroconf (Zeroconf): 
                The Zeroconf instance.
            service_type (str): 
                The type of the service that changed state.
            name (str): 
                The name of the service that changed state.
            state_change (ServiceStateChange): 
                The type of state change (added, removed, updated).
        """
        if state_change.name == ServiceStateChange.Removed:
            return
        info = zeroconf.get_service_info(service_type, name)
        if info:
            service = ZeroconfBrowser.ZeroconfService(
                info.name,
                info.type,
                info.port,
                info.parsed_scoped_addresses(),
                info.properties
            )
            if service.name not in [s.name for s in self._found_services]:
                self._found_services.append(service)

    def is_alive(self) -> bool:
        return self._browser.is_alive()

    def start(self) -> bool:
        """Starts the Zeroconf service browser.

        Returns:
            bool: 
                True if the browser was started successfully,
                False if it was already running.
        """
        if hasattr(self, "_browser") and self.is_alive():
            logger.info("The browser has already started")
            return False
        self._browser = ServiceBrowser(
            self._zeroconf,
            self._types,
            handlers=[self._state_handler]
        )
        return True

    def stop(self) -> bool:
        """Stops the Zeroconf service browser.

        Returns:
            bool: 
                True if the browser was stopped successfully,
                False if it was not running.
        """
        if hasattr(self, "_browser") and self.is_alive():
            self._browser.cancel()
            return True
        logger.info("The browser is not currently running")
        return False

    def get_services(self) -> list["ZeroconfBrowser.ZeroconfService"]:
        """Returns a list of discovered Zeroconf services.

        Returns:
            A list of ZeroconfService objects.
        """
        return self._found_services

    def clear_services(self) -> None:
        """Clears the list of discovered Zeroconf services."""
        self._found_services.clear()
