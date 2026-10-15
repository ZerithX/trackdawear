# TrackDaWear API

TrackDaWear adalah REST API untuk mencatat inventaris dan peminjaman peralatan organisasi. Aplikasi ini dibuat sebagai Tugas 1 Study Club Backend Intermediate dengan fokus pada Dockerfile, Docker Compose, integrasi API–database, dan persistensi data PostgreSQL.

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

API tersedia di `http://localhost:3000`.

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

Data yang sama tetap tersedia karena PostgreSQL menggunakan named volume.

> Jangan memakai `docker compose down -v` saat pengujian persistensi karena opsi `-v` menghapus volume dan seluruh data development.

## Menjalankan Tanpa Container API

```bash
docker compose up -d db
bun install
bun run db:migrate
bun run dev
```

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

- Dokumentasi Bun, Hono, Drizzle ORM, Docker, dan official PostgreSQL image
- AI digunakan untuk mendiskusikan scope proyek, struktur backend, konfigurasi Docker, pengujian, dan dokumentasi. Seluruh saran ditinjau, disesuaikan, dan diuji oleh penulis.
