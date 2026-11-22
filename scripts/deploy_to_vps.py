import requests
import json
import subprocess
import time

def get_token():
    cmd = [
        "docker", "exec", "mini-vps-backend-1", "python3", "-c",
        'from app.core.security import create_access_token; import json; print(create_access_token({"sub": "035f2226-4cbf-4a66-956c-5e6e75e93619"}))'
    ]
    return subprocess.check_output(cmd).decode().strip()

def main():
    token = get_token()
    print("Generated token:", token[:20], "...")

    url = "http://127.0.0.1:8000/api/apps/deploy/git"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    data = {
        "name": "design-flow",
        "git_url": "https://github.com/josapratama/design-flow.git",
        "git_branch": "main",
        "project_type": "dockerfile",
        "description": "DesignFlow Studio - Dual-way Visual & Code Canvas with Polyglot Hub i18n",
        "auto_create_database": "false"
    }

    print("Deploying app design-flow from Git...")
    resp = requests.post(url, headers=headers, data=data)
    print("Status:", resp.status_code)
    try:
        res_json = resp.json()
        print("Response:", json.dumps(res_json, indent=2))
        app_id = res_json.get("id")
        if app_id:
            print(f"\nMonitoring deployment for app ID {app_id}...")
            for _ in range(60):
                time.sleep(3)
                poll_resp = requests.get(f"http://127.0.0.1:8000/api/apps/{app_id}", headers=headers)
                if poll_resp.status_code == 200:
                    app_info = poll_resp.json()
                    status = app_info.get("status")
                    port = app_info.get("external_port")
                    domain = app_info.get("subdomain")
                    print(f"Status: {status} | Port: {port} | Domain: {domain}")
                    if status in ["running", "failed", "crashed"]:
                        break
    except Exception as e:
        print("Raw text:", resp.text)

if __name__ == "__main__":
    main()
