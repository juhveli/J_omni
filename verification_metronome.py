from playwright.sync_api import sync_playwright

def run_cuj(page):
    print("Navigating to app...")
    page.goto("http://localhost:5175")
    page.wait_for_timeout(500)

    print("Clicking start...")
    page.locator(".start-btn").click(force=True)
    page.wait_for_timeout(1000)

    print("Looking for Metronome OFF button...")
    metronome_btn = page.locator("button").filter(has_text="⏱️ Metronome OFF")
    metronome_btn.wait_for(state="visible", timeout=10000)
    page.wait_for_timeout(500)

    print("Clicking Metronome...")
    metronome_btn.click()
    page.wait_for_timeout(500)

    print("Looking for Metronome ON button...")
    page.locator("button").filter(has_text="⏱️ Metronome ON").wait_for(state="visible", timeout=10000)

    print("Taking screenshot...")
    page.screenshot(path="/home/jules/verification/screenshots/verification_metronome.png")
    page.wait_for_timeout(2000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            context.close()
            browser.close()
