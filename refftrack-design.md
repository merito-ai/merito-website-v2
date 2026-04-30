
# Reftrack Figma Design Report (Deep Breakdown)

## Overview
This is a step-by-step, section-by-section breakdown of the "Reftrack" Figma design (node 2313:3340). Use this as a spoon-fed guide for implementing the page.

---

## 1. Navigation/Header
**Purpose:** Top navigation for site-wide access and branding.

- **Layout:**
   - Horizontal bar, full width, fixed or sticky.
   - Left: Merito logo (image, 121x60px)
   - Center: Nav menu (multiple items, e.g. About, Tools, Insights)
   - Right: CTA button (Component 192, e.g. "Get Started")
- **Components:**
   - Logo image
   - Nav links (map to routes)
   - CTA button (primary style)
- **Styling:**
   - Padding: ample vertical/horizontal
   - Font: Poppins, semi-bold for menu, bold for CTA
   - Responsive: collapse to hamburger on mobile

---

## 2. Hero Section
**Purpose:** Immediate brand impact and value statement.

- **Layout:**
   - Large background/banner image (1300x422px)
   - Centered overlay content
      - Eyebrow: "REFTRACK" (small, uppercase, semi-bold)
      - Heading: "Driven by Purpose. Built for Impact." (large, bold)
      - Subtext: "Learn how Merito..." (medium, regular)
- **Components:**
   - Image (background or <img>)
   - Text blocks (eyebrow, heading, subtext)
- **Styling:**
   - White or light text on dark overlay
   - Spacing: generous vertical gaps
   - Font sizes: Eyebrow ~24px, Heading ~48px, Subtext ~20px

---

## 3. Value Proposition Section
**Purpose:** Explain the core benefit of RefTrack.

- **Layout:**
   - Two columns (desktop):
      - Left: Text
         - Title: "Reduce Hiring Risks" (bold, large)
         - Description: Explains RefTrack's value (regular)
         - CTA button (Component 325, e.g. "Get Started")
      - Right: Supporting image (835x471px)
- **Components:**
   - Title, description, button
   - Image (illustration or screenshot)
- **Styling:**
   - Use grid/flex for layout
   - Button: prominent, primary color
   - Responsive: stack columns on mobile

---

## 4. Solutions Grid (Feature Cards)
**Purpose:** Showcase key features/steps of RefTrack.

- **Layout:**
   - Section title: "Solutions to aid your hiring objectives"
   - Description: Supporting text
   - 4 cards in a row (desktop), stacked (mobile)
      - Each card:
         - Icon (centered, 100x100px)
         - Card heading (semi-bold, 16px)
         - Card description (regular, 16px)
- **Components:**
   - Card (reusable): icon, heading, description
   - Icons: SVG or image (Notepad, Monitoring, Graph, People/Mail)
- **Styling:**
   - Card: white bg, subtle shadow, rounded corners, padding
   - Icon: colored background or border for emphasis
   - Spacing: equal gaps between cards

---

## 5. Why Choose Ref-Track? (Feature Highlights)
**Purpose:** Reinforce trust and unique selling points.

- **Layout:**
   - Section title: "Why choose Ref-Track?"
   - Subtitle: "Ref-Track is making your hiring faster and risk free!"
   - 4 feature highlights (2x2 grid on desktop)
      - Each feature:
         - Icon (98x98px)
         - Feature title (semi-bold, 20-24px)
         - Description (regular, 16px)
- **Components:**
   - Feature block: icon, title, description
   - Icons: Handshake, Magnifying Glass, Plug, Save
- **Styling:**
   - Use color backgrounds or accents for icons
   - Grid/flex for layout
   - Responsive: stack on mobile

---

## 6. Get Started Section (CTA)
**Purpose:** Prompt user to engage/contact.

- **Layout:**
   - Title: "Get started with Merito"
   - Description: "Help us with what you are looking for..."
   - CTA button (Component 336, e.g. "Contact Us")
- **Components:**
   - Title, description, button
- **Styling:**
   - Centered content
   - Button: large, primary color
   - Spacing: ample padding above/below

---

## 7. Footer
**Purpose:** Site-wide info, links, and contact.

- **Layout:**
   - Left: About Merito (logo, description)
   - Center: Links (Company, Tools, Insights)
   - Right: Contact (email, phone), Social icons
   - Bottom: Copyright
- **Components:**
   - Logo, text, nav links, contact info, social icons
- **Styling:**
   - Dark background, light text
   - Icons: SVG, spaced evenly
   - Responsive: stack columns on mobile

---

## 8. General Design/Implementation Notes
- **Typography:**
   - Font: Poppins throughout
   - Headings: SemiBold/Bold, large sizes
   - Body: Regular, 16-20px
- **Color:**
   - Use Figma palette for backgrounds, accents, buttons
- **Spacing:**
   - Consistent section padding (min 48px top/bottom)
   - Equal gaps between cards/features
- **Responsiveness:**
   - All sections adapt to mobile (stacked, centered)
- **Accessibility:**
   - Use semantic HTML (header, nav, main, section, footer)
   - Alt text for images/icons
   - Sufficient color contrast
- **Componentization:**
   - Make cards, feature blocks, nav, footer as reusable components
   - Pass content as props for flexibility

---

## 9. Implementation Steps (Spoon-fed)
1. **Create layout structure:** header, main, footer
2. **Build header/nav:** logo, menu, CTA
3. **Add hero section:** background image, overlay text
4. **Implement value prop section:** 2-column layout, text + image, CTA
5. **Build solutions grid:** reusable card component, map over features
6. **Add "Why Choose" section:** 2x2 grid, feature block component
7. **Insert get started CTA:** centered, button
8. **Build footer:** logo, links, contact, socials
9. **Style for desktop, then mobile:** use Figma spacing, font sizes
10. **Test accessibility:** semantic tags, alt text, contrast

---

*End of deep breakdown.*
