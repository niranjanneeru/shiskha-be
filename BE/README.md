# Shiksha


## Core Features

*   **Course Management**: Endpoints for managing courses and their content.
*   **AI-Powered Chatbot**: 
    *   Responds to user queries about course content using Retrieval Augmented Generation (RAG).
    *   Identifies user intent (e.g., asking for a summary, specific course question, or general question).
    *   Utilizes YouTube video transcripts for RAG context.
*   **AI Content Summarization**: Generates concise summaries of course transcripts.
*   **Payment Integration**: Includes `razorpay`, suggesting payment processing capabilities.
*   **Certificate Generation**: Includes `reportlab`, `qrcode`, and `PyPDF2`, suggesting PDF manipulation and QR code features.


## Prerequisites

*   Python 3.11.7 (as specified in `pyproject.toml`)
*   Poetry (for managing dependencies and running scripts)

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-project-directory>
    ```

2.  **Ensure Python 3.11.7 is active.** If you use `pyenv`:
    ```bash
    pyenv install 3.11.7
    pyenv local 3.11.7
    ```

3.  **Install project dependencies using Poetry:**
    ```bash
    poetry install
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the root directory by copying from a template if available (e.g., `.env.example`).
    Ensure the following are configured, especially for AI features:
    *   `OPENAI_API_KEY`: Your API key for OpenAI.
    *   `WEAVIATE_URL`: URL for your Weaviate instance.
    *   Database connection details.
    *   Redis connection details.
    *   Other necessary configurations as per `core/config.py` and `pydantic-settings`.

## Running the Application

The application can be run using Uvicorn, managed via Poetry scripts.

1.  **Start the FastAPI server:**
    The `pyproject.toml` defines a `start` script:
    ```bash
    poetry run start
    ```
    This likely runs `uvicorn main:app --host 0.0.0.0 --port 8000` or similar, as defined in your `main.py` or the script target. Check the `main:main` script or `main.py` for exact run command if needed.

2.  **Running Celery Worker (if used for background tasks):**
    Celery tasks (e.g., defined in `celery_task/`) require a separate worker process.
    ```bash
    poetry run celery -A <your_celery_app_instance> worker -l info 
    ```
    Replace `<your_celery_app_instance>` with the actual path to your Celery app object (e.g., `celery_task.app`).

## Database Migrations

Database migrations are handled by Alembic. The `pyproject.toml` defines a `migrate` script.

1.  **Run database migrations:**
    ```bash
    poetry run migrate
    ```
    This likely executes a command like `alembic upgrade head` via the `seed.migrate:main` script.

## Development

*   **Linters/Formatters**: The project uses `isort` with a "black" profile for import sorting. Consider integrating `black` for code formatting and a linter like `flake8` or `ruff`.
*   **Tests**: Run tests using:
    ```bash
    poetry run pytest
    ```

This README provides a comprehensive starting point. You can further customize it by adding more specific details about your application's architecture, API documentation (e.g., link to `/docs` or `/redoc` if enabled), or deployment instructions.

