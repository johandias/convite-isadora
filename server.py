import http.server
import socketserver
import os
import json
import uuid
from urllib.parse import urlparse, parse_qs

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
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def send_json(self, status, payload):
        response = json.dumps(payload, default=str).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response)))
        self.end_headers()
        self.wfile.write(response)

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'

        try:
            data = json.loads(post_data)
        except Exception:
            data = {}

        # 1. Enviar Confirmação de Presença (RSVP)
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
            return self.send_json(200, {"success": True, "saved": "database"})

        # 2. Contribuição Pix de Presente
        elif parsed.path == '/api/gifts/contribute':
            db = get_db()
            if db:
                try:
                    gift_id = data.get('giftId', '').strip()
                    name = data.get('nome', '').strip()
                    phone = data.get('telefone', '').strip()
                    amount = float(data.get('valor', 0))
                    msg = data.get('mensagem', '')
                    receipt = data.get('comprovante', '')
                    db.run(
                        "INSERT INTO public.gift_contributions (gift_id, guest_name, guest_phone, amount, message, receipt_url, status) VALUES (:gift_id, :name, :phone, :amount, :msg, :receipt, 'pendente')",
                        gift_id=gift_id, name=name, phone=phone, amount=amount, msg=msg, receipt=receipt
                    )
                    # Atualiza valor arrecadado no presente
                    db.run(
                        "UPDATE public.gifts SET arrecadado = COALESCE(arrecadado, 0) + :amount, updated_at = NOW() WHERE id = :gift_id",
                        amount=amount, gift_id=gift_id
                    )
                    db.close()
                except Exception as e:
                    print("[Gift Contribution Error]", e)
            return self.send_json(200, {"success": True, "saved": "database"})

        # 3. Reserva de Presente Unitário
        elif parsed.path == '/api/gifts/reserve':
            db = get_db()
            if db:
                try:
                    gift_id = data.get('giftId', '').strip()
                    name = data.get('nome', '').strip()
                    phone = data.get('telefone', '').strip()
                    today = data.get('data', '')
                    db.run(
                        "INSERT INTO public.gift_reservations (gift_id, guest_name, guest_phone, status) VALUES (:gift_id, :name, :phone, 'reservado')",
                        gift_id=gift_id, name=name, phone=phone
                    )
                    db.run(
                        "UPDATE public.gifts SET status = 'reservado', reservado_nome = :name, reservado_telefone = :phone, reservado_data = :today, updated_at = NOW() WHERE id = :gift_id",
                        name=name, phone=phone, today=today, gift_id=gift_id
                    )
                    db.close()
                except Exception as e:
                    print("[Gift Reservation Error]", e)
            return self.send_json(200, {"success": True, "saved": "database"})

        # 4. Criar ou Atualizar Presente (Admin)
        elif parsed.path == '/api/gifts':
            db = get_db()
            if db:
                try:
                    gift_id = data.get('id', '').strip() or f"gift-{uuid.uuid4().hex[:8]}"
                    titulo = data.get('titulo', '').strip()
                    descricao = data.get('descricao', '').strip()
                    categoria = data.get('categoria', 'Geral').strip()
                    tipo = data.get('tipo', 'pessoal').strip()
                    imagem = data.get('imagem', '').strip()
                    link_loja = data.get('linkLoja', '').strip()
                    valor_total = float(data.get('valorTotal', 0))
                    valor_cota = float(data.get('valorCota', 50))
                    arrecadado = float(data.get('arrecadado', 0))
                    status = data.get('status', 'disponivel')

                    db.run("""
                        INSERT INTO public.gifts (id, titulo, descricao, categoria, tipo, imagem, link_loja, valor_total, valor_cota, arrecadado, status, updated_at)
                        VALUES (:id, :tit, :desc, :cat, :tipo, :img, :link, :vt, :vc, :arrec, :st, NOW())
                        ON CONFLICT (id) DO UPDATE SET
                            titulo = EXCLUDED.titulo,
                            descricao = EXCLUDED.descricao,
                            categoria = EXCLUDED.categoria,
                            tipo = EXCLUDED.tipo,
                            imagem = EXCLUDED.imagem,
                            link_loja = EXCLUDED.link_loja,
                            valor_total = EXCLUDED.valor_total,
                            valor_cota = EXCLUDED.valor_cota,
                            status = EXCLUDED.status,
                            updated_at = NOW();
                    """, id=gift_id, tit=titulo, desc=descricao, cat=categoria, tipo=tipo, img=imagem, link=link_loja, vt=valor_total, vc=valor_cota, arrec=arrecadado, st=status)
                    db.close()
                except Exception as e:
                    print("[Gift Upsert Error]", e)
                    return self.send_json(500, {"success": False, "error": str(e)})
            return self.send_json(200, {"success": True, "saved": "database"})

        # 5. Atualizar Localização da Festa (Admin)
        elif parsed.path == '/api/location':
            db = get_db()
            if db:
                try:
                    db.run("""
                        UPDATE public.event_location SET
                            venue_name = :vname,
                            address = :addr,
                            neighborhood = :neigh,
                            city = :city,
                            state = :state,
                            zip_code = :zip,
                            reference = :ref,
                            google_maps_url = :gmaps,
                            waze_url = :waze,
                            uber_url = :uber,
                            map_embed_url = :embed,
                            updated_at = NOW()
                        WHERE id = 'main';
                    """,
                        vname=data.get('nome', '').strip(),
                        addr=data.get('endereco', '').strip(),
                        neigh=data.get('bairro', '').strip(),
                        city=data.get('cidade', '').strip(),
                        state=data.get('estado', '').strip(),
                        zip=data.get('cep', '').strip(),
                        ref=data.get('referencia', '').strip(),
                        gmaps=data.get('googleMapsUrl', '').strip(),
                        waze=data.get('wazeUrl', '').strip(),
                        uber=data.get('uberUrl', '').strip(),
                        embed=data.get('mapEmbedUrl', '').strip()
                    )
                    db.close()
                except Exception as e:
                    print("[Location Update Error]", e)
                    return self.send_json(500, {"success": False, "error": str(e)})
            return self.send_json(200, {"success": True, "saved": "database"})

        # 6. Atualizar Informações do Evento & Pix (Admin)
        elif parsed.path == '/api/info':
            db = get_db()
            if db:
                try:
                    db.run("""
                        UPDATE public.event_info SET
                            child_name = :cname,
                            child_full_name = :cfullname,
                            age_title = :age,
                            theme = :theme,
                            event_date = :edate,
                            event_weekday = :weekday,
                            event_time = :etime,
                            event_full_date_text = :fulltext,
                            rsvp_deadline = :deadline,
                            whatsapp_contact = :wpp,
                            pix_key = :pixkey,
                            pix_key_type = :pixtype,
                            pix_beneficiary = :pixben,
                            pix_bank = :pixbank,
                            updated_at = NOW()
                        WHERE id = 'main';
                    """,
                        cname=data.get('nome', '').strip(),
                        cfullname=data.get('nomeCompleto', '').strip(),
                        age=data.get('idade', '').strip(),
                        theme=data.get('tema', '').strip(),
                        edate=data.get('data', '').strip(),
                        weekday=data.get('diaDaSemana', '').strip(),
                        etime=data.get('horario', '').strip(),
                        fulltext=data.get('dataTextoCompleto', '').strip(),
                        deadline=data.get('dataLimiteRsvp', '').strip(),
                        wpp=data.get('whatsapp', '').strip(),
                        pixkey=data.get('chavePix', '').strip(),
                        pixtype=data.get('tipoChavePix', '').strip(),
                        pixben=data.get('titularPix', '').strip(),
                        pixbank=data.get('bancoPix', '').strip()
                    )
                    db.close()
                except Exception as e:
                    print("[Info Update Error]", e)
                    return self.send_json(500, {"success": False, "error": str(e)})
            return self.send_json(200, {"success": True, "saved": "database"})

        # 7. Login / Verificação de Senha do Admin
        elif parsed.path == '/api/admin/verify':
            pwd = data.get('password', '').strip()
            db = get_db()
            is_valid = (pwd == 'isadora1ano') # padrão
            if db:
                try:
                    rows = db.run("SELECT admin_password FROM public.event_info WHERE id = 'main';")
                    if rows and rows[0][0]:
                        is_valid = (pwd == rows[0][0])
                    db.close()
                except Exception as e:
                    print("[Admin Verify Error]", e)
            return self.send_json(200, {"valid": is_valid})

        super().do_POST()

    def do_GET(self):
        parsed = urlparse(self.path)

        # 1. Obter Lista de Confirmações (RSVP)
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
            return self.send_json(200, {"success": True, "count": len(items), "rsvps": items})

        # 2. Obter Lista de Presentes do Banco
        elif parsed.path == '/api/gifts':
            db = get_db()
            items = []
            if db:
                try:
                    rows = db.run("SELECT id, titulo, descricao, categoria, tipo, imagem, link_loja, valor_total, valor_cota, arrecadado, status, reservado_nome, reservado_telefone, reservado_data FROM public.gifts ORDER BY created_at ASC;")
                    # Busca contribuições para cada presente
                    contrib_rows = db.run("SELECT gift_id, guest_name, amount, message, created_at, receipt_url FROM public.gift_contributions ORDER BY created_at DESC;")
                    contrib_map = {}
                    for c in contrib_rows:
                        gid = c[0]
                        if gid not in contrib_map:
                            contrib_map[gid] = []
                        contrib_map[gid].append({
                            "nome": c[1],
                            "valor": float(c[2]) if c[2] else 0,
                            "mensagem": c[3],
                            "data": c[4].isoformat() if c[4] else None,
                            "comprovante": c[5]
                        })

                    items = [
                        {
                            "id": r[0],
                            "titulo": r[1],
                            "descricao": r[2],
                            "categoria": r[3],
                            "tipo": r[4],
                            "imagem": r[5],
                            "linkLoja": r[6],
                            "valorTotal": float(r[7]) if r[7] else 0,
                            "valorCota": float(r[8]) if r[8] else 50,
                            "arrecadado": float(r[9]) if r[9] else 0,
                            "status": r[10],
                            "reservadoPor": {
                                "nome": r[11],
                                "telefone": r[12],
                                "data": r[13]
                            } if r[11] else None,
                            "contribuicoes": contrib_map.get(r[0], [])
                        }
                        for r in rows
                    ]
                    db.close()
                except Exception as e:
                    print("[Gifts Fetch Error]", e)
            return self.send_json(200, {"success": True, "gifts": items})

        # 3. Obter Localização da Festa
        elif parsed.path == '/api/location':
            db = get_db()
            loc = None
            if db:
                try:
                    rows = db.run("SELECT venue_name, address, neighborhood, city, state, zip_code, reference, google_maps_url, waze_url, uber_url, map_embed_url FROM public.event_location WHERE id = 'main';")
                    if rows:
                        r = rows[0]
                        loc = {
                            "nome": r[0],
                            "endereco": r[1],
                            "bairro": r[2],
                            "cidade": r[3],
                            "estado": r[4],
                            "cep": r[5],
                            "referencia": r[6],
                            "googleMapsUrl": r[7],
                            "wazeUrl": r[8],
                            "uberUrl": r[9],
                            "mapEmbedUrl": r[10]
                        }
                    db.close()
                except Exception as e:
                    print("[Location Fetch Error]", e)
            return self.send_json(200, {"success": True, "local": loc})

        # 4. Obter Configurações do Evento & Pix
        elif parsed.path == '/api/info':
            db = get_db()
            info = None
            if db:
                try:
                    rows = db.run("SELECT child_name, child_full_name, age_title, theme, event_date, event_weekday, event_time, event_full_date_text, rsvp_deadline, whatsapp_contact, pix_key, pix_key_type, pix_beneficiary, pix_bank FROM public.event_info WHERE id = 'main';")
                    if rows:
                        r = rows[0]
                        info = {
                            "nome": r[0],
                            "nomeCompleto": r[1],
                            "idade": r[2],
                            "tema": r[3],
                            "data": r[4],
                            "diaDaSemana": r[5],
                            "horario": r[6],
                            "dataTextoCompleto": r[7],
                            "dataLimiteRsvp": r[8],
                            "whatsapp": r[9],
                            "chavePix": r[10],
                            "tipoChavePix": r[11],
                            "titularPix": r[12],
                            "bancoPix": r[13]
                        }
                    db.close()
                except Exception as e:
                    print("[Info Fetch Error]", e)
            return self.send_json(200, {"success": True, "info": info})

        super().do_GET()

    def do_DELETE(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith('/api/gifts'):
            query = parse_qs(parsed.query)
            gift_id = query.get('id', [None])[0]
            if gift_id:
                db = get_db()
                if db:
                    try:
                        db.run("DELETE FROM public.gifts WHERE id = :id", id=gift_id)
                        db.close()
                    except Exception as e:
                        print("[Gift Delete Error]", e)
                        return self.send_json(500, {"success": False, "error": str(e)})
            return self.send_json(200, {"success": True, "deleted": gift_id})
        self.send_response(404)
        self.end_headers()

class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

PORT = 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))

if __name__ == '__main__':
    with ThreadedHTTPServer(("", PORT), ConviteHTTPRequestHandler) as httpd:
        print(f"Servidor ativo em http://localhost:{PORT} com conexao Supabase PostgreSQL integrada.")
        httpd.serve_forever()
