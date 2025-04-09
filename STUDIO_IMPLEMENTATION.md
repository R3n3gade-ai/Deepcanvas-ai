# Studio Page Implementation Guide

This document outlines the implementation of the Studio page in Flowise, which integrates the Deep Canvas Video Generator for AI video generation.

## Implementation Overview

The Studio page has been implemented with the following components:

1. **Backend API Integration**

    - Deep Canvas Video Generator API client
    - Video generation controller
    - File storage utilities
    - API routes for video generation

2. **Frontend Components**
    - Text-to-Video generator
    - Image-to-Video generator
    - Video library
    - Video preview with playback controls
    - Generation status monitoring

## Deployment Steps

1. **Environment Setup**

    - Add the Deep Canvas API key to the `.env` file:
        ```
        DEEP_CANVAS_API_KEY=your_api_key_here
        VIDEO_STORAGE_DIR=path/to/video/storage
        ```

2. **Directory Creation**

    - Ensure the following directories exist:
        ```
        mkdir -p uploads
        mkdir -p storage/videos
        mkdir -p logs
        ```

3. **Install Dependencies**

    - Install required npm packages:
        ```
        npm install multer form-data uuid winston
        ```

4. **Start the Server**

    - Start the Flowise server:
        ```
        npm start
        ```

5. **Access the Studio Page**
    - Navigate to `http://localhost:3000/studio` in your browser

## API Endpoints

The following API endpoints have been implemented:

-   `POST /api/video/text-to-video` - Generate video from text
-   `POST /api/video/image-to-video` - Generate video from image
-   `GET /api/video/status/:jobId` - Check video generation status
-   `GET /api/video/user/:userId` - Get user's generated videos
-   `DELETE /api/video/:videoId` - Delete a generated video
-   `GET /api/video/videos/*` - Serve static video files

## File Structure

```
packages/
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── videoGeneration.controller.js
│   │   ├── routes/
│   │   │   └── video-generation.ts
│   │   ├── services/
│   │   │   └── minimax-video-api.js
│   │   └── utils/
│   │       ├── fileStorage.js
│   │       ├── logger.js
│   │       └── videoSettings.js
└── ui/
    ├── src/
    │   ├── api/
    │   │   └── videoGenerationService.js
    │   └── views/
    │       └── studio/
    │           ├── index.js
    │           ├── components/
    │           │   ├── TextToVideoGenerator.js
    │           │   ├── ImageToVideoGenerator.js
    │           │   ├── VideoLibrary.js
    │           │   ├── VideoPreview.js
    │           │   └── GenerationStatus.js
    │           └── README.md
```

## Testing

1. **Text-to-Video Generation**

    - Enter a descriptive prompt
    - Select a video style
    - Adjust duration and quality settings
    - Click "Generate Video"
    - Monitor generation status
    - Preview and download the generated video

2. **Image-to-Video Generation**

    - Upload an image
    - Add an optional description
    - Select an animation style
    - Click "Generate Video"
    - Monitor generation status
    - Preview and download the generated video

3. **Video Library**
    - View previously generated videos
    - Play videos in the preview player
    - Download videos
    - Delete unwanted videos

## Troubleshooting

-   Check server logs in the `logs` directory
-   Verify API key validity
-   Ensure storage directories are writable
-   Check network connectivity to MiniMax API
-   Verify file upload permissions

## Future Enhancements

-   Add support for longer video durations
-   Implement video editing capabilities
-   Add more animation styles
-   Implement batch processing
-   Add social media sharing options
-   Implement user preferences for default settings
