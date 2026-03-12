from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")

        # Click start overlay
        page.locator(".start-overlay").click()

        # Wait for main interface
        page.wait_for_selector(".main-interface")

        # Wait for loading overlay to disappear
        page.wait_for_selector(".loading-overlay", state="hidden")

        # Take screenshot of the initial state with Metronome
        page.screenshot(path="verification_metronome.png", full_page=True)

        # Toggle metronome
        metronome_btn = page.locator(".metronome-controls button")
        metronome_btn.click()

        # Wait a bit
        page.wait_for_timeout(500)

        # Change BPM
        bpm_slider = page.locator(".metronome-controls input[type='range']")
        bpm_slider.fill("160")

        # Take screenshot of toggled state
        page.screenshot(path="verification_metronome_active.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run()
