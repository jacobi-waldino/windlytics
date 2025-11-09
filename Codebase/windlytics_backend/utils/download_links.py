import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

def download_files_from_html(html_path, output_dir, base_url=None):
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Read the HTML file
    with open(html_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    # Find all <a> tags with href
    links = [a["href"] for a in soup.find_all("a", href=True)]

    for link in links:
        # Handle relative URLs if base_url is provided
        file_url = urljoin(base_url, link) if base_url else link

        # Get the filename from the URL
        filename = os.path.basename(file_url.split("?")[0])
        if not filename:
            continue  # skip invalid links

        print(f"Downloading: {file_url}")
        try:
            response = requests.get(file_url)
            response.raise_for_status()
            file_path = os.path.join(output_dir, filename)
            with open(file_path, "wb") as f:
                f.write(response.content)
            print(f"✔ Saved to {file_path}")
        except Exception as e:
            print(f"❌ Failed to download {file_url}: {e}")

if __name__ == "__main__":
    # Example usage:
    # python download_links.py input.html downloads https://example.com/
    import sys
    if len(sys.argv) < 3:
        print("Usage: python download_links.py <html_file> <output_dir> [base_url]")
    else:
        html_file = sys.argv[1]
        output_dir = sys.argv[2]
        base_url = sys.argv[3] if len(sys.argv) > 3 else None
        download_files_from_html(html_file, output_dir, base_url)
