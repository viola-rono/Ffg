# Embr Fluttur – Design Document

## Brand Identity

**Primary Gradient:** Red (#E8344E) → Orange (#FF6B35)
**Accent:** Coral Pink (#FF4D6D)
**Background Light:** #FFFFFF
**Background Dark:** #0F0F0F
**Surface Light:** #F8F8F8
**Surface Dark:** #1A1A1A
**Text Primary Light:** #111111
**Text Primary Dark:** #F5F5F5
**Text Muted Light:** #888888
**Text Muted Dark:** #9A9A9A
**Border Light:** #EEEEEE
**Border Dark:** #2A2A2A

## Screen List

1. Welcome Screen
2. About Screen
3. Sign Up Screen
4. OTP Verification Screen
5. Login Screen
6. Forgot Password Screen
7. Home Feed Screen
8. Create Post Screen (modal)
9. Post Detail Screen
10. Explore Screen
11. Notifications Screen
12. User Profile Screen
13. Edit Profile Screen
14. Inbox (Conversations) Screen
15. Chat Screen
16. Settings Screen
17. Settings Sub-screens (Account, Privacy, Notifications, Appearance, Security, Storage, About)

## Primary Content and Functionality

### Home Feed
- Gradient header with greeting "Hello, [Username]" and search/message icons
- Horizontal stories row with circular avatars, red/orange gradient border, "Your Story" with + button
- Post composer card: avatar + "Share your thoughts..." input + Photo/Video/Feeling action buttons
- Post cards: avatar, username, timestamp, location, music tag, post text with hashtags, image/video, action bar (like, comment, share, save), view count

### Bottom Navigation
- Home (house icon), Friends/Explore (users icon), Create Post (large + button with gradient), Notifications (bell icon), Menu/Profile (menu icon)
- Active tab: red/primary color; inactive: gray

### Post Card Design
- White card with subtle shadow
- Avatar with online indicator (green dot)
- Username bold, timestamp + globe icon + location in muted text
- Music tag with music note icon
- Post text
- Image full-width with rounded corners
- View count bottom-right overlay
- Action bar: Heart, Comment, Share, Bookmark icons

## Key User Flows

1. **Onboarding:** Welcome → About → Sign Up → OTP → Home
2. **Login:** Login Screen → Home
3. **Create Post:** Tap + → Create Post modal → Select type → Add content → Post
4. **View Post:** Tap post → Post Detail with comments
5. **Message:** Tap message icon → Inbox → Tap conversation → Chat
6. **Profile:** Tap avatar/menu → Profile → Edit Profile

## Color Choices

- **Primary gradient:** linear-gradient(135deg, #E8344E 0%, #FF6B35 100%)
- **Story ring gradient:** linear-gradient(45deg, #E8344E, #FF6B35, #FF9500)
- **Tab active:** #E8344E
- **Create button:** radial gradient red-orange with white + icon
- **Online dot:** #22C55E
- **Like active:** #E8344E
- **Save active:** #E8344E
