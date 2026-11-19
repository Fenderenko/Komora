"""Komora's manifest for winget (microsoft/winget-pkgs) from a published release.

    python tools/winget_manifest.py 1.0.0

Downloads Komora-<version>.exe of the GitHub release, takes its SHA-256 and writes the three manifest files
(version, installer, en-US locale) into tools/winget/manifests/f/Fenderenko/Komora/<version>/ — the layout of
winget-pkgs. A portable app: winget puts the exe into its own folder and adds the «komora» command.
"""

import hashlib
import pathlib
import sys
import urllib.request

ID = 'Fenderenko.Komora'
REPO = 'Fenderenko/Komora'
SCHEMA = '1.6.0'


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit('usage: winget_manifest.py <version>')
    ver = sys.argv[1].lstrip('v')
    url = f'https://github.com/{REPO}/releases/download/v{ver}/Komora-{ver}.exe'
    req = urllib.request.Request(url, headers={'User-Agent': 'komora-manifest'})
    with urllib.request.urlopen(req, timeout=120) as r:
        data = r.read()
    if data[:2] != b'MZ':
        sys.exit(f'{url}: not a Windows program')
    sha = hashlib.sha256(data).hexdigest().upper()
    out = pathlib.Path(__file__).parent / 'winget' / 'manifests' / 'f' / 'Fenderenko' / 'Komora' / ver
    out.mkdir(parents=True, exist_ok=True)
    head = f'# yaml-language-server: $schema=https://aka.ms/winget-manifest.{{kind}}.{SCHEMA}.schema.json\n\n'
    files = {
        f'{ID}.yaml': ('version', f'''PackageIdentifier: {ID}
PackageVersion: {ver}
DefaultLocale: en-US
ManifestType: version
ManifestVersion: {SCHEMA}
'''),
        f'{ID}.installer.yaml': ('installer', f'''PackageIdentifier: {ID}
PackageVersion: {ver}
InstallerType: portable
Commands:
- komora
ReleaseDate: null
Installers:
- Architecture: x64
  InstallerUrl: {url}
  InstallerSha256: {sha}
ManifestType: installer
ManifestVersion: {SCHEMA}
'''),
        f'{ID}.locale.en-US.yaml': ('defaultLocale', f'''PackageIdentifier: {ID}
PackageVersion: {ver}
PackageLocale: en-US
Publisher: Fenderenko
PublisherUrl: https://github.com/Fenderenko
PublisherSupportUrl: https://github.com/{REPO}/issues
Author: Fenderenko
PackageName: Komora
PackageUrl: https://github.com/{REPO}
License: GPL-3.0
LicenseUrl: https://github.com/{REPO}/blob/main/LICENSE
ShortDescription: Windows app manager — keep your apps and links in one library and move them to a new PC in one click.
Description: |-
  Komora keeps the apps and links you use in one library and brings them back after Windows is reinstalled or on a
  new PC. It installs and updates apps from GitHub, GitLab, Codeberg, download pages and winget, sets up Windows
  tweaks with an undo button and fixes common troubles in one click.
Moniker: komora
Tags:
- app-manager
- package-manager
- installer
- updater
- portable
- winget
- windows-tweaks
- new-pc
ReleaseNotesUrl: https://github.com/{REPO}/releases/tag/v{ver}
ManifestType: defaultLocale
ManifestVersion: {SCHEMA}
'''),
    }
    for name, (kind, body) in files.items():
        body = body.replace('ReleaseDate: null\n', '')
        (out / name).write_text(head.replace('{kind}', kind) + body, encoding='utf-8', newline='\n')
    print(f'{out}\nSHA-256 {sha}')


if __name__ == '__main__':
    main()
