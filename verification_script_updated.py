from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    print("Navigating to app...")
    page.goto("http://localhost:5173")
    page.wait_for_timeout(1000)

    print("Waiting for start overlay...")
    page.wait_for_selector('.start-overlay', state='visible', timeout=10000)
    page.wait_for_timeout(500)

    print("Clicking start...")
    page.locator('.start-btn').click(force=True)
    page.wait_for_timeout(1000)

    print("Waiting for main interface...")
    page.wait_for_selector('.main-interface', state='visible', timeout=10000)

    print("Waiting for initial loading overlay to disappear...")
    page.wait_for_selector('.loading-overlay', state='hidden', timeout=30000)
    page.wait_for_timeout(1000)

    print("Checking Metronome Controls...")
    # Find the new Metronome 'Start' button
    page.get_by_role("button", name="⏱️ Start").click()
    page.wait_for_timeout(2000)

    # Adjust BPM
    bpm_slider = page.locator('.bpm-controls input[type="range"]')
    bpm_slider.fill('150')
    page.wait_for_timeout(2000)

    # Stop Metronome
    page.get_by_role("button", name="⏱️ Stop").click()
    page.wait_for_timeout(1000)

    page.screenshot(path="/home/jules/verification/screenshots/verification.png")

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            record_video_size={"width": 1280, "height": 720}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
