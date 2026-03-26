import re
from playwright.sync_api import Playwright, sync_playwright, expect

def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1280, 'height': 800}, record_video_dir="/home/jules/verification/video")
    page = context.new_page()

    try:
        page.goto("http://localhost:5175/")
        page.wait_for_timeout(500)

        # Click start button
        page.locator(".start-btn").click(force=True)
        page.wait_for_timeout(1000)

        # Verify initial state of MIDI button
        midi_btn = page.locator("button:has-text('🔌 MIDI OFF')")
        expect(midi_btn).to_be_visible()
        page.wait_for_timeout(500)

        # Click MIDI button (which should trigger a request for MIDI access, though Playwright headless might auto-deny or error, so we just test the click and its immediate visual result or error handling if possible. Since we can't easily mock MIDI in Playwright easily here, we'll just take a screenshot of the layout with the new button).

        # We will screenshot the new button's presence.
        page.screenshot(path="verification_midi.png")
        page.wait_for_timeout(1000)

    finally:
        context.close()
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
