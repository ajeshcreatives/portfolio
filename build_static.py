"""Convert the original ZIP export to editable, relative-path HTML pages.

Run from this folder only if you want to regenerate the pages. This overwrites
index.html, 404.html, and case-study/*.html; the original export remains in the ZIP.
"""

from pathlib import Path
import re
import zipfile


ROOT = Path(__file__).resolve().parent
ARCHIVE = ROOT.parent / "ajeshcreatives-static-website.zip"
PROJECT_IDS = (
    "home-health-web",
    "fitora-virtual-room",
    "well-care-health",
    "b-mates-branding",
    "prajna-arts",
    "desi-dabba",
    "logo-collection-identity",
)


def convert(source: str, at_root: bool, is_home: bool) -> str:
    source = re.sub(r"<script\b[^>]*>.*?</script>", "", source, flags=re.S | re.I)
    source = re.sub(r'<link\b(?=[^>]*\bas="script")[^>]*?/?>', "", source)
    source = re.sub(r"<!-- -->", "", source)
    source = re.sub(r'\sstyle="opacity:0;transform:[^"]*"', "", source)
    source = re.sub(
        r'<link rel="stylesheet" href="/_next/static/css/[^"]+"[^>]*?/?>',
        '<link rel="stylesheet" href="' + ("styles.css" if at_root else "../styles.css") + '">',
        source,
    )
    source = source.replace('href="/images/', 'href="' + ("" if at_root else "../") + "images/")
    source = source.replace('src="/images/', 'src="' + ("" if at_root else "../") + "images/")
    if is_home:
        source = re.sub(
            r"(<article\b.*?</article>)",
            replace_project_buttons,
            source,
            flags=re.S,
        )
        source = source.replace(
            "</head>", '<link rel="stylesheet" href="static-overrides.css"></head>'
        )
        source = source.replace(
            "</body>", '<script src="project-data.js" defer></script>'
            '<script src="static.js" defer></script></body>'
        )
    else:
        source = source.replace('href="/#works"', 'href="../index.html#works"')

    source = source.replace("<head>", "<head>\n")
    source = re.sub(r"(?=<(?:meta|link|title)\b)", "\n", source)
    # Only split at block boundaries: adding whitespace inside inline text can
    # otherwise change displayed copy.
    source = re.sub(
        r"(<(?:/)?(?:html|head|body|header|nav|main|section|article|footer|div|form)\b)",
        r"\n\1",
        source,
    )
    source = re.sub(r"\n{2,}", "\n", source)
    return source.strip() + "\n"


project_index = 0


def replace_project_buttons(match: re.Match[str]) -> str:
    global project_index
    project_id = PROJECT_IDS[project_index]
    project_index += 1
    html = match.group(1)
    href = f"case-study/{project_id}.html"
    return re.sub(
        r'<button([^>]*)>(?=(?:(?!</button>).)*(?:Inspect Case Study|Case Study Overview))'
        r'(.*?)</button>',
        lambda button: f'<a{button.group(1)} href="{href}">{button.group(2)}</a>',
        html,
        flags=re.S,
    )


with zipfile.ZipFile(ARCHIVE) as archive:
    for name in ["index.html", "404.html", *(f"case-study/{id}.html" for id in PROJECT_IDS)]:
        raw = archive.read(name).decode("utf-8")
        (ROOT / name).write_text(
            convert(raw, "/" not in name, name == "index.html"), encoding="utf-8"
        )

    css_name = next(
        name for name in archive.namelist()
        if name.startswith("_next/static/css/") and name.endswith(".css")
    )
    (ROOT / "styles.css").write_bytes(archive.read(css_name))

assert project_index == len(PROJECT_IDS), "Project list and HTML no longer match"
