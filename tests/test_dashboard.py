"""
ShipShape Selenium E2E Test
Verifies that the ShipShape frontend is running and displays the dashboard properly.
"""

import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

TARGET_URL = "http://localhost:5173"

def get_driver():
    """Initializes Chrome or Edge WebDriver in headless mode."""
    # 1. Try Chrome first
    try:
        options = ChromeOptions()
        options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--window-size=1280,800")
        driver = webdriver.Chrome(options=options)
        print("[INFO] Using Chrome WebDriver")
        return driver
    except Exception as e:
        print(f"[WARN] Chrome WebDriver not available ({e}), trying Microsoft Edge...")

    # 2. Fallback to Edge
    try:
        edge_options = EdgeOptions()
        edge_options.add_argument("--headless=new")
        edge_options.add_argument("--disable-gpu")
        edge_options.add_argument("--no-sandbox")
        edge_options.add_argument("--window-size=1280,800")
        driver = webdriver.Edge(options=edge_options)
        print("[INFO] Using Edge WebDriver")
        return driver
    except Exception as e:
        print(f"[ERROR] Failed to initialize browser driver: {e}")
        sys.exit(1)

def run_test():
    print(f"\n==================================================")
    print(f"[TEST] Starting ShipShape Selenium Test against {TARGET_URL}")
    print(f"==================================================\n")

    driver = get_driver()
    wait = WebDriverWait(driver, 10)

    try:
        # Step 1: Open the ShipShape web application
        print(f"Navigating to {TARGET_URL}...")
        driver.get(TARGET_URL)

        # Step 2: Verify page title
        wait.until(EC.title_contains("ShipShape"))
        print(f"[PASS] Page title verified: '{driver.title}'")

        # Step 3: Verify the logo text is displayed
        logo = wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "logo-text")))
        assert "ShipShape" in logo.text, f"Expected 'ShipShape' in logo text, got '{logo.text}'"
        print(f"[PASS] Logo verified: '{logo.text}'")

        # Step 4: Verify the Dashboard stat cards load with live data
        stat_cards = wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, "stat-card")))
        print(f"[PASS] Dashboard stat cards verified: {len(stat_cards)} cards present")

        # Step 5: Verify section titles (Recent Projects & Upcoming Releases)
        card_titles = driver.find_elements(By.CLASS_NAME, "card-title")
        titles_text = [t.text for t in card_titles]
        print(f"[INFO] Card sections found: {titles_text}")

        assert any("Recent Projects" in t for t in titles_text), "Recent Projects section missing!"
        assert any("Upcoming Releases" in t for t in titles_text), "Upcoming Releases section missing!"
        print("[PASS] 'Recent Projects' and 'Upcoming Releases' sections verified")

        # Step 6: Save a screenshot for viva evidence
        screenshot_path = "dashboard_selenium_verified.png"
        driver.save_screenshot(screenshot_path)
        print(f"[INFO] Verification screenshot captured and saved to: {screenshot_path}")

        print(f"\n==================================================")
        print(f"[SUCCESS] All Selenium checks PASSED successfully!")
        print(f"==================================================\n")
        return True

    except Exception as err:
        print(f"\n[FAIL] Selenium Test Failed: {err}")
        driver.save_screenshot("selenium_error.png")
        return False
    finally:
        driver.quit()

if __name__ == "__main__":
    success = run_test()
    sys.exit(0 if success else 1)
