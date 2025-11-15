# AIMockHub

Lightweight toolkit for creating, running, and sharing AI model mocks and integration stubs for development and testing.

## Features
- Define mock endpoints for LLMs and AI services
- Record and replay mock responses
- Support for JSON/YAML scenario files
- CLI and simple web UI for inspection
- Easy integration into CI pipelines

## Quick Start
1. Clone the repo:
    ```bash
    git clone https://example.com/your/AIMockHub.git
    cd AIMockHub
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
    or
    ```bash
    pip install -r requirements.txt
    ```
3. Start the mock server:
    ```bash
    npm start
    ```
    or
    ```bash
    python -m aimockhub.server
    ```

## Usage
- Place scenario files in ./scenarios (JSON or YAML).
- Point your app to the mock server base URL (default http://localhost:8000).
- Use the web UI at /ui to view and manage scenarios.

## Development
- Follow the repository linting a
nd testing rules.
- Run tests:
  ```bash
  npm test
  ```
  or
  ```bash
  pytest
  ```

## Contributing
- Open issues for bugs or feature requests.
- Submit PRs against main; include tests and documentation.

## License
MIT — see LICENSE file.

## Contact
Project repository: https://github.com/bhavesh4201/AIMockHub
Email : bhaveshkoli442001@gmail.com
