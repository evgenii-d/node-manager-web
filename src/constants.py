from enum import Enum
from pathlib import Path

LOG_FORMAT = "[%(levelname)s] %(module)s: %(message)s"


class AppDir(Enum):
    BASE = Path(__file__).parent.parent/"resources"
    STATIC = BASE/"static"
    TEMPLATES = BASE/"templates"


class ZeroconfBrowserCommand(Enum):
    START = "start"
    STOP = "stop"
    RESTART = "restart"
