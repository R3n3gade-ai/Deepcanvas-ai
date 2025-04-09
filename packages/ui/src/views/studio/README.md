# Studio Page - Deep Canvas Video Generator Integration

This page integrates Deep Canvas Video Generator for AI video generation capabilities in Flowise.

## Features

### Text-to-Video Generation

-   Generate videos from text descriptions
-   Select from multiple video styles (Realistic, Cinematic, Anime, 3D Animation, Artistic)
-   Control video duration (3-6 seconds)
-   Choose quality settings

### Image-to-Video Generation

-   Upload images to animate into videos
-   Add optional text descriptions to guide the animation
-   Select animation styles including Live2D for character animation
-   Drag-and-drop image upload support

### Video Library

-   Browse and manage generated videos
-   Preview videos with playback controls
-   Download generated videos
-   Delete unwanted videos

## Setup Instructions

1. Ensure the Deep Canvas API key is set in the `.env` file:

    ```
    DEEP_CANVAS_API_KEY=your_api_key_here
    ```

2. Set the video storage directory in the `.env` file:

    ```
    VIDEO_STORAGE_DIR=path/to/video/storage
    ```

3. Restart the Flowise server to apply the changes.

## API Documentation

The Studio page uses the following API endpoints:

-   `POST /api/video/text-to-video` - Generate video from text
-   `POST /api/video/image-to-video` - Generate video from image
-   `GET /api/video/status/:jobId` - Check video generation status
-   `GET /api/video/user/:userId` - Get user's generated videos
-   `DELETE /api/video/:videoId` - Delete a generated video
-   `GET /api/video/videos/*` - Serve static video files

## Deep Canvas Video Generator API Reference

For more details on the Deep Canvas Video Generator API, refer to the official documentation:
https://www.deepcanvas.ai/platform/document/video_generation

## Troubleshooting

-   If videos fail to generate, check the server logs for API errors
-   Ensure the API key is valid and has access to the Deep Canvas Video Generator
-   Check that the storage directory is writable by the server
-   For image-to-video issues, ensure the image is in a supported format (JPEG, PNG, GIF, WebP)
