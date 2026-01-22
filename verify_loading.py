from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173")

        # Start the audio engine
        print("Clicking Start...")
        page.click(".start-overlay")

        # Wait for controls to appear
        page.wait_for_selector(".controls-container")

        # Click on Guitar to trigger loading
        # Guitar is the 2nd instrument (index 1)
        print("Clicking Guitar...")

        # We need to find the Guitar button.
        # Based on my code, it has label "Guitar" and icon 🎸
        # I can use the text "Guitar"
        page.click("text=Guitar")

        # Immediately take a screenshot to capture the loading state
        # The delay is 1.5s, so we should catch it easily
        print("Taking screenshot of loading state...")
        # wait a tiny bit to ensure react renders the overlay
        time.sleep(0.1)

        page.screenshot(path="/home/jules/verification/loading_state.png")

        # Check if overlay is visible
        is_visible = page.is_visible(".loading-overlay")
        print(f"Loading overlay visible: {is_visible}")

        if is_visible:
            # Check text content
            text = page.inner_text(".loading-content h2")
            print(f"Loading text: {text}")
            if "Summoning the Guitar" in text:
                print("Text correct!")
            else:
                print("Text incorrect!")

        browser.close()

if __name__ == "__main__":
    run()
