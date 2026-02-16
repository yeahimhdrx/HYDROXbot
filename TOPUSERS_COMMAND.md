# 🏆 Top Users Leaderboard Command

## Overview
The `/topusers` command displays a beautiful, professional leaderboard of the top 30 most active members by voice time.

## Usage

### Basic Command
```
/topusers
```
Shows the top 10 users (page 1)

### With Pagination
```
/topusers page:1    (Ranks 1-10)
/topusers page:2    (Ranks 11-20)
/topusers page:3    (Ranks 21-30)
```

## Features

### 🎨 Modern Design
- Beautiful embed layout
- Color-coded rankings
- Visual progress bars
- Professional styling

### 🥇 Medal System
- 🥇 Gold medal for #1
- 🥈 Silver medal for #2
- 🥉 Bronze medal for #3
- Numbered ranks for #4-30

### 📊 Progress Bars
Each user has a visual progress bar showing their activity relative to the top user:
```
████████░░  80% of top user
█████░░░░░  50% of top user
██░░░░░░░░  20% of top user
```

### 🏷️ Tag Indicators
- Shows 🏷️ icon for users with HDRX tag
- Easy to identify tagged members
- Encourages tag adoption

### 📄 Pagination
- 10 users per page
- Up to 3 pages (30 users total)
- Navigation hints included
- Shows current page and total pages

## Example Output

```
🏆 HYDROX Voice Activity Leaderboard

🥇 @TopPlayer 🏷️
⏱️ 250h 30m • ██████████

🥈 @SecondPlace 🏷️
⏱️ 200h 15m • ████████░░

🥉 @ThirdPlace
⏱️ 180h 45m • ███████░░░

#4 @FourthPlace 🏷️
⏱️ 150h 20m • ██████░░░░

#5 @FifthPlace
⏱️ 120h 10m • █████░░░░░

... (continues to rank 10)

📊 Statistics: Total Active Members: 45
📄 Page: 1 of 3
🏷️ Legend: 🏷️ = Has HDRX Tag

📖 Navigation
Use /topusers page:2 to see more

HYDROX Community • Showing ranks 1-10
```

## Information Displayed

### For Each User
1. **Rank** - Position with medal or number
2. **User Mention** - Clickable @mention
3. **Tag Status** - 🏷️ if they have HDRX tag
4. **Voice Time** - Formatted as "Xh Ym"
5. **Progress Bar** - Visual representation

### In Footer
- Total active members count
- Current page / total pages
- Legend explaining icons
- Navigation instructions
- Rank range being shown

## Smart Features

### Handles Missing Users
If a user left the server:
```
#15 *Left Server*
⏱️ 45h 30m • ███░░░░░░░
```

### Dynamic Progress Bars
- Automatically scales to top user
- Top user always shows full bar (100%)
- Others show relative percentage
- Visual and intuitive

### Responsive Pagination
- Only shows navigation if multiple pages exist
- Tells you when you're on the last page
- Clear instructions for next page

## Use Cases

### For Members
- See their ranking
- Compare with others
- Track progress
- Motivation to be active

### For Staff
- Identify most active members
- Reward top contributors
- Monitor community engagement
- Recognize dedication

### For Community
- Friendly competition
- Engagement tracking
- Recognition system
- Community building

## Technical Details

### Performance
- Efficient database queries
- Pagination for large datasets
- Deferred reply to prevent timeout
- Handles errors gracefully

### Data Source
- Pulls from `voice_activity` table
- Only shows users with voice time > 0
- Ordered by total minutes descending
- Real-time data

### Permissions
- Available to all members
- No special permissions needed
- Public command (not ephemeral)
- Can be used in any channel

## Visual Elements

### Colors
- Blue (#5865f2) - Professional and modern
- Matches Discord's brand colors
- Easy on the eyes

### Icons
- 🏆 Trophy for title
- 🥇🥈🥉 Medals for top 3
- 🏷️ Tag indicator
- ⏱️ Time indicator
- 📊 Statistics
- 📄 Page number
- 📖 Navigation

### Layout
- Clean and organized
- Easy to scan
- Information hierarchy
- Professional appearance

## Comparison with Other Bots

### Better Than Standard Leaderboards
✅ Visual progress bars
✅ Medal system
✅ Tag indicators
✅ Beautiful embeds
✅ Pagination
✅ Server icon thumbnail
✅ Formatted time display
✅ Navigation hints

### Professional Features
- Guild icon as thumbnail
- Timestamp on embed
- Footer with context
- Color-coded design
- Responsive layout

## Tips for Users

### Climbing the Leaderboard
1. Spend time in voice channels
2. Add the HDRX tag for recognition
3. Stay active consistently
4. Check your progress with `/stats`

### Understanding Rankings
- Rankings update in real-time
- Based on total voice time
- Includes all-time activity
- Fair and transparent

## Admin Notes

### Customization Options
To modify the leaderboard:
- Edit `commands/topusers.js`
- Change `itemsPerPage` for different page sizes
- Modify colors in embed
- Adjust progress bar length

### Database
- Uses existing `voice_activity` table
- No additional setup needed
- Efficient queries
- Scales well

## Future Enhancements

Possible additions:
- Weekly/monthly leaderboards
- Role-specific leaderboards
- Export to image
- Personal rank lookup
- Trend indicators (↑↓)

## Summary

The `/topusers` command provides a **professional, engaging leaderboard** that:
- Motivates members to be active
- Recognizes top contributors
- Looks beautiful and modern
- Works flawlessly with pagination
- Integrates with your existing system

Try it now: `/topusers`
