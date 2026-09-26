#!/bin/bash
# Dev server launcher — fully detached, survives parent shell exit
cd /home/z/my-project
export DATABASE_URL="postgresql://postgres.yhqgogsednnarjfspado:AJ9J8PM4iS2q8D0C@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
export DIRECT_URL="postgresql://postgres.yhqgogsednnarjfspado:AJ9J8PM4iS2q8D0C@aws-0-ap-northeast-1.supabase.com:5432/postgres?sslmode=require"
export JWT_SECRET="f8Torv3csTSc+GFaIOxzyvu74tpz0vzcSjudKHYpRb9Efburdq0KzeyT0pzulEMo"
export NODE_ENV="development"
exec ./node_modules/.bin/next dev -p 3000
