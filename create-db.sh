export PGHOST=postgres
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=postgres
export PGDATABASE=gpao

if  ! psql --host=$PGHOST --username=$PGUSER -lqt | cut -d \| -f 1 | grep -qw $PGDATABASE; then
    createdb --host=$PGHOST --username=$PGUSER $PGDATABASE
    psql --host=$PGHOST --username=$PGUSER --dbname=$PGDATABASE -f sql/postgres.sql
fi