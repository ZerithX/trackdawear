# TrackDaWear API

For Reviewer Task 2 Check From Lines 181

TrackDaWear adalah REST API untuk mencatat inventaris dan peminjaman peralatan organisasi.

## Tech Stack

- TypeScript dan Bun
- Hono
- Zod
- PostgreSQL 18
- Drizzle ORM dan Drizzle Kit
- Docker dan Docker Compose

## Prasyarat

- Docker Desktop dengan Docker Compose
- Bun hanya diperlukan jika ingin menjalankan aplikasi tanpa container

## Setup Environment

Salin `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Pada PowerShell:

```powershell
Copy-Item .env.example .env
```

Nilai bawaan ditujukan hanya untuk development lokal. Jangan menyimpan kredensial asli di repository.

## Menjalankan dengan Docker Compose

```bash
docker compose up --build -d
docker compose ps
```

Status yang diharapkan:

- `db`: running dan healthy
- `migrate`: exited dengan code 0
- `api`: running

Lihat log API:

```bash
docker compose logs -f api
```

API tersedia di `http://localhost:8080/api`.

## Service Compose

- `db` menjalankan PostgreSQL dan menyimpan data pada named volume `postgres_data`.
- `migrate` menunggu database sehat lalu menjalankan migration Drizzle.
- `api` menunggu migration berhasil lalu menjalankan Hono di port 3000. 

API menggunakan hostname `db`, bukan `localhost`, untuk mengakses PostgreSQL melalui jaringan internal Compose.

## Endpoint

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/health` | Memeriksa API dan koneksi database |
| POST | `/users` | Membuat user |
| GET | `/users` | Melihat user |
| POST | `/categories` | Membuat kategori |
| GET | `/categories` | Melihat kategori |
| GET | `/categories/:id` | Detail kategori |
| POST | `/assets` | Membuat asset |
| GET | `/assets` | Melihat dan memfilter asset |
| GET | `/assets/:id` | Detail asset |
| PATCH | `/assets/:id` | Mengubah asset |
| POST | `/loans` | Meminjam asset |
| GET | `/loans` | Melihat dan memfilter loan |
| POST | `/loans/:id/return` | Mengembalikan asset |

Filter asset: `status` dan `categoryId`. Filter loan: `active`, `overdue`, dan `userId`.

## Contoh Pengujian

### Health check

```bash
curl http://localhost:3000/health
```

### Membuat user

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Radya","email":"radya@example.com"}'
```

### Membuat kategori

```bash
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics","description":"Electronic equipment"}'
```

Salin `id` kategori dari response, kemudian buat asset:

```bash
curl -X POST http://localhost:3000/assets \
  -H "Content-Type: application/json" \
  -d '{"categoryId":"CATEGORY_UUID","name":"Projector Epson","assetCode":"PRJ-001"}'
```

Salin `id` user dan asset, lalu buat loan dengan waktu yang masih berada di masa depan:

```bash
curl -X POST http://localhost:3000/loans \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_UUID","assetId":"ASSET_UUID","dueAt":"2030-12-31T23:59:59.000Z"}'
```

## Pengujian Persistensi

1. Buat minimal satu user, kategori, dan asset melalui API.
2. Pastikan data dapat dibaca:

   ```bash
   curl http://localhost:3000/assets
   ```

3. Hapus container dan network tanpa menghapus volume:

   ```bash
   docker compose down
   ```

4. Buat ulang container:

   ```bash
   docker compose up -d
   ```

5. Baca kembali data:

   ```bash
   curl http://localhost:3000/assets
   ```

> Jangan memakai `docker compose down -v` saat pengujian persistensi karena opsi `-v` menghapus volume dan seluruh data development.

Dalam mode ini `DATABASE_URL` menggunakan `localhost:5432`. Di dalam Compose, URL database dioverride agar menggunakan hostname `db`.

## Pemeriksaan Proyek

```bash
bun run typecheck
bun test
bun run db:check
docker compose config
```

## Menghentikan Aplikasi

```bash
docker compose down
```

Untuk menghapus seluruh data development secara sengaja:

```bash
docker compose down -v
```

Data yang sama tetap tersedia karena PostgreSQL menggunakan named volume.


