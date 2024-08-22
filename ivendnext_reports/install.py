import subprocess
import os


def after_install():
    app_path = os.path.dirname(os.path.abspath(__file__))  # Get the app directory path
    nodejs_dir = os.path.join(app_path, "NodejsDataAdapters")
    node_modules_path = os.path.join(nodejs_dir, "node_modules")

    if not os.path.exists(node_modules_path):  # Check if node_modules doesn't exist
        try:
            subprocess.check_call(
                ["npm", "install"], cwd=nodejs_dir
            )  # Change cwd to NodejsDataAdapters
            print("npm install completed successfully.")
        except subprocess.CalledProcessError as e:
            print(f"npm install failed with error: {e}")
