from smolagents import DuckDuckGoSearchTool
from .base import BaseTool, ToolConfig

class DuckDuckGoTool(BaseTool):
    def __init__(self):
        config = ToolConfig(name="DuckDuckGoSearch", version="1.0.0")
        super().__init__(config)
        self.tool_instance = DuckDuckGoSearchTool()

    def execute(self, query: str):
        return self.tool_instance.run(query)
