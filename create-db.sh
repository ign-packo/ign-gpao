export PGHOST=localhost
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=postgres
export PGDATABASE=gpao

if  ! psql -lqt | cut -d \| -f 1 | grep -qw $PGDATABASE; then
    createdb gpao
    psql -f sql/postgres.sql
fi