import os
import re
import urllib.request
import urllib.error
from html.parser import HTMLParser

class AssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.images = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'a' and 'href' in attrs_dict:
            self.links.append(attrs_dict['href'])
        elif tag == 'img' and 'src' in attrs_dict:
            self.images.append(attrs_dict['src'])
        elif tag == 'link' and 'href' in attrs_dict:
            self.links.append(attrs_dict['href'])

def verify():
    html_path = 'index.html'
    if not os.path.exists(html_path):
        print(f"[ERROR] {html_path} not found.")
        return False

    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    parser = AssetParser()
    parser.feed(content)

    print(f"Parsed {len(parser.links)} links and {len(parser.images)} images.")

    errors = 0

    # Verify Images
    print("\n--- Verifying Images ---")
    for img in set(parser.images):
        if img.startswith('http://') or img.startswith('https://'):
            # External Image
            try:
                req = urllib.request.Request(img, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=5) as response:
                    print(f"[OK] External image: {img} (Status: {response.status})")
            except Exception as e:
                print(f"[ERROR] Broken external image: {img} ({e})")
                errors += 1
        else:
            # Local Image
            # Remove leading slash if any
            clean_path = img.lstrip('/').split('?')[0].split('#')[0]
            if os.path.exists(clean_path):
                print(f"[OK] Local image: {img}")
            else:
                print(f"[ERROR] Missing local image: {img} (Path resolved: {os.path.abspath(clean_path)})")
                errors += 1

    # Verify Links (only http/https and exclude anchors)
    print("\n--- Verifying Hyperlinks ---")
    for link in set(parser.links):
        if link.startswith('#'):
            # Anchor link, skip HTTP verify but check if target exists
            anchor = link[1:]
            if anchor == '':
                continue
            # Simple check if target ID exists in html
            if f'id="{anchor}"' in content or f"id='{anchor}'" in content or f'name="{anchor}"' in content:
                print(f"[OK] Anchor link: {link}")
            else:
                print(f"[WARNING] Potential broken anchor link: {link} (Target ID not found)")
        elif link.startswith('http://') or link.startswith('https://'):
            # External Link
            try:
                # Some sites block Python UA, use Mozilla
                req = urllib.request.Request(link, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=5) as response:
                    print(f"[OK] External link: {link} (Status: {response.status})")
            except urllib.error.HTTPError as e:
                # Some sites return 403/405 for scripts but are valid, treat as warning unless 404
                if e.code == 404:
                    print(f"[ERROR] Broken link (404): {link}")
                    errors += 1
                else:
                    print(f"[WARNING] Link returned status {e.code}: {link}")
            except Exception as e:
                print(f"[WARNING] Could not verify link: {link} ({e})")
        else:
            # Local file link
            clean_path = link.lstrip('/').split('?')[0].split('#')[0]
            if os.path.exists(clean_path) or link == '':
                print(f"[OK] Local link: {link}")
            else:
                print(f"[ERROR] Broken local link: {link}")
                errors += 1

    print("\n--- Summary ---")
    if errors == 0:
        print("Web Quality Audit passed successfully! No errors found.")
        return True
    else:
        print(f"Audit failed with {errors} error(s).")
        return False

if __name__ == '__main__':
    verify()
