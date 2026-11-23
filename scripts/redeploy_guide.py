import requests
import subprocess
import time

def get_token():
    cmd = [
        "ssh", "-o", "StrictHostKeyChecking=no", "ubuntu@192.168.100.184",
        "docker exec mini-vps-backend-1 python3 -c 'from app.core.security import create_access_token; print(create_access_token({\"sub\": \"035f2226-4cbf-4a66-956c-5e6e75e93619\"}))'"
    ]
    return subprocess.check_output(cmd).decode().strip()

def main():
    token = get_token()
    print("Token obtained successfully.")
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch app list from mini-vps on 192.168.100.184:8000
    list_url = "http://192.168.100.184:8000/api/apps"
    try:
        resp = requests.get(list_url, headers=headers)
        apps = resp.json().get("apps", [])
    except Exception as e:
        print("Error fetching apps directly, trying via ssh...", e)
        return

    guide_app = None
    for a in apps:
        if "guide" in a.get("name", "").lower():
            guide_app = a
            print(f"Found candidate: {a.get('name')} (ID: {a.get('id')})")
            if a.get("name") == "guidepath":
                break

    if guide_app:
        app_id = guide_app["id"]
        print(f"Triggering redeploy for {guide_app['name']} ({app_id})...")
        redeploy_url = f"http://192.168.100.184:8000/api/apps/{app_id}/redeploy"
        redeploy_resp = requests.post(redeploy_url, headers=headers)
        print("Response:", redeploy_resp.status_code, redeploy_resp.text)
    else:
        print("No guide app found.")

if __name__ == "__main__":
    main()
