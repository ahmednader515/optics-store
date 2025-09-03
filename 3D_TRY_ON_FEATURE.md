# 3D Virtual Try-On Feature

## Overview

This feature adds real 3D glasses try-on functionality to the optics e-commerce store, replacing the flat PNG/SVG overlay with actual 3D models (.glb/.gltf) rendered in WebGL using Three.js.

## Features

### 3D Try-On
- **Real 3D Models**: Renders .glb/.gltf glasses models anchored to the user's face
- **Face Tracking Integration**: Uses existing MediaPipe face tracking for position, rotation, and scale
- **Head Movement**: Follows head position, rotation (yaw/pitch/roll), and scale based on inter-eye distance
- **Natural Arm Reveal**: Arms are revealed/hidden naturally when the head turns
- **Occlusion Mask**: Face mesh occlusion for proper 3D model clipping behind the head
- **Mobile Optimized**: Runs smoothly on mobile devices with performance optimizations

### Admin Upload System
- **3D Model Upload**: Upload .glb/.gltf files via UploadThing (up to 50MB)
- **Calibration Controls**: Scale, offset (x/y/z), and rotation offset (x/y/z) controls
- **Inline Preview**: 3D preview with orbit controls to help position the model
- **Database Storage**: All calibration parameters stored in the database

### Backward Compatibility
- **Fallback System**: If no 3D model exists, continues showing the old 2D overlay
- **Progressive Enhancement**: 3D try-on is an enhancement, not a replacement

### Performance Optimizations
- **Lazy Loading**: All 3D libraries are lazy-loaded on the client
- **Error Boundaries**: Graceful error handling with fallback UI
- **Mobile Detection**: Automatic performance adjustments for mobile devices
- **Frame Rate Limiting**: Reduced FPS on low-end devices
- **CPU/GPU Delegation**: Automatic delegate selection based on device capabilities

## Technical Implementation

### Database Schema
```sql
-- New fields added to Product model
model3dUrl         String?     -- URL to .glb/.gltf file
model3dScale       Float?      -- Scale multiplier (default: 1.0)
model3dOffsetX     Float?      -- X position offset (default: 0.0)
model3dOffsetY     Float?      -- Y position offset (default: 0.0)
model3dOffsetZ     Float?      -- Z position offset (default: 0.0)
model3dRotationX   Float?      -- X rotation offset in degrees (default: 0.0)
model3dRotationY   Float?      -- Y rotation offset in degrees (default: 0.0)
model3dRotationZ   Float?      -- Z rotation offset in degrees (default: 0.0)
```

### File Structure
```
components/shared/
├── 3d-model-preview.tsx          # Admin 3D model preview with calibration
├── 3d-virtual-try-on.tsx         # Main 3D try-on component
├── lazy-3d-try-on.tsx            # Lazy-loaded wrapper with error handling
└── product/try-on-dialog.tsx     # Updated dialog supporting both 2D and 3D

app/admin/products/
└── product-form.tsx              # Updated with 3D model upload UI

app/api/uploadthing/
└── core.ts                       # Updated to handle .glb/.gltf files
```

### Key Components

#### 1. Model3DPreview
- 3D model preview with orbit controls
- Real-time calibration controls (scale, offset, rotation)
- Used in admin product create/edit pages

#### 2. VirtualTryOn3D
- Main 3D try-on component
- Integrates with existing face tracking
- Handles camera controls and face detection
- Performance optimizations for mobile

#### 3. Lazy3DTryOn
- Lazy-loaded wrapper component
- Error boundary with fallback UI
- Loading states and error handling

#### 4. TryOnDialog
- Updated to support both 2D and 3D try-on
- Automatic fallback to 2D if no 3D model
- Dynamic button text based on available features

## Usage

### For Admins

1. **Upload 3D Model**:
   - Go to Admin → Products → Create/Edit
   - Scroll to "النموذج ثلاثي الأبعاد" section
   - Click "Upload" and select .glb/.gltf file
   - Wait for upload to complete