## Nginx Gateway (Tugas 2)

### Cara menjalankan
```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
```
API diakses lewat `http://localhost:8080/api/...` (contoh: `/api/health`).

### Bukti
#### Load balancing
```bash
$ for i in 1 2 3 4 5 6; do curl -s -o /dev/null -D - localhost:8080/api/health | grep -i x-upstream; done
X-Upstream: 172.22.0.4:3000
X-Upstream: 172.22.0.3:3000
X-Upstream: 172.22.0.5:3000
X-Upstream: 172.22.0.4:3000
X-Upstream: 172.22.0.3:3000
X-Upstream: 172.22.0.5:3000
```
#### Rate limit
```bash
$ for i in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}\n" localhost:8080/api/health; done | sort | uniq -c
     19 200
     11 429
```
#### Header keamanan & gzip
```bash
$ curl -s -D - -o /dev/null -H "Accept-Encoding: gzip" localhost:8080/api/users
HTTP/1.1 200 OK
Server: nginx/1.31.8
Date: Thu, 12 Nov 2026 15:11:53 GMT
Content-Type: application/json
Transfer-Encoding: chunked
Connection: keep-alive
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-Upstream: 172.22.0.3:3000
Content-Encoding: gzip
```
#### Port backend & database tidak bisa diakses
```bash
$ docker compose ps
NAME             IMAGE                   COMMAND                  SERVICE  CREATED          STATUS                    PORTS
trackdawear-db   postgres:18-alpine      "docker-entrypoint.s…"   db  11 minutes ago   Up 11 minutes (healthy)   5432/tcp
tugas1-api-1     trackdawear-api:local   "/usr/local/bin/dock…"   api  11 minutes ago   Up 11 minutes             3000/tcp
tugas1-api-2     trackdawear-api:local   "/usr/local/bin/dock…"   api  11 minutes ago   Up 11 minutes             3000/tcp
tugas1-api-3     trackdawear-api:local   "/usr/local/bin/dock…"   api  11 minutes ago   Up 11 minutes             3000/tcp
tugas1-nginx-1   nginx:1.31.8-alpine     "/docker-entrypoint.…"   nginx  11 minutes ago   Up 11 minutes             0.0.0.0:8080->80/tcp, [::]:8080->80/tcp

$ curl -m 3 localhost:3000/health
curl: (7) Failed to connect to localhost port 3000 after 2254 ms: Could not connect to server

$ curl -m 3 localhost:5432
curl: (7) Failed to connect to localhost port 5432 after 2256 ms: Could not connect to server
```

### Pertanyaan
**(a) Kenapa upstream perlu zone?** 

Karena zone ya sharing memori bersama biar semua proses worknya berbagi state upstream yang sama. Kalau dihapus, setiap work atau kerjanya bakal ngetrack statenya sendiri-sendiri dan fitur resolve gabakal work karena dia butuh zone.

**(b) Kenapa limit_req_status 429?** 

Ya karena 429 itu responsenya Too Many Requests. Tapi secara default emang nginx rejects pake response 503 Service Unavailable, yang dimana servernya rusak/broken bisa dibilang. Jadi ya harus di set ke 429 biar nanti monitoring logs dan dari sisi client juga bisa tau masalahnya apa saat pertamakali encounter.

**(c) Kenapa backend & db tanpa ports?** 

For security purpose, jadi backend dan db ga bisa ke "reach" dari host ataupun internet. Jadi untuk mengakses appnya harus melewati nginx dulu. Nginx menjangkau backendnya melalui docker compose internal network dan di case repo gwehj menggunakan nama service api, yang dimana docker dns (127.0.0.11) resolve ke IP replika

## Struktur Singkat

```text
src/
├── config/       Environment validation
├── db/           Drizzle client dan schema
├── middleware/   Global error handler
├── modules/      Feature-based routes, schemas, dan services
└── shared/       Error dan response helpers
```

## Referensi dan Bantuan

- Dokumentasi Docker dan official PostgreSQL image
- AI digunakan untuk mendiskusikan konfigurasi Docker, pengujian, dan dokumentasi. Seluruh saran ditinjau, disesuaikan, dan diuji oleh penulis.
