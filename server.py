import http.server
import socketserver
import os
import json
from urllib.parse import urlparse

http.server.SimpleHTTPRequestHandler.extensions_map.update({
    '.avif': 'image/avif',
    '.webp': 'image/webp',
})

def get_db():
    try:
        import pg8000.native
        return pg8000.native.Connection(
            user="postgres.aggwzqrboinhmzaofkwy",
            password="dvBP2jk!J/+bG6s",
            host="aws-0-us-east-2.pooler.supabase.com",
            port=6543,
            database="postgres",
            ssl_context=True,
            timeout=10
        )
    except Exception as e:
        print("[DB Connection Error]", e)
        return None

class ConviteHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        request_path = urlparse(self.path).path.replace('\\', '/')
        if request_path.startswith('/assets/isadora/book/'):
            self.send_header('Cache-Control', 'public, max-age=31536000, immutable')
        else:
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        super().end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'

        try:
            data = json.loads(post_data)
        except Exception:
            data = {}

        if parsed.path == '/api/rsvp':
            db = get_db()
            if db:
                try:
                    name = data.get('nome', '').strip()
                    phone = data.get('telefone', '').strip()
                    attendance = data.get('presenca', 'sim')
                    adults = int(data.get('adultos', 1))
                    kids = int(data.get('criancas', 0))
                    msg = data.get('mensagem', '')
                    db.run(
                        "INSERT INTO public.rsvps (guest_name, guest_phone, attendance, adults, kids, message) VALUES (:name, :phone, :att, :adults, :kids, :msg)",
                        name=name, phone=phone, att=attendance, adults=adults, kids=kids, msg=msg
                    )
                    db.close()
                except Exception as e:
                    print("[RSVP Insert Error]", e)

            response = json.dumps({"success": True, "saved": "database"}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)
            return

        elif parsed.path == '/api/gifts/contribute':
            db = get_db()
            if db:
                try:
                    gift_id = data.get('giftId', '').strip()
                    name = data.get('nome', '').strip()
                    phone = data.get('telefone', '').strip()
                    amount = float(data.get('valor', 0))
                    msg = data.get('mensagem', '')
                    db.run(
                        "INSERT INTO public.gift_contributions (gift_id, guest_name, guest_phone, amount, message, status) VALUES (:gift_id, :name, :phone, :amount, :msg, 'pendente')",
                        gift_id=gift_id, name=name, phone=phone, amount=amount, msg=msg
                    )
                    db.close()
                except Exception as e:
                    print("[Gift Contribution Error]", e)

            response = json.dumps({"success": True, "saved": "database"}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)
            return

        elif parsed.path == '/api/gifts/reserve':
            db = get_db()
            if db:
                try:
                    gift_id = data.get('giftId', '').strip()
                    name = data.get('nome', '').strip()
                    phone = data.get('telefone', '').strip()
                    db.run(
                        "INSERT INTO public.gift_reservations (gift_id, guest_name, guest_phone, status) VALUES (:gift_id, :name, :phone, 'reservado')",
                        gift_id=gift_id, name=name, phone=phone
                    )
                    db.close()
                except Exception as e:
                    print("[Gift Reservation Error]", e)

            response = json.dumps({"success": True, "saved": "database"}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)
            return

        super().do_POST()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/rsvps':
            db = get_db()
            items = []
            if db:
                try:
                    rows = db.run("SELECT guest_name, guest_phone, attendance, adults, kids, message, created_at FROM public.rsvps ORDER BY created_at DESC;")
                    items = [
                        {
                            "nome": r[0],
                            "telefone": r[1],
                            "presenca": r[2],
                            "adultos": r[3],
                            "criancas": r[4],
                            "mensagem": r[5],
                            "data": r[6].isoformat() if r[6] else None
                        }
                        for r in rows
                    ]
                    db.close()
                except Exception as e:
                    print("[RSVP Fetch Error]", e)

            response = json.dumps({"success": True, "count": len(items), "rsvps": items}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)
            return

        super().do_GET()

class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

PORT = 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))

if __name__ == '__main__':
    with ThreadedHTTPServer(("", PORT), ConviteHTTPRequestHandler) as httpd:
        print(f"Servidor ativo em http://localhost:{PORT} com conexao Supabase PostgreSQL integrada.")
        httpd.serve_forever()
