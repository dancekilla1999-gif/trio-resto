#!/usr/bin/env bash
# Сборка: release.txt указывает на manifest в Supabase Storage (sha256 + путь), manifest — на файлы релиза; всё сверяется по sha256
set -euo pipefail
# Если сайт уже лежит в репозитории (public/ и srv/) — собираем из него без скачивания.
# Иначе — как на проде: скачиваем релиз из Supabase Storage по release.txt/srv.txt.
if [ -d public ] && { [ ! -f srv.txt ] || [ -d srv ]; }; then
  echo "OK: собрано из файлов репозитория ($(find public -type f | wc -l) файлов сайта)"; exit 0
fi
BASE="https://qozyihhlocvgpkchyqsp.supabase.co/storage/v1/object/public"
if [ -f release.txt ]; then
  read -r msum mobj < release.txt
  curl -fsSL "$BASE/site/$mobj" -o manifest.txt
  echo "$msum  manifest.txt" | sha256sum -c --quiet -
fi
rm -rf public && mkdir -p public
while read -r sum bk obj path; do
  [ -z "$path" ] && continue
  mkdir -p "public/$(dirname "$path")"
  for i in 1 2 3 4; do curl -fsSL "$BASE/$bk/$obj" -o "public/$path" && break; sleep $((i*2)); done
  echo "$sum  public/$path" | sha256sum -c --quiet -
done < manifest.txt
echo "OK: $(wc -l < manifest.txt) файлов"
