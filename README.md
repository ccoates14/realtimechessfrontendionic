# Realtime Chess

## Docker Build

```bash
docker buildx build -t realtimechess:latest --load .
```

## Docker Run

```bash
docker run -p 3000:3000 -p 8080:8080 realtimechess:latest
```
