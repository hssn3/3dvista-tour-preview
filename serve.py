"""Serve this exported tour on http://127.0.0.1:<free port>/ and open a browser.

Why: Chrome/Edge block WebGL from loading textures over file://, so a tour
opened by double-clicking index.html shows "The file ... could not be accessed".
A tiny local HTTP server fixes it without any dependency.
"""

from __future__ import annotations

import http.server
import os
import socket
import socketserver
import sys
import threading
import webbrowser
from pathlib import Path

HERE = Path(__file__).resolve().parent


def free_port(start: int = 8811) -> int:
    for port in range(start, start + 60):
        with socket.socket() as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise SystemExit("no free port found")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(HERE), **kw)

    def log_message(self, *a):
        pass


def main() -> None:
    port = free_port()
    url = f"http://127.0.0.1:{port}/"
    os.chdir(HERE)
    with socketserver.ThreadingTCPServer(("127.0.0.1", port), Handler) as srv:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
        print(f"Tour: {url}\n(Ctrl+C to stop)")
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    sys.exit(main())
