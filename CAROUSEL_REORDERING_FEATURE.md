# Carousel Reordering Feature

## Overview
Added drag-and-drop functionality to the admin settings page that allows administrators to reorder carousel slides easily.

## Features

### Drag-and-Drop Interface
- **Visual Drag Handle**: Each carousel item now has a grip icon (⋮⋮) that users can click and drag
- **Smooth Animations**: Items smoothly animate during drag operations with visual feedback
- **Real-time Reordering**: Changes are applied immediately as items are dragged and dropped

### User Experience
- **Intuitive Interface**: Clear visual indicators show which items can be dragged
- **Hover Effects**: Drag handles have hover states to indicate interactivity
- **Visual Feedback**: Items become semi-transparent while being dragged
- **Arabic Instructions**: Helpful text in Arabic explains how to use the feature

### Technical Implementation

#### Libraries Used
- `@dnd-kit/core` - Core drag-and-drop functionality
- `@dnd-kit/sortable` - Sortable list components
- `@dnd-kit/utilities` - Utility functions for transforms and styling

#### Components Added
1. **SortableCarouselItem** - Individual draggable carousel item component
2. **DndContext** - Wraps the carousel items list
3. **SortableContext** - Provides sortable functionality to child items

#### Key Features
- **Sensors**: Supports both mouse/touch and keyboard navigation
- **Collision Detection**: Uses `closestCenter` for accurate drop detection
- **Strategy**: Uses `verticalListSortingStrategy` for vertical list reordering
- **Unique IDs**: Each item has a unique identifier for proper tracking

### How It Works

1. **Drag Initiation**: User clicks and holds the grip icon (⋮⋮)
2. **Visual Feedback**: Item becomes semi-transparent and shows shadow
3. **Drag Movement**: Item follows cursor with smooth animation
4. **Drop Detection**: System detects valid drop zones
5. **Reordering**: Items are automatically reordered using `arrayMove`
6. **State Update**: Carousel items array is updated with new order

### Admin Interface

#### Location
- **Path**: `/admin/settings`
- **Section**: "إعدادات الكاروسيل" (Carousel Settings)

#### Instructions
- Clear Arabic text: "اسحب العناصر باستخدام أيقونة السحب (⋮⋮) لإعادة ترتيبها"
- Translation: "Drag items using the drag icon (⋮⋮) to reorder them"

#### Visual Elements
- **Grip Icon**: `GripVertical` from Lucide React
- **Hover States**: Gray background on hover
- **Cursor Changes**: `cursor-grab` and `cursor-grabbing`
- **Drag State**: 50% opacity and shadow when dragging

### Benefits

1. **Improved UX**: Much easier than manually editing array indices
2. **Visual Feedback**: Users can see exactly what they're reordering
3. **Error Prevention**: No risk of breaking the carousel with invalid indices
4. **Accessibility**: Supports keyboard navigation for accessibility
5. **Mobile Friendly**: Works on touch devices

### Future Enhancements
- Add animation preview of the new order
- Implement undo/redo functionality
- Add bulk reordering options
- Include drag-and-drop for other admin sections

## Usage

1. Navigate to `/admin/settings`
2. Scroll to the "إعدادات الكاروسيل" section
3. Look for the grip icon (⋮⋮) next to each carousel item
4. Click and drag the grip icon to reorder items
5. Release to drop the item in the new position
6. Save settings to apply changes

The carousel order will be updated immediately on the home page after saving.
