from typing import Any, Dict
from pydantic import BaseModel

class ToolConfig(BaseModel):
    name: str
    version: str

class BaseTool:
    def __init__(self, config: ToolConfig):
        self.config = config

    def execute(self, *args: Any, **kwargs: Dict[str, Any]) -> Any:
        raise NotImplementedError
