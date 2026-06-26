from playwright.sync_api import sync_playwright
import os
import shutil

def run_cuj(page):
    # Go to app
    page.goto("http://localhost:5173")
    page.wait_for_timeout(500)

    # Click start overlay
    page.click(".start-overlay")
    page.wait_for_timeout(500)

    # Wait for loading to finish (if any)
    page.wait_for_selector(".controls-container")

    # Start Metronome
    page.click("text=⏱️ Start")
    page.wait_for_timeout(1000)

    # Change BPM by adjusting slider
    # First we need to find the slider in the Metronome section
    # Let's take a screenshot while it is running
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

    # Stop Metronome
    page.click("text=⏱️ Stop")
    page.wait_for_timeout(500)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
