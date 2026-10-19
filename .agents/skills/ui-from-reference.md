# Skill: Build a UI Screen from a Reference Image

## Steps

### 1. Open the reference image
Read the reference image in docs/design/ that corresponds to this screen.
List every visible UI element, colour, and layout section.

### 2. Map to design tokens
Match every colour you see to a token from .agents/rules/10-design-system.md.
Note any colours that don't match a token (may need to be added).

### 3. Build the component tree
Sketch the component hierarchy:
```
<Page>
  <Sidebar>
  <MainContent>
    <Header>
    <Section>
      <Card>
        <ComponentA />
        <ComponentB />
```

### 4. Implement
- Start with layout (flexbox/grid).
- Apply design tokens via Tailwind utility classes or CSS variables.
- Add content and interactive states.
- Use components from frontend/src/components/ui/ where available.
- Use Lucide icons, not emoji or custom SVG unless the mascot robot.
- Render fractions with KaTeX (<BlockMath> or <InlineMath>), never plain slash text.

### 5. Check all three breakpoints
- 360px (mobile): no horizontal scroll, readable text, 44px touch targets.
- 768px (tablet): comfortable layout.
- 1440px (desktop): matches reference image.

### 6. Accessibility check
- Tab through all interactive elements. Focus ring visible?
- Screen reader: all images have alt, all inputs have labels.
- Colour contrast meets WCAG AA.

### 7. Screenshot and compare
Take a screenshot of the built screen and place it next to the reference image.
List any remaining differences and either fix them or note them as known.

### 8. Mark done
- [ ] Colours match tokens
- [ ] Layout matches reference at 1440px
- [ ] No overflow at 360px
- [ ] Keyboard accessible
- [ ] Fractions rendered with KaTeX
- [ ] Motion respects prefers-reduced-motion
- [ ] Component added to the design system route /design-system
