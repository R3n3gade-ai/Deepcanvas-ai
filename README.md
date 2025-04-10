<img width="100%" src="https://i.postimg.cc/XqLyHhb4/Black-White-Modern-AI-Company-Logo-3.png"></a>

# DeepCanvas AI

A customized version of Flowise with enhanced features for AI-powered content creation and management.

## Features

### Dashboard

-   AI chat interface similar to Google AI Studio
-   Connection to Gemini 2.0/2.5
-   Right column for chat history (Library)
-   Voice selection options
-   Output format options
-   Code execution capabilities
-   Function calling features
-   System instruction support
-   Markdown/HTML formatting for responses
-   Gradual typing effect for responses
-   "Thinking" indicator during processing

### Studio

-   AI video and image generator
-   Uses open source models for commercial SaaS
-   Integration with MiniMax for video generation
-   Upload box for images with prompt box to the right
-   Generated videos stored in rows under the generator

### App Builder

-   Visual interface for building AI applications
-   Drag-and-drop components
-   Integration with various AI models and services

### Tasks

-   Social media connections
-   Calendar scheduler
-   Media design features
-   Monthly calendar view as default

## Getting Started

### Prerequisites

-   [NodeJS](https://nodejs.org/en/download) >= 18.15.0
-   [PNPM](https://pnpm.io/installation) >= 9.0.0

### Installation

1. Clone the repository

    ```bash
    git clone https://github.com/R3n3gade-ai/Deepcanvas-ai.git
    cd Deepcanvas-ai
    ```

2. Install dependencies

    ```bash
    pnpm install
    ```

3. Build the project

    ```bash
    pnpm build
    ```

    If you encounter memory issues during build:

    ```bash
    export NODE_OPTIONS="--max-old-space-size=4096"
    pnpm build
    ```

4. Start the application

    ```bash
    cd packages/server/bin
    ./run start
    ```

    On Windows:

    ```bash
    cd packages/server/bin
    .\run start
    ```

5. Access the application at [http://localhost:3000](http://localhost:3000)

### Development Mode

For development with hot-reloading:

1. Create `.env` files:

    - In `packages/ui` folder with `VITE_PORT=8080`
    - In `packages/server` folder with `PORT=3000`

2. Run the development server:

    ```bash
    pnpm dev
    ```

3. Access the development server at [http://localhost:8080](http://localhost:8080)

## Project Structure

DeepCanvas AI has a modular architecture with the following components:

-   `server`: Node.js backend that handles API logic and services
-   `ui`: React frontend with custom components for the DeepCanvas AI interface
-   `components`: Third-party integrations and custom nodes
-   `api-documentation`: Auto-generated Swagger UI API documentation

## Configuration

### Authentication

To enable application-level authentication, add the following to the `.env` file in `packages/server`:

```
FLOWISE_USERNAME=your_username
FLOWISE_PASSWORD=your_password
```

### API Keys

The application uses the following API keys:

-   **Gemini API**: `AIzaSyDOnRHxuSmGIL7VygWXzWJsSrgEeQipGII` (pre-configured)
-   **MiniMax Video Generation**: Configure in the `.env` file:
    ```
    MINIMAX_API_KEY=your_minimax_api_key
    ```

### Environment Variables

You can configure various aspects of the application using environment variables in the `.env` file in the `packages/server` folder:

```
PORT=3000                      # Server port
DEEP_CANVAS_API_KEY=your_key   # Custom API key for DeepCanvas features
DATABASE_TYPE=sqlite           # Database type (sqlite, postgres, etc.)
DATABASE_PATH=~/.flowise       # Path to database
```

## Troubleshooting

### Common Issues

1. **Build Errors**: If you encounter memory issues during build, increase the Node.js heap size:

    ```bash
    export NODE_OPTIONS="--max-old-space-size=4096"
    pnpm build
    ```

2. **Server Won't Start**: Check if the port is already in use. You can change the port in the `.env` file.

3. **API Connection Issues**: Verify that your API keys are correctly configured in the `.env` file.

4. **UI Not Loading**: Make sure you've built the UI with `pnpm build` before starting the server.

### Getting Help

If you encounter any issues or have questions about DeepCanvas AI, please open an issue on the [GitHub repository](https://github.com/R3n3gade-ai/Deepcanvas-ai/issues).

## License

This project is licensed under the MIT License - see the LICENSE file for details.
