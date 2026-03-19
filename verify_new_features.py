from playwright.sync_api import sync_playwright

def verify_feature(page):
    # Navigate to app
    page.goto("http://localhost:5175")
    page.wait_for_timeout(500)

    # Click start button to initialize audio
    start_btn = page.locator(".start-btn")
    start_btn.click(force=True)
    page.wait_for_timeout(1000)

    # Click Play tab
    page.locator(".tab-btn").filter(has_text="Play").click()
    page.wait_for_timeout(500)

    # Click Metronome to toggle it ON
    metronome_btn = page.locator(".control-btn").filter(has_text="⏱️ Metronome")
    metronome_btn.click(force=True)
    page.wait_for_timeout(1000)

    # Adjust volume slider
    volume_slider = page.locator("input[type='range']").nth(1) # Assuming first is BPM, second is Volume
    if volume_slider.is_visible():
        volume_slider.fill("50")
    page.wait_for_timeout(1000)

    # Take screenshot of the new UI elements
    page.screenshot(path="verification_new_features.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="verification_video")
        page = context.new_page()
        try:
            verify_feature(page)
        finally:
            context.close()
            browser.close()
