from setuptools import setup, find_packages

setup(
    name="agent_platform",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "python-dotenv",
        "pydantic",
        "httpx",
        "python-multipart",
        "loguru",
    ],
)
