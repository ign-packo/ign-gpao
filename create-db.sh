export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=postgres
export PGDATABASE=gpao

if  ! psql --username=$PGUSER -lqt | cut -d \| -f 1 | grep -qw $PGDATABASE; then
    createdb --username=$PGUSER $PGDATABASE
    psql --username=$PGUSER --dbname=$PGDATABASE -f sql/postgres.sql
fi