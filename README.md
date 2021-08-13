# Cara Penggunaan

1. Install [Docker](https://docs.docker.com/get-docker/)
2. Pastikan Docker sudah terinstall

   ```console
    $ docker -v
    Docker version 19.03.1, build 74b1e89e8a
   ```

3. Jalankan docker-compose up -d

   ```console
   $ docker-compose up -d
   Creating network "namaproject_default" with the default driver
   Creating postgres ... done
   Creating redis    ... done
   Creating adminer  ... done
   ```

4. Untuk Menghentikan Container

   ```console
   docker-compose down
   ```

5. Untuk Menjalankan Container Tertentu, contoh hanya mau menjalankan container postgres saja

   ```console
   docker-compose up -d postgres
   ```

## Postgres

```env
USER : developer
PASSWORD : supersecretpassword
```

- Akses CLI Postgres

```console
docker exec -it postgres sh
```

- Buat database postgres

```console
/# createdb -U developer notesapp
```

- Connect ke database

```console
/# psql -U developer -d notesapp
```

- Berikan hak akses ke user developer

```console
/# GRANT ALL PRIVILEGES ON DATABASE notesapp TO developer;
```

- Link Command PSQL [Link](https://www.postgresqltutorial.com/psql-commands/)

## Adminer

Untuk Management Database Postgres

- Akses melalui browser

```console
localhost:8090
```

## RabbitMQ

Untuk Management Queue RabbitMQ

- Akses melalui browser

```console
localhost:5672
```
