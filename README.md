```bash
npx eslint . --fix
npx prettier --write .
wrk -t12 -c400 -d10s http://localhost:3000
```

<https://www.iana.org/assignments/http-fields/http-fields.xhtml>

### 📁 Certificate Structure

Make sure you have:

- `cert.pem` – your SSL certificate.
- `key.pem` – your private key.

You can generate a self-signed certificate using OpenSSL:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365
```

## SHOW FILE

```sh
find dist -type f
```

If you need a complete list in JSON format to replace the `files` array in `package.json`, run:

```sh
node -e "console.log(JSON.stringify({ files: require('fs').readdirSync('dist', { recursive: true }).map(f => 'dist/' + f) }, null, 2))"
```

1. optional ->
   /_
   If path is `/api/animals/:type?` it will return:
   [`/api/animals`, `/api/animals/:type`]
   in other cases it will return null
   _/

2. remove unnesasray

```ts
wrk -t12 -c400 -d10s http://localhost:3000
autocannon -c 100 -d 20 http://localhost:3000
```

```ts
// Tezx
wrk -t12 -c400 -d10s http://localhost:3002
Running 10s test @ http://localhost:3002
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     5.52ms  615.18us  14.15ms   83.73%
    Req/Sec     6.01k   680.34    17.30k    97.34%
  720215 requests in 10.10s, 85.17MB read
Requests/sec:  71341.89
Transfer/sec:      8.44MB
// Expressjs with bun
wrk -t12 -c400 -d10s http://localhost:3000
Running 10s test @ http://localhost:3000
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    12.50ms    2.55ms  73.34ms   92.92%
    Req/Sec     2.66k   273.14     3.31k    70.08%
  318190 requests in 10.02s, 61.90MB read
Requests/sec:  31761.98
Transfer/sec:      6.18MB
// express with node
 wrk -t12 -c400 -d10s http://localhost:3000
Running 10s test @ http://localhost:3000
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    51.08ms  136.27ms   2.00s    97.34%
    Req/Sec   839.07    400.15     2.88k    74.15%
  86348 requests in 10.10s, 20.67MB read
  Socket errors: connect 0, read 0, write 0, timeout 222
Requests/sec:   8549.13
Transfer/sec:      2.05MB
```

1. remove ctx.send
3. add
