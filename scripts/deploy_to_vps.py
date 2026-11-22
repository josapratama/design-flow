import requests
import json
import subprocess
import time

def get_token():
    cmd = [
        "docker", "exec", "mini-vps-backend-1", "python3", "-c",
        'from app.core.security import create_access_token; print(create_access_token({"sub": "035f2226-4cbf-4a66-956c-5e6e75e93619"}))'
    ]
    return subprocess.check_output(cmd).decode().strip()

def main():
    token = get_token()
    print("Generated token:", token[:20], "...")
    headers = {"Authorization": f"Bearer {token}"}

    # Check if design-flow already exists
    list_resp = requests.get("http://127.0.0.1:8000/api/apps", headers=headers)
    existing_app = None
    if list_resp.status_code == 200:
        for app in list_resp.json().get("apps", []):
            if app.get("name") == "design-flow":
                existing_app = app
                break

    if existing_app:
        app_id = existing_app["id"]
        print(f"Redeploying existing app design-flow ({app_id})...")
        resp = requests.post(f"http://127.0.0.1:8000/api/apps/{app_id}/redeploy", headers=headers)
        print("Redeploy status:", resp.status_code, resp.text)
    else:
        url = "http://127.0.0.1:8000/api/apps/deploy/git"
        data = {
            "name": "design-flow",
            "git_url": "https://github.com/josapratama/design-flow.git",
            "git_branch": "main",
            "project_type": "dockerfile",
            "description": "DesignFlow Studio - Dual-way Visual & Code Canvas with Polyglot Hub i18n",
            "auto_create_database": "false"
        }
        print("Deploying new app design-flow from Git...")
        resp = requests.post(url, headers=headers, data=data)
        print("Status:", resp.status_code)
        app_id = resp.json().get("id")

    if app_id:
        print(f"\nMonitoring deployment for app ID {app_id}...")
        for i in range(60):
            time.sleep(3)
            poll_resp = requests.get(f"http://127.0.0.1:8000/api/apps/{app_id}", headers=headers)
            if poll_resp.status_code == 200:
                app_info = poll_resp.json()
                status = app_info.get("status")
                port = app_info.get("external_port")
                print(f"[{i+1}] Status: {status} | Port: {port}")
                if i >= 2 and status in ["running", "failed", "crashed"]:
                    break

if __name__ == "__main__":
    main()
