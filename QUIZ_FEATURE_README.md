# Glasses Quiz Feature

## Overview
A new interactive quiz feature has been added to the optics store that helps users find the perfect glasses based on their needs, lifestyle, and preferences.

## Features

### Quiz Questions
The quiz includes 4 main questions:
1. **Primary Usage** - What is the main purpose (computer work, reading, outdoor activities, general vision improvement)
2. **Lifestyle** - How would you describe your lifestyle (active/sports, professional, casual, outdoor/adventurous)
3. **Personal Preference** - What matters most to you (comfort, style, functionality, maintenance)
4. **Age Group** - Which age category you fall into (18-30, 31-50, 51-65, 65+)

### Recommendation Categories
Based on the quiz answers, users get recommendations for:
- **نظارات الكمبيوتر** (Computer Glasses) - For screen protection and blue light filtering
- **نظارات القراءة** (Reading Glasses) - For comfortable reading and studying
- **النظارات الشمسية** (Sunglasses) - For outdoor activities and UV protection
- **النظارات الطبية** (Medical Glasses) - For vision improvement and prescription needs
- **العدسة اللاصقة** (Contact Lenses) - For active lifestyle and comfort
- **مستلزمات العناية** (Eye Care Products) - For eye care and maintenance

### Scoring System
Each answer option has a weighted score for different categories. The system calculates the total score for each category and recommends the one with the highest score.

## Implementation

### Files Added/Modified
1. **`components/shared/quiz/glasses-quiz.tsx`** - Main quiz component
2. **`app/(root)/quiz/page.tsx`** - Quiz page
3. **`lib/data.ts`** - Added quiz slide to carousel data

### Carousel Integration
The quiz is accessible as a slide in the home page carousel with:
- Title: "اختبار اختيار النظارات المناسبة"
- Button: "ابدأ الاختبار"
- URL: `/quiz`

### User Experience
1. User clicks on the quiz slide in the carousel
2. They are taken to the quiz page
3. They answer 4 questions with visual options
4. Progress bar shows completion status
5. Results show the recommended category with description
6. User can view recommended products or retake the quiz

### Responsive Design
- Mobile-friendly interface
- Touch-friendly buttons
- Responsive grid layout
- Arabic RTL support

## Technical Details

### Components Used
- `Card`, `CardContent`, `CardHeader`, `CardTitle` - For quiz layout
- `Button` - For answer options and navigation
- `Progress` - For showing quiz progress
- `Badge` - For displaying score results
- Lucide React icons for visual elements

### State Management
- React useState for quiz state
- Local state for answers and scores
- No external state management needed

### Styling
- Tailwind CSS for styling
- Consistent with store design
- Arabic font support (Cairo)
- RTL layout support

## Future Enhancements
- Add more detailed questions
- Include product-specific recommendations
- Add user preference saving
- Implement analytics tracking
- Add social sharing of results
