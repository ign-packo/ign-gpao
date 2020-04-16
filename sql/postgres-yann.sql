CREATE TABLE chantiers 
	(id SERIAL PRIMARY KEY,
	nom VARCHAR (30),
	status VARCHAR (16),
	priorite INT);

CREATE TABLE ressources
	(id SERIAL PRIMARY KEY,
	nom VARCHAR(30),
	status VARCHAR (16),
	version VARCHAR (16),
	command VARCHAR,
	espace VARCHAR,
	id_chantier INTEGER REFERENCES chantiers(id) );

CREATE TABLE jobs
	(id SERIAL PRIMARY KEY,
	nom VARCHAR(30),
	command VARCHAR,
	status VARCHAR(30),
	log_file VARCHAR,
       	return_code INT,
	start_date TIMESTAMPTZ,
	end_date TIMESTAMPTZ,
	id_chantier INTEGER REFERENCES chantiers(id) );


CREATE TABLE dep_jobs_jobs
	(id SERIAL PRIMARY KEY,
	from_id INTEGER REFERENCES jobs(id),
       	to_id INTEGER REFERENCES jobs(id),
       	active BOOLEAN);

CREATE OR REPLACE FUNCTION update_dependency()
  RETURNS trigger AS
$$
BEGIN
  IF (NEW.status = 'DONE' AND NEW.status <> OLD.status) THEN
       UPDATE dep_jobs_jobs SET active='f' WHERE from_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_job_status()
  RETURNS trigger AS
$$
BEGIN
    UPDATE jobs 
    SET status='READY' 
    WHERE 
    status='DONE' 
    AND NOT EXISTS (
        SELECT * FROM dep_jobs_jobs WHERE  jobs.id = dep_jobs_jobs.from_id and dep_jobs_jobs.active = 't');  
        -- Pas besoin de retourner un element puisqu on est sur un EACH STATEMENT
        -- c est a dire la fonction n est pas declenchee pour chaque ligne modifiee
        -- mais une fois pour toute commande modifiant la table
        -- ca peut faire une grosse difference puisqu on modifie la table avec
        -- des commandes du type : UPDATE dep_jobs_jobs SET active='f' WHERE from_id = NEW.id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION notify_status_change()
  RETURNS trigger AS
$BODY$
    BEGIN
        PERFORM pg_notify('notify_status_change', row_to_json(NEW)::text);
        RETURN NULL;
    END; 
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- on ne declenche le trigger que pour des modifs sur status
CREATE TRIGGER job_changes
	BEFORE UPDATE OF status ON jobs
	FOR EACH ROW
	EXECUTE PROCEDURE update_dependency();

-- on ne declenche le trigger que pour des modifs sur active
-- on ne declenche pas pour chaque ligne modifee
-- mais une fois pour chaque commande ayant modife la colonne active
CREATE TRIGGER dependency_changes
	AFTER UPDATE OF active ON dep_jobs_jobs
	FOR EACH STATEMENT
	EXECUTE PROCEDURE update_job_status();

CREATE TRIGGER notify_status_change
 	AFTER UPDATE OF status
  	ON  public.jobs
  	FOR EACH ROW
  	EXECUTE PROCEDURE notify_status_change();


-- On ajoute un chantier 
INSERT INTO chantiers (nom, status, priorite) VALUES ('PARIS-NIVA', 'READY', 1);
INSERT INTO chantiers (nom, status, priorite) VALUES ('PARIS-VEG', 'READY', 2);
INSERT INTO chantiers (nom, status, priorite) VALUES ('PARIS-MNE', 'READY', 3);
INSERT INTO chantiers (nom, status, priorite) VALUES ('PARIS-ORTHO', 'READY', 4);

-- On ajoute des ressources
INSERT INTO ressources (nom ,status ,version ,command, espace, id_chantier) VALUES ('RESSOURCE_NIVA',  'WAITING', '0.0.1', 'COMMAND', 'ESPACE', 1); 
INSERT INTO ressources (nom ,status ,version ,command, espace, id_chantier) VALUES ('RESSOURCE_VEG',   'WAITING', '0.0.1', 'COMMAND', 'ESPACE', 2); 
INSERT INTO ressources (nom ,status ,version ,command, espace, id_chantier) VALUES ('RESSOURCE_MNE',   'WAITING', '0.0.1', 'COMMAND', 'ESPACE', 3); 
INSERT INTO ressources (nom ,status ,version ,command, espace, id_chantier) VALUES ('RESSOURCE_ORTHO', 'WAITING', '0.0.1', 'COMMAND', 'ESPACE', 4); 

-- On ajoute des jobs
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_1','dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 1);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_2', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 1);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_3', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 1);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_4', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 1);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_5', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 1);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_5', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 1);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_7', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 1);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_8', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 1);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_9', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 1);
--
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_10', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 2);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_11', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 2);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_12', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 2);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_13', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 2);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_14', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 2);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_15', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 2);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_16', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 2);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_17', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 2);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_18', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 2);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_19', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 2);
--
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_20', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 3);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_21', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 3);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_22', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 3);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_23', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 3);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_24', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 3);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_25', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 3);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_26', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 3);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_27', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 3);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_28', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 3);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_29', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 3);
--
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_30', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 4);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_31', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 4);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_32', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 4);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_33', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 4);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_34', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 4);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_35', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 4);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_36', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 4);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_37', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 4);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_38', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 4);
INSERT INTO jobs (nom, command, status, log_file, return_code, start_date, end_date, id_chantier) VALUES ('JOB_39', 'dir', 'WAITING', '', 0, 'NOW()', 'NOW()', 4);
--
-- On ajoute une dependance jobs/jobs
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (1, 2, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (1, 3, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (1, 4, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (1, 5, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (1, 6, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (1, 7, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (1, 8, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (1, 9, 't');
--
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (10, 11, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (10, 12, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (10, 13, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (10, 14, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (10, 15, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (10, 16, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (10, 17, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (10, 18, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (10, 19, 't');
--
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (20, 21, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (20, 22, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (20, 23, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (20, 24, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (20, 25, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (20, 26, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (20, 27, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (20, 28, 't');
INSERT INTO dep_jobs_jobs (from_id, to_id, active) VALUES (20, 29, 't');

---- Etat intial
-- echo Etat initial
SELECT * FROM jobs ORDER BY id;
SELECT * FROM dep_jobs_jobs ORDER BY id;
