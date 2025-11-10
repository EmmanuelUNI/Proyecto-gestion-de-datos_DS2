FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY ../comun ./comun
COPY main.py .

# Instala dependencias
COPY ../requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Crea usuario no root
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser


EXPOSE 8005


HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8005/health')" || exit 1


CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8005"]