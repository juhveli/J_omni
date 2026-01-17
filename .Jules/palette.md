## 2024-03-20 - Hybrid Interaction for Low-Latency Audio
**Learning:** For audio applications where low latency is critical, `onPointerDown` is preferred over `onClick` for mouse/touch. However, this breaks keyboard accessibility.
**Action:** Use a hybrid pattern: `onPointerDown` with `e.preventDefault()` for pointer events (prevents click), and a separate `onClick` handler that calls the same logic for keyboard activation (Enter/Space).

## 2024-03-20 - Toggle Button State
**Learning:** Custom toggle buttons (styled as divs/buttons) often lack state communication for screen readers.
**Action:** Use `aria-pressed={isActive}` on the button element to communicate the "on/off" or "selected" state clearly without complex ARIA roles if they are simple toggles.
