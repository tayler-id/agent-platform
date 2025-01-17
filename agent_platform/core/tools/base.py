from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
from smolagents import tool

class ToolConfig(BaseModel):
    """Base configuration for tools"""
    name: str = Field(..., description="Unique name of the tool")
    description: str = Field(..., description="Description of the tool's purpose")
    version: str = Field("1.0.0", description="Version of the tool")
    parameters: Dict[str, Any] = Field(default_factory=dict,
                                     description="Configuration parameters for the tool")
    metadata: Dict[str, Any] = Field(default_factory=dict,
                                   description="Additional metadata for the tool")

class BaseTool:
    """Base class for all tools"""
    
    def __init__(self, config: ToolConfig):
        self.config = config
        self._register_tool()
        
    def _register_tool(self):
        """Register the tool with the smolagents framework"""
        @tool(name=self.config.name, 
              description=self.config.description)
        def tool_wrapper(**kwargs):
            return self.execute(**kwargs)
            
        self.tool_instance = tool_wrapper
        
    def execute(self, **kwargs) -> Any:
        """Execute the tool's main functionality"""
        raise NotImplementedError("Tools must implement execute method")
        
    def validate_input(self, input_data: Dict[str, Any]) -> bool:
        """Validate input data before execution"""
        return True
        
    def get_status(self) -> Dict[str, Any]:
        """Get current status of the tool"""
        return {
            "name": self.config.name,
            "status": "active",
            "last_executed": None
        }
        
    def shutdown(self):
        """Clean up resources when tool is no longer needed"""
        pass