2. **Calibrate Model**:
   - Use the 3D preview to position the model
   - Adjust scale, offset, and rotation controls
   - Real-time preview updates as you adjust
   - Click "إعادة تعيين" to reset to defaults

3. **Save Product**:
   - All calibration parameters are saved automatically
   - Product now supports 3D try-on

### For Users

1. **Access 3D Try-On**:
   - Visit any product with a 3D model
   - Click "جرّب النظارات ثلاثي الأبعاد" button
   - Allow camera access when prompted

2. **Use 3D Try-On**:
   - Position your face in the camera view
   - The 3D glasses will automatically track your face
   - Move your head to see different angles
   - Use camera controls to switch cameras or stop

## Performance Considerations

### Mobile Optimization
- **Automatic Detection**: Detects mobile devices and low-end hardware
- **CPU Delegation**: Uses CPU instead of GPU on low-end devices
- **Frame Rate Limiting**: Reduces to 15 FPS on mobile devices
- **Frame Skipping**: Skips every other frame on very low-end devices
- **Reduced Confidence Thresholds**: Lower detection thresholds for better performance

### Loading Optimization
- **Lazy Loading**: 3D libraries only load when needed
- **Code Splitting**: Separate bundle for 3D components
- **Error Boundaries**: Graceful degradation on errors
- **Loading States**: Clear feedback during loading

### File Size Optimization
- **Upload Limits**: 50MB limit for 3D models
- **Compression**: Recommend compressed .glb files
- **Low-Poly Models**: Optimize models for mobile use

## Browser Support

### Required Features
- **WebGL**: Required for 3D rendering
- **MediaStream API**: Required for camera access
- **ES6 Modules**: Required for dynamic imports

### Supported Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Mobile Support
- iOS Safari 13+
- Chrome Mobile 80+
- Samsung Internet 12+

## Troubleshooting

### Common Issues

1. **Camera Not Working**:
   - Check browser permissions
   - Ensure HTTPS (required for camera access)
   - Try different browser

2. **3D Model Not Loading**:
   - Check file format (.glb/.gltf only)
   - Verify file size (under 50MB)
   - Check network connection

3. **Poor Performance**:
   - Close other browser tabs
   - Use Chrome for best performance
   - Check if device supports WebGL

4. **Face Not Detected**:
   - Ensure good lighting
   - Position face in center of camera
   - Check camera permissions

### Error Messages
- **"Failed to initialize face detection"**: Browser compatibility issue
- **"Failed to access camera"**: Permission or hardware issue
- **"Error loading 3D model"**: File format or network issue

## Future Enhancements

### Planned Features
- **Multiple Model Support**: Support for different colors/styles
- **Advanced Occlusion**: Better face mesh occlusion
- **AR Integration**: WebXR support for true AR
- **Model Optimization**: Automatic model compression
- **Analytics**: Track try-on usage and conversions

### Technical Improvements
- **Web Workers**: Move face detection to background thread
- **WebAssembly**: Optimize face detection performance
- **Progressive Loading**: Load model parts progressively
- **Caching**: Cache models and calibration data

## Development Notes

### Adding New 3D Models
1. Create/obtain .glb/.gltf file
2. Optimize for web (low-poly, compressed)
3. Upload via admin interface
4. Calibrate position and scale
5. Test on various devices

### Customizing Calibration
- Default values work for most models
- Fine-tune based on model origin point
- Consider different face sizes
- Test on various devices

### Performance Monitoring
- Monitor frame rates on different devices
- Track loading times
- Monitor error rates
- User feedback on performance

## Security Considerations

### File Upload Security
- File type validation (.glb/.gltf only)
- File size limits (50MB)
- Virus scanning (if available)
- Secure file storage

### Privacy
- Camera access is local only
- No face data is stored or transmitted
- All processing happens in browser
- Clear privacy policy for camera usage

## Conclusion

The 3D Virtual Try-On feature provides a modern, engaging way for customers to try on glasses virtually. With proper optimization and fallback systems, it works across a wide range of devices while maintaining excellent performance and user experience.
